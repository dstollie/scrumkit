"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Copy, Check, Settings, FileText } from "lucide-react";
import { RetroBoard } from "@/components/features/retro-board";
import { ActionItemsPanel } from "@/components/features/action-items-panel";
import { ReportGenerator } from "@/components/features/report-generator";
import type { RetrospectiveSession } from "@/lib/db";

type PageParams = { id: string };

export default function RetrospectivePage({ params }: { params: Promise<PageParams> }) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<RetrospectiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [showNameDialog, setShowNameDialog] = useState(true);

  // Load session data
  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch(`/api/retrospective/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Session not found");
          } else {
            setError("Failed to load session");
          }
          return;
        }
        const data = await response.json();
        setSession(data);
      } catch {
        setError("Failed to load session");
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [id]);

  // Load saved user info from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("scrumkit-user-name");
    const savedId = localStorage.getItem("scrumkit-user-id");
    if (savedName && savedId) {
      setUserName(savedName);
      setUserId(savedId);
      setShowNameDialog(false);
    }
  }, []);

  const handleSetName = useCallback(() => {
    if (!userName.trim()) return;

    const newUserId = userId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setUserId(newUserId);
    localStorage.setItem("scrumkit-user-name", userName);
    localStorage.setItem("scrumkit-user-id", newUserId);
    setShowNameDialog(false);
  }, [userName, userId]);

  const copyLink = async () => {
    const url = `${window.location.origin}/retrospective/${id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateSessionStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/retrospective/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const updated = await response.json();
        setSession(updated);
      }
    } catch (error) {
      console.error("Failed to update session status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-32 mb-8" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            {error || "Session not found"}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            The retrospective session you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    input: "bg-blue-500",
    voting: "bg-yellow-500",
    discussion: "bg-purple-500",
    completed: "bg-green-500",
  };

  const statusLabels = {
    input: "Input Phase",
    voting: "Voting Phase",
    discussion: "Discussion Phase",
    completed: "Completed",
  };

  return (
    <>
      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Retrospective</DialogTitle>
            <DialogDescription>
              Enter your name to join the session. This will be visible to other participants.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetName()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSetName} disabled={!userName.trim()}>
              Join Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content - only render when we have user info */}
      {!showNameDialog && userId && (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
          {/* Header */}
          <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                      {session.name}
                    </h1>
                    {session.sprintName && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {session.sprintName}
                      </p>
                    )}
                  </div>
                  <Badge className={statusColors[session.status as keyof typeof statusColors]}>
                    {statusLabels[session.status as keyof typeof statusLabels]}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-500">
                    Joined as <strong>{userName}</strong>
                  </span>

                  <Button variant="outline" size="sm" onClick={copyLink}>
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Share Link
                      </>
                    )}
                  </Button>

                  {/* Phase Controls */}
                  {session.status === "input" && (
                    <Button size="sm" onClick={() => updateSessionStatus("voting")}>
                      Start Voting
                    </Button>
                  )}
                  {session.status === "voting" && (
                    <Button size="sm" onClick={() => updateSessionStatus("discussion")}>
                      Start Discussion
                    </Button>
                  )}
                  {session.status === "discussion" && (
                    <Button size="sm" onClick={() => updateSessionStatus("completed")}>
                      Complete Session
                    </Button>
                  )}

                  {/* Action Items Panel */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Actions
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]">
                      <SheetHeader>
                        <SheetTitle>Action Items</SheetTitle>
                        <SheetDescription>
                          Track action items and assign owners
                        </SheetDescription>
                      </SheetHeader>
                      <ActionItemsPanel sessionId={id} userId={userId} userName={userName} />
                    </SheetContent>
                  </Sheet>

                  {/* Report Generator */}
                  {(session.status === "discussion" || session.status === "completed") && (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Report
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[600px] sm:w-[800px]">
                        <SheetHeader>
                          <SheetTitle>Generate Report</SheetTitle>
                          <SheetDescription>
                            Create an AI-powered summary of the retrospective
                          </SheetDescription>
                        </SheetHeader>
                        <ReportGenerator sessionId={id} />
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Retro Board */}
          <main className="max-w-7xl mx-auto px-4 py-6">
            <RetroBoard
              sessionId={id}
              userId={userId}
              userName={userName}
              phase={session.status as "input" | "voting" | "discussion" | "completed"}
              votesPerUser={session.votesPerUser}
            />
          </main>
        </div>
      )}
    </>
  );
}
