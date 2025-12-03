"use client";

import { useState } from "react";
import { useStorage, useMutation } from "@/lib/liveblocks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Circle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import type { RetrospectiveItemStorage } from "@/lib/liveblocks";

type ExtendedItem = RetrospectiveItemStorage & {
  discussionNotes?: string;
  isDiscussed?: boolean;
};

type Props = {
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

export function DiscussionView({ disabled }: Props) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const items = useStorage((root) => root.items) as ExtendedItem[] | null;
  const votes = useStorage((root) => root.votes);

  // Sort items by vote count
  const sortedItems = [...(items || [])].sort((a, b) => {
    const aVotes = votes?.[a.id]?.length || 0;
    const bVotes = votes?.[b.id]?.length || 0;
    if (bVotes !== aVotes) return bVotes - aVotes;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Discussie Items
        </h2>
        <p className="text-sm text-slate-500">
          {sortedItems.length} items gesorteerd op stemmen
        </p>
      </div>

      {sortedItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Er zijn nog geen items om te bespreken.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedItems.map((item, index) => (
            <DiscussionItem
              key={item.id}
              item={item}
              rank={index + 1}
              voteCount={votes?.[item.id]?.length || 0}
              isExpanded={expandedItem === item.id}
              onToggle={() =>
                setExpandedItem(expandedItem === item.id ? null : item.id)
              }
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type DiscussionItemProps = {
  item: ExtendedItem;
  rank: number;
  voteCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

function DiscussionItem({
  item,
  rank,
  voteCount,
  isExpanded,
  onToggle,
  disabled,
}: DiscussionItemProps) {
  const [notes, setNotes] = useState("");

  const updateItem = useMutation(
    ({ storage }, updates: { discussionNotes?: string; isDiscussed?: boolean }) => {
      const currentItems = storage.get("items") as ExtendedItem[];
      const updatedItems = currentItems.map((i) =>
        i.id === item.id ? { ...i, ...updates } : i
      );
      storage.set("items", updatedItems);
    },
    [item.id]
  );

  const handleSaveNotes = () => {
    updateItem({ discussionNotes: notes });
  };

  const handleToggleDiscussed = () => {
    updateItem({ isDiscussed: !item.isDiscussed });
  };

  return (
    <Card className={item.isDiscussed ? "border-green-300 dark:border-green-700" : ""}>
      <CardHeader
        className="cursor-pointer py-3"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-900">
              {rank}
            </div>
            <Badge className={categoryColors[item.category]}>
              {categoryLabels[item.category]}
            </Badge>
            <Badge variant="outline">{voteCount} stemmen</Badge>
            {item.isDiscussed && (
              <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                <CheckCircle className="h-3 w-3" />
                Besproken
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-slate-700 dark:text-slate-300">{item.content}</p>

        {!item.isAnonymous && item.authorName && (
          <p className="mt-2 text-xs text-slate-400">Door: {item.authorName}</p>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4 dark:border-slate-700">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                <MessageSquare className="mr-1 inline h-4 w-4" />
                Discussie notities
              </label>
              <Textarea
                placeholder="Noteer hier de discussiepunten en besluiten..."
                value={notes || item.discussionNotes || ""}
                onChange={(e) => setNotes(e.target.value)}
                disabled={disabled}
                className="min-h-[100px]"
              />
              {!disabled && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={handleSaveNotes}
                >
                  Opslaan
                </Button>
              )}
            </div>

            {!disabled && (
              <Button
                variant={item.isDiscussed ? "outline" : "default"}
                onClick={handleToggleDiscussed}
                className="gap-2"
              >
                {item.isDiscussed ? (
                  <>
                    <Circle className="h-4 w-4" />
                    Markeer als niet besproken
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Markeer als besproken
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
