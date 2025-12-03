import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/lib/db/schema";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const db = drizzle(pool, { schema });

interface TestCard {
  content: string;
  authorName: string | null;
  isAnonymous?: boolean;
}

const testCards: Record<"went_well" | "to_improve" | "action_item", TestCard[]> = {
  went_well: [
    {
      content: "De daily standups waren dit sprint veel efficiënter",
      authorName: "Jan",
    },
    {
      content: "Goede samenwerking tussen frontend en backend team",
      authorName: "Pieter",
    },
    {
      content: "We hebben alle sprint goals gehaald!",
      authorName: "Marieke",
    },
    {
      content: "Code reviews waren snel en constructief",
      authorName: null,
      isAnonymous: true,
    },
    {
      content: "De nieuwe CI/CD pipeline werkt uitstekend",
      authorName: "Sophie",
    },
  ],
  to_improve: [
    {
      content: "Te veel context switching door ad-hoc verzoeken",
      authorName: "Jan",
    },
    {
      content: "Documentatie loopt achter op de code",
      authorName: "Pieter",
    },
    {
      content: "Sprint planning duurde te lang (3 uur!)",
      authorName: null,
      isAnonymous: true,
    },
    {
      content: "Onvoldoende tijd voor technische schuld",
      authorName: "Marieke",
    },
    {
      content: "Communicatie met stakeholders kan beter",
      authorName: "Sophie",
    },
  ],
  action_item: [
    {
      content: "Tijdslimiet van 2 uur instellen voor sprint planning",
      authorName: "Jan",
    },
    {
      content: "Documentatie-uurtje inplannen elke vrijdag",
      authorName: "Pieter",
    },
    {
      content: "Ad-hoc verzoeken via Jira laten lopen",
      authorName: "Marieke",
    },
  ],
};

interface LiveblocksItem {
  id: string;
  category: "went_well" | "to_improve" | "action_item";
  content: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
}

async function createLiveblocksRoom(roomId: string) {
  const secretKey = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secretKey) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is niet geconfigureerd");
  }

  const response = await fetch("https://api.liveblocks.io/v2/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: roomId,
      defaultAccesses: ["room:write"],
    }),
  });

  // Room may already exist, that's fine
  if (!response.ok && response.status !== 409) {
    const errorText = await response.text();
    throw new Error(`Liveblocks room creation fout: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function initializeLiveblocksRoom(roomId: string, items: LiveblocksItem[], votes: Record<string, string[]>) {
  const secretKey = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secretKey) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is niet geconfigureerd");
  }

  // First create the room
  await createLiveblocksRoom(roomId);

  const storage = {
    liveblocksType: "LiveObject",
    data: {
      items: {
        liveblocksType: "LiveList",
        data: items,
      },
      votes: {
        liveblocksType: "LiveObject",
        data: votes,
      },
      phase: "input",
      report: {
        liveblocksType: "LiveObject",
        data: {
          content: null,
          isGenerating: false,
          generatedAt: null,
        },
      },
    },
  };

  const response = await fetch(
    `https://api.liveblocks.io/v2/rooms/${encodeURIComponent(roomId)}/storage`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storage),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Liveblocks storage fout: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function createTestSession() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  console.log("🚀 Test retrospective sessie aanmaken...\n");

  // Maak sessie aan in database
  const [session] = await db
    .insert(schema.retrospectiveSessions)
    .values({
      name: "Test Retrospective",
      sprintName: "Sprint 42 - Test",
      votesPerUser: 5,
      hideVotesUntilComplete: false,
    })
    .returning();

  console.log(`✅ Sessie aangemaakt: ${session.name}`);
  console.log(`   ID: ${session.id}`);

  // Bouw items voor Liveblocks EN database
  const liveblocksItems: LiveblocksItem[] = [];
  const testUsers = ["jan", "pieter", "marieke", "sophie", "tom"];

  for (const [category, cards] of Object.entries(testCards)) {
    for (const card of cards) {
      const itemId = crypto.randomUUID();
      const authorId = card.authorName?.toLowerCase().replace(/\s/g, "-") || "anoniem";

      liveblocksItems.push({
        id: itemId,
        category: category as "went_well" | "to_improve" | "action_item",
        content: card.content,
        authorId: authorId,
        authorName: card.isAnonymous ? "Anoniem" : (card.authorName || "Anoniem"),
        isAnonymous: card.isAnonymous || false,
        createdAt: new Date().toISOString(),
      });

      // Ook in database zetten voor rapport generatie
      await db.insert(schema.retrospectiveItems).values({
        id: itemId,
        sessionId: session.id,
        category: category as "went_well" | "to_improve" | "action_item",
        content: card.content,
        authorId: authorId,
        authorName: card.isAnonymous ? null : card.authorName,
        isAnonymous: card.isAnonymous || false,
      });
    }
  }

  console.log(`✅ ${liveblocksItems.length} testkaarten toegevoegd (Liveblocks + database)`);
  console.log(`   - ${testCards.went_well.length} "Wat ging goed"`);
  console.log(`   - ${testCards.to_improve.length} "Wat kan beter"`);
  console.log(`   - ${testCards.action_item.length} "Actiepunten"\n`);

  // Genereer willekeurige stemmen
  const liveblocksVotes: Record<string, string[]> = {};
  let totalVotes = 0;

  for (const item of liveblocksItems) {
    // Elke kaart krijgt 0-3 stemmen
    const numVotes = Math.floor(Math.random() * 4);
    const shuffledUsers = [...testUsers].sort(() => Math.random() - 0.5);
    const usersWhoVoted = shuffledUsers.slice(0, numVotes);

    if (usersWhoVoted.length > 0) {
      liveblocksVotes[item.id] = usersWhoVoted;
      totalVotes += usersWhoVoted.length;

      // Ook stemmen in database zetten
      for (const oderId of usersWhoVoted) {
        await db.insert(schema.votes).values({
          itemId: item.id,
          userId: oderId,
        });
      }
    }
  }

  console.log(`✅ ${totalVotes} stemmen toegevoegd (Liveblocks + database)\n`);

  // Initialiseer Liveblocks room storage
  const roomId = `retrospective-${session.id}`;

  try {
    await initializeLiveblocksRoom(roomId, liveblocksItems, liveblocksVotes);
    console.log(`✅ Liveblocks room geïnitialiseerd: ${roomId}\n`);
  } catch (error) {
    console.error(`⚠️  Kon Liveblocks room niet initialiseren: ${error}`);
    console.log("   De sessie is aangemaakt maar zonder testkaarten.\n");
  }

  const shareableLink = `${appUrl}/retrospective/${session.id}`;

  console.log("═".repeat(60));
  console.log("\n🔗 SESSIE URL:\n");
  console.log(`   ${shareableLink}\n`);
  console.log("═".repeat(60));
  console.log("\n💡 Tip: Open deze URL in meerdere browsers/tabs om");
  console.log("   real-time samenwerking te testen!\n");

  await pool.end();
}

createTestSession().catch((error) => {
  console.error("❌ Fout bij aanmaken test sessie:", error);
  process.exit(1);
});
