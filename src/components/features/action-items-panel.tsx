"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Trash2, CheckCircle, Circle, Clock } from "lucide-react";
import type { ActionItem } from "@/lib/db";

interface ActionItemsPanelProps {
  sessionId: string;
  userId: string;
  userName: string;
}

const PRIORITY_COLORS = {
  low: "bg-zinc-100 text-zinc-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const STATUS_ICONS = {
  open: Circle,
  in_progress: Clock,
  done: CheckCircle,
};

export function ActionItemsPanel({ sessionId, userId, userName }: ActionItemsPanelProps) {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");

  // Load action items
  useEffect(() => {
    async function loadActions() {
      try {
        const response = await fetch(`/api/retrospective/${sessionId}/actions`);
        if (response.ok) {
          const data = await response.json();
          setActions(data);
        }
      } catch (error) {
        console.error("Failed to load action items:", error);
      } finally {
        setLoading(false);
      }
    }
    loadActions();
  }, [sessionId]);

  const handleAddAction = async () => {
    if (!newDescription.trim()) return;

    try {
      const response = await fetch(`/api/retrospective/${sessionId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newDescription,
          assigneeName: newAssignee || userName,
          assigneeId: userId,
          priority: newPriority,
        }),
      });

      if (response.ok) {
        const action = await response.json();
        setActions((prev) => [...prev, action]);
        setNewDescription("");
        setNewAssignee("");
        setNewPriority("medium");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Failed to add action item:", error);
    }
  };

  const handleUpdateStatus = async (actionId: string, status: "open" | "in_progress" | "done") => {
    try {
      const response = await fetch(`/api/retrospective/${sessionId}/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updated = await response.json();
        setActions((prev) => prev.map((a) => (a.id === actionId ? updated : a)));
      }
    } catch (error) {
      console.error("Failed to update action item:", error);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    try {
      const response = await fetch(`/api/retrospective/${sessionId}/actions/${actionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setActions((prev) => prev.filter((a) => a.id !== actionId));
      }
    } catch (error) {
      console.error("Failed to delete action item:", error);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-zinc-500">
        Loading action items...
      </div>
    );
  }

  const groupedByStatus = {
    open: actions.filter((a) => a.status === "open"),
    in_progress: actions.filter((a) => a.status === "in_progress"),
    done: actions.filter((a) => a.status === "done"),
  };

  return (
    <div className="py-4 space-y-6">
      {/* Add New Action */}
      {isAdding ? (
        <Card>
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="Describe the action item..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Assignee name"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={PRIORITY_COLORS[newPriority]}>
                    {newPriority.charAt(0).toUpperCase() + newPriority.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setNewPriority("low")}>Low</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewPriority("medium")}>Medium</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewPriority("high")}>High</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddAction} disabled={!newDescription.trim()}>
                Add Action
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Action Item
        </Button>
      )}

      {/* Open Actions */}
      {groupedByStatus.open.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-500 mb-2">Open ({groupedByStatus.open.length})</h3>
          <div className="space-y-2">
            {groupedByStatus.open.map((action) => (
              <ActionItemCard
                key={action.id}
                action={action}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* In Progress Actions */}
      {groupedByStatus.in_progress.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-500 mb-2">In Progress ({groupedByStatus.in_progress.length})</h3>
          <div className="space-y-2">
            {groupedByStatus.in_progress.map((action) => (
              <ActionItemCard
                key={action.id}
                action={action}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Done Actions */}
      {groupedByStatus.done.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-500 mb-2">Done ({groupedByStatus.done.length})</h3>
          <div className="space-y-2">
            {groupedByStatus.done.map((action) => (
              <ActionItemCard
                key={action.id}
                action={action}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteAction}
              />
            ))}
          </div>
        </div>
      )}

      {actions.length === 0 && !isAdding && (
        <div className="py-8 text-center text-zinc-500">
          No action items yet. Add one to get started.
        </div>
      )}
    </div>
  );
}

function ActionItemCard({
  action,
  onUpdateStatus,
  onDelete,
}: {
  action: ActionItem;
  onUpdateStatus: (id: string, status: "open" | "in_progress" | "done") => void;
  onDelete: (id: string) => void;
}) {
  const StatusIcon = STATUS_ICONS[action.status];

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <button
            className="mt-0.5 text-zinc-400 hover:text-zinc-600"
            onClick={() => {
              const nextStatus =
                action.status === "open"
                  ? "in_progress"
                  : action.status === "in_progress"
                  ? "done"
                  : "open";
              onUpdateStatus(action.id, nextStatus);
            }}
          >
            <StatusIcon className={`h-5 w-5 ${action.status === "done" ? "text-green-500" : ""}`} />
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${action.status === "done" ? "line-through text-zinc-400" : ""}`}>
              {action.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {action.assigneeName && (
                <span className="text-xs text-zinc-500">{action.assigneeName}</span>
              )}
              <Badge variant="secondary" className={`text-xs ${PRIORITY_COLORS[action.priority]}`}>
                {action.priority}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdateStatus(action.id, "open")}>
                Mark as Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(action.id, "in_progress")}>
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(action.id, "done")}>
                Mark as Done
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(action.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
