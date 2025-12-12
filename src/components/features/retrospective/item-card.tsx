"use client";

import { Trash2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RetrospectiveItemStorage } from "@/lib/liveblocks";

type Props = {
  item: RetrospectiveItemStorage;
  voteCount: number;
  onDelete?: () => void;
  onVote?: () => void;
  onUnvote?: () => void;
  hasVoted?: boolean;
  showVotes?: boolean;
  disabled?: boolean;
  votingDisabled?: boolean;
};

export function ItemCard({
  item,
  voteCount,
  onDelete,
  onVote,
  onUnvote,
  hasVoted,
  showVotes = true,
  disabled,
  votingDisabled,
}: Props) {
  const userInfo =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem("scrumkit-user") || '{"id":"","name":"Anoniem"}'
        )
      : { id: "", name: "Anoniem" };

  const isOwner = item.authorId === userInfo.id;

  return (
    <Card className="group relative">
      <CardContent className="p-3">
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {item.content}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showVotes && (
              <Badge variant="secondary" className="gap-1">
                <ThumbsUp className="h-3 w-3" />
                {voteCount}
              </Badge>
            )}
            {!item.isAnonymous && item.authorName && (
              <span className="text-xs text-slate-400">
                {item.authorName}
                {isOwner && " (jij)"}
              </span>
            )}
            {item.isAnonymous && (
              <span className="text-xs text-slate-400 italic">Anoniem</span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {showVotes && onVote && !votingDisabled && (
              <Button
                variant={hasVoted ? "default" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={hasVoted ? onUnvote : onVote}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
            )}
            {isOwner && onDelete && !disabled && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
