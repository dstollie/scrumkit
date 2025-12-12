"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useStorage, useMutation } from "@/lib/liveblocks";
import type { RetrospectiveItemStorage } from "@/lib/liveblocks";
import { ItemCard } from "./item-card";

type Category = "went_well" | "to_improve" | "action_item";

type Props = {
  category: Category;
  title: string;
  color: "green" | "orange" | "blue";
  disabled?: boolean;
};

const colorClasses = {
  green: {
    header: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-800 dark:text-green-200",
  },
  orange: {
    header: "bg-orange-100 dark:bg-orange-900/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-800 dark:text-orange-200",
  },
  blue: {
    header: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-200",
  },
};

export function BoardColumn({
  category,
  title,
  color,
  disabled,
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemContent, setNewItemContent] = useState("");

  const items = useStorage((root) =>
    root.items.filter((item) => item.category === category)
  );

  const votes = useStorage((root) => root.votes);

  const addItem = useMutation(
    ({ storage }, content: string) => {
      const userInfo =
        typeof window !== "undefined"
          ? JSON.parse(
              localStorage.getItem("scrumkit-user") ||
                '{"id":"","name":"Anoniem"}'
            )
          : { id: "", name: "Anoniem" };

      const newItem: RetrospectiveItemStorage = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category,
        content,
        authorId: userInfo.id,
        authorName: userInfo.name,
        isAnonymous: false,
        createdAt: new Date().toISOString(),
      };

      const currentItems = storage.get("items");
      storage.set("items", [...currentItems, newItem]);
    },
    [category]
  );

  const deleteItem = useMutation(({ storage }, itemId: string) => {
    const currentItems = storage.get("items");
    storage.set(
      "items",
      currentItems.filter((item) => item.id !== itemId)
    );

    // Also remove votes for this item
    const currentVotes = storage.get("votes");
    const newVotes = { ...currentVotes };
    delete newVotes[itemId];
    storage.set("votes", newVotes);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemContent.trim() && newItemContent.length <= 500) {
      addItem(newItemContent.trim());
      setNewItemContent("");
      setIsAdding(false);
    }
  };

  const colors = colorClasses[color];

  // Sort items by vote count (descending)
  const sortedItems = [...(items || [])].sort((a, b) => {
    const aVotes = votes?.[a.id]?.length || 0;
    const bVotes = votes?.[b.id]?.length || 0;
    if (bVotes !== aVotes) return bVotes - aVotes;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className={`rounded-lg border ${colors.border} bg-white dark:bg-slate-900`}>
      {/* Header */}
      <div className={`rounded-t-lg px-4 py-3 ${colors.header}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${colors.text}`}>{title}</h3>
          <span className={`text-sm ${colors.text}`}>
            {sortedItems.length} items
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 p-4">
        {sortedItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            voteCount={votes?.[item.id]?.length || 0}
            onDelete={() => deleteItem(item.id)}
            showVotes={false}
            disabled={disabled}
          />
        ))}

        {/* Add new item */}
        {!disabled && (
          <>
            {isAdding ? (
              <form onSubmit={handleSubmit}>
                <Card>
                  <CardContent className="p-3">
                    <Textarea
                      placeholder="Voeg een item toe..."
                      value={newItemContent}
                      onChange={(e) => setNewItemContent(e.target.value)}
                      maxLength={500}
                      autoFocus
                      className="min-h-[80px] resize-none"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {newItemContent.length}/500
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAdding(false);
                            setNewItemContent("");
                          }}
                        >
                          Annuleren
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newItemContent.trim()}
                        >
                          Toevoegen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Item toevoegen
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
