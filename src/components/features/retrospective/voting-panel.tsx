"use client";

import { useStorage, useMutation } from "@/lib/liveblocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ItemCard } from "./item-card";

type Props = {
  maxVotes: number;
  disabled?: boolean;
};

const categoryLabels = {
  went_well: "Ging Goed",
  to_improve: "Kan Beter",
  action_item: "Actiepunten",
};

const categoryColors = {
  went_well: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  to_improve: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
  action_item: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
};

export function VotingPanel({ maxVotes, disabled }: Props) {
  const items = useStorage((root) => root.items);
  const votes = useStorage((root) => root.votes);

  const userInfo =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem("scrumkit-user") || '{"id":"","name":"Anoniem"}'
        )
      : { id: "", name: "Anoniem" };

  // Count user's votes
  const userVoteCount = Object.values(votes || {}).reduce((count, voters) => {
    return count + voters.filter((v) => v === userInfo.id).length;
  }, 0);

  const remainingVotes = maxVotes - userVoteCount;

  const addVote = useMutation(({ storage }, itemId: string) => {
    const currentVotes = storage.get("votes");
    const itemVotes = currentVotes[itemId] || [];
    storage.set("votes", {
      ...currentVotes,
      [itemId]: [...itemVotes, userInfo.id],
    });
  }, []);

  const removeVote = useMutation(({ storage }, itemId: string) => {
    const currentVotes = storage.get("votes");
    const itemVotes = currentVotes[itemId] || [];
    const userVoteIndex = itemVotes.lastIndexOf(userInfo.id);
    if (userVoteIndex !== -1) {
      const newItemVotes = [...itemVotes];
      newItemVotes.splice(userVoteIndex, 1);
      storage.set("votes", {
        ...currentVotes,
        [itemId]: newItemVotes,
      });
    }
  }, []);

  // Sort items by vote count
  const sortedItems = [...(items || [])].sort((a, b) => {
    const aVotes = votes?.[a.id]?.length || 0;
    const bVotes = votes?.[b.id]?.length || 0;
    if (bVotes !== aVotes) return bVotes - aVotes;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const hasVotedForItem = (itemId: string) => {
    return (votes?.[itemId] || []).includes(userInfo.id);
  };

  return (
    <div className="space-y-6">
      {/* Vote counter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Jouw stemmen
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {remainingVotes}{" "}
                <span className="text-sm font-normal text-slate-500">
                  van {maxVotes} over
                </span>
              </p>
            </div>
            <Progress
              value={(userVoteCount / maxVotes) * 100}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items to vote on */}
      <div className="space-y-4">
        {sortedItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Er zijn nog geen items om op te stemmen.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Rank indicator */}
              <div className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                {index + 1}
              </div>

              <Card>
                <CardContent className="pt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className={categoryColors[item.category]}>
                      {categoryLabels[item.category]}
                    </Badge>
                  </div>
                  <ItemCard
                    item={item}
                    voteCount={votes?.[item.id]?.length || 0}
                    showVotes={true}
                    onVote={() => addVote(item.id)}
                    onUnvote={() => removeVote(item.id)}
                    hasVoted={hasVotedForItem(item.id)}
                    votingDisabled={disabled || remainingVotes <= 0}
                  />
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
