"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useStorage, useMutation } from "@/lib/liveblocks";
import { PresenceAvatars } from "@/components/features/shared/presence-avatars";
import { BoardColumn } from "./board-column";
import { VotingPanel } from "./voting-panel";
import { DiscussionView } from "./discussion-view";
import { ReportTab } from "./report-tab";
import type { RetrospectiveSession } from "@/lib/db";
import type { Storage } from "@/lib/liveblocks";

type Props = {
  session: RetrospectiveSession;
};

const phaseLabels: Record<Storage["phase"], string> = {
  input: "Input Fase",
  voting: "Stem Fase",
  discussion: "Discussie Fase",
  completed: "Afgerond",
};

export function RetrospectiveBoard({ session }: Props) {
  const [activeTab, setActiveTab] = useState("board");
  const phase = useStorage((root) => root.phase);

  const setPhase = useMutation(({ storage }, newPhase: Storage["phase"]) => {
    storage.set("phase", newPhase);
  }, []);

  const handleNextPhase = () => {
    if (phase === "input") setPhase("voting");
    else if (phase === "voting") setPhase("discussion");
    else if (phase === "discussion") setPhase("completed");
  };

  const handlePreviousPhase = () => {
    if (phase === "voting") setPhase("input");
    else if (phase === "discussion") setPhase("voting");
    else if (phase === "completed") setPhase("discussion");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {session.name}
            </h1>
            {session.sprintName && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {session.sprintName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {phaseLabels[phase || "input"]}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPhase}
                  disabled={phase === "input"}
                >
                  Vorige
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPhase}
                  disabled={phase === "completed"}
                >
                  Volgende
                </Button>
              </div>
            </div>
            <PresenceAvatars />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="board">Bord</TabsTrigger>
            <TabsTrigger value="voting">Stemmen</TabsTrigger>
            <TabsTrigger value="discussion">Discussie</TabsTrigger>
            <TabsTrigger value="report">Rapport</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-0">
            <div className="grid gap-6 md:grid-cols-3">
              <BoardColumn
                category="went_well"
                title="Ging Goed"
                color="green"
                disabled={phase !== "input"}
              />
              <BoardColumn
                category="to_improve"
                title="Kan Beter"
                color="orange"
                disabled={phase !== "input"}
              />
              <BoardColumn
                category="action_item"
                title="Actiepunten"
                color="blue"
                disabled={phase !== "input"}
              />
            </div>
          </TabsContent>

          <TabsContent value="voting" className="mt-0">
            <VotingPanel
              maxVotes={session.votesPerUser || 5}
              disabled={phase !== "voting"}
            />
          </TabsContent>

          <TabsContent value="discussion" className="mt-0">
            <DiscussionView disabled={phase !== "discussion"} />
          </TabsContent>

          <TabsContent value="report" className="mt-0">
            <ReportTab sessionId={session.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
