"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, ThumbsUp, MessageSquare, X, Eye, EyeOff } from "lucide-react";
import { useRetrospectiveEvents } from "@/hooks";
import type { Category } from "@/types";

interface RetroBoardProps {
  sessionId: string;
  userId: string;
  userName: string;
  phase: "input" | "voting" | "discussion" | "completed";
  votesPerUser: number;
}

interface RetroItem {
  id: string;
  sessionId: string;
  category: Category;
  content: string;
  authorId: string | null;
  authorName: string | null;
  isAnonymous: boolean;
  discussionNotes: string | null;
  isDiscussed: boolean;
  createdAt: string;
  voteCount: number;
}

interface Vote {
  itemId: string;
  oderId: string;
}

const CATEGORIES: { key: Category; label: string; color: string; bgColor: string }[] = [
  { key: "went_well", label: "Went Well", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950" },
  { key: "to_improve", label: "To Improve", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950" },
  { key: "action_item", label: "Action Items", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950" },
];

export function RetroBoard({ sessionId, userId, userName, phase, votesPerUser }: RetroBoardProps) {
  const [items, setItems] = useState<RetroItem[]>([]);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemContent, setNewItemContent] = useState<Record<Category, string>>({
    went_well: "",
    to_improve: "",
    action_item: "",
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [addingToCategory, setAddingToCategory] = useState<Category | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [discussionNotes, setDiscussionNotes] = useState("");

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [itemsRes, votesRes] = await Promise.all([
          fetch(`/api/retrospective/${sessionId}/items`),
          fetch(`/api/retrospective/${sessionId}/votes?userId=${userId}`),
        ]);

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setItems(itemsData);
        }

        if (votesRes.ok) {
          const votesData = await votesRes.json();
          setUserVotes(votesData.map((v: { itemId: string; oderId: string }) => ({
            itemId: v.itemId,
            oderId: v.oderId,
          })));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sessionId, userId]);

  // SSE event handlers
  useRetrospectiveEvents(sessionId, {
    "item:added": (data) => {
      const newItem = data as RetroItem;
      setItems((prev) => {
        if (prev.some((i) => i.id === newItem.id)) return prev;
        return [...prev, { ...newItem, voteCount: 0 }];
      });
    },
    "item:updated": (data) => {
      const updatedItem = data as RetroItem;
      setItems((prev) =>
        prev.map((i) => (i.id === updatedItem.id ? { ...i, ...updatedItem } : i))
      );
    },
    "item:deleted": (data) => {
      const { id } = data as { id: string };
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    "vote:added": (data) => {
      const { itemId } = data as Vote;
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, voteCount: i.voteCount + 1 } : i))
      );
    },
    "vote:removed": (data) => {
      const { itemId } = data as Vote;
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, voteCount: Math.max(0, i.voteCount - 1) } : i))
      );
    },
  });

  // Count user's votes on an item
  const getUserVotesOnItem = useCallback(
    (itemId: string) => userVotes.filter((v) => v.itemId === itemId).length,
    [userVotes]
  );

  // Total user votes
  const totalUserVotes = userVotes.length;
  const remainingVotes = votesPerUser - totalUserVotes;

  // Add item
  const handleAddItem = async (category: Category) => {
    const content = newItemContent[category].trim();
    if (!content) return;

    try {
      const response = await fetch(`/api/retrospective/${sessionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          content,
          authorId: userId,
          authorName: isAnonymous ? null : userName,
          isAnonymous,
        }),
      });

      if (response.ok) {
        setNewItemContent((prev) => ({ ...prev, [category]: "" }));
        setAddingToCategory(null);
      }
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await fetch(`/api/retrospective/${sessionId}/items/${itemId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // Add vote
  const handleVote = async (itemId: string) => {
    if (remainingVotes <= 0) return;

    try {
      const response = await fetch(`/api/retrospective/${sessionId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, oderId: userId }),
      });

      if (response.ok) {
        setUserVotes((prev) => [...prev, { itemId, oderId: userId }]);
      }
    } catch (error) {
      console.error("Failed to add vote:", error);
    }
  };

  // Remove vote
  const handleUnvote = async (itemId: string) => {
    const userVotesOnItem = getUserVotesOnItem(itemId);
    if (userVotesOnItem === 0) return;

    try {
      const response = await fetch(`/api/retrospective/${sessionId}/votes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, oderId: userId }),
      });

      if (response.ok) {
        setUserVotes((prev) => {
          const index = prev.findIndex((v) => v.itemId === itemId && v.oderId === userId);
          if (index === -1) return prev;
          return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
      }
    } catch (error) {
      console.error("Failed to remove vote:", error);
    }
  };

  // Save discussion notes
  const handleSaveDiscussionNotes = async () => {
    if (!selectedItemId) return;

    try {
      await fetch(`/api/retrospective/${sessionId}/items/${selectedItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discussionNotes, isDiscussed: true }),
      });
      setDiscussionNotes("");
      setSelectedItemId(null);
    } catch (error) {
      console.error("Failed to save discussion notes:", error);
    }
  };

  // Sort items by votes (highest first) in voting/discussion phases
  const sortedItems = useCallback(
    (category: Category): RetroItem[] => {
      const categoryItems = items.filter((item) => item.category === category);
      if (phase === "input") {
        return [...categoryItems].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return [...categoryItems].sort((a, b) => b.voteCount - a.voteCount);
    },
    [items, phase]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Vote Counter */}
        {phase === "voting" && (
          <div className="flex justify-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Votes remaining: {remainingVotes} / {votesPerUser}
            </Badge>
          </div>
        )}

        {/* Anonymous Toggle */}
        {phase === "input" && (
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setIsAnonymous(!isAnonymous)}>
              {isAnonymous ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Posting Anonymously
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Posting as {userName}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map(({ key, label, color, bgColor }) => (
            <Card key={key} className={`${bgColor} border-none shadow-sm`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${color} flex items-center justify-between`}>
                  {label}
                  <Badge variant="secondary">{sortedItems(key).length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Add Item Input */}
                {phase === "input" && (
                  <div className="space-y-2">
                    {addingToCategory === key ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder={`Add something that ${key === "went_well" ? "went well" : key === "to_improve" ? "could be improved" : "should be an action item"}...`}
                          value={newItemContent[key]}
                          onChange={(e) =>
                            setNewItemContent((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          maxLength={500}
                          className="bg-white dark:bg-zinc-900"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddItem(key)}
                            disabled={!newItemContent[key].trim()}
                          >
                            Add
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setAddingToCategory(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full justify-start text-zinc-500"
                        onClick={() => setAddingToCategory(key)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add item
                      </Button>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2">
                  {sortedItems(key).map((item, index) => {
                    const userVotesOnItem = getUserVotesOnItem(item.id);
                    const isSelected = selectedItemId === item.id;

                    return (
                      <Card
                        key={item.id}
                        className={`bg-white dark:bg-zinc-900 cursor-pointer transition-all ${
                          isSelected ? "ring-2 ring-blue-500" : ""
                        } ${phase !== "input" && index < 3 ? "border-l-4 border-l-yellow-400" : ""}`}
                        onClick={() =>
                          phase === "discussion" && setSelectedItemId(isSelected ? null : item.id)
                        }
                      >
                        <CardContent className="p-3">
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                            {item.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500">
                              {item.isAnonymous ? "Anonymous" : item.authorName || "Unknown"}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Vote Controls */}
                              {(phase === "voting" || phase === "discussion") && (
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-7 px-2 ${userVotesOnItem > 0 ? "text-blue-600" : ""}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (phase === "voting") {
                                            if (userVotesOnItem > 0) {
                                              handleUnvote(item.id);
                                            } else if (remainingVotes > 0) {
                                              handleVote(item.id);
                                            }
                                          }
                                        }}
                                        disabled={phase !== "voting"}
                                      >
                                        <ThumbsUp className="h-4 w-4" />
                                        <span className="ml-1">{item.voteCount}</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {phase === "voting"
                                        ? userVotesOnItem > 0
                                          ? "Click to remove vote"
                                          : remainingVotes > 0
                                          ? "Click to vote"
                                          : "No votes remaining"
                                        : `${item.voteCount} votes`}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              )}

                              {/* Discussion indicator */}
                              {phase === "discussion" && (
                                <Button variant="ghost" size="sm" className="h-7 px-2">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Delete button (only for author in input phase) */}
                              {phase === "input" && item.authorId === userId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(item.id);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {sortedItems(key).length === 0 && (
                  <p className="text-center text-sm text-zinc-500 py-8">No items yet</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Discussion Panel */}
        {phase === "discussion" && selectedItemId && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Discussion Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add discussion notes for this item..."
                value={discussionNotes}
                onChange={(e) => setDiscussionNotes(e.target.value)}
                rows={4}
              />
              <div className="mt-4 flex gap-2">
                <Button onClick={handleSaveDiscussionNotes}>Save Notes</Button>
                <Button variant="outline" onClick={() => setSelectedItemId(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
