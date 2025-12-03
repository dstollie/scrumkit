"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sprintName, setSprintName] = useState("");
  const [joinSessionId, setJoinSessionId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateSession = async () => {
    if (!sessionName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/retrospective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName,
          sprintName: sprintName || null,
        }),
      });

      if (response.ok) {
        const session = await response.json();
        router.push(`/retrospective/${session.id}`);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = () => {
    if (!joinSessionId.trim()) return;

    // Extract ID from URL if pasted
    const id = joinSessionId.includes("/")
      ? joinSessionId.split("/").pop()
      : joinSessionId;

    router.push(`/retrospective/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            Scrumkit
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            AI-powered retrospective tool for agile teams.
            Collaborate in real-time, vote on items, and generate comprehensive reports.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create New Session */}
          <Card className="border-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Start New Retrospective
              </CardTitle>
              <CardDescription>
                Create a new session and invite your team to participate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    Create Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Retrospective</DialogTitle>
                    <DialogDescription>
                      Set up your retrospective session. You&apos;ll get a link to share with your team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Session Name *
                      </label>
                      <Input
                        id="name"
                        placeholder="e.g., Sprint 42 Retrospective"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="sprint" className="text-sm font-medium">
                        Sprint Name (optional)
                      </label>
                      <Input
                        id="sprint"
                        placeholder="e.g., Sprint 42"
                        value={sprintName}
                        onChange={(e) => setSprintName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateSession}
                      disabled={!sessionName.trim() || isCreating}
                    >
                      {isCreating ? "Creating..." : "Create & Start"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Join Existing Session */}
          <Card className="border-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Join Existing Session
              </CardTitle>
              <CardDescription>
                Enter a session ID or paste the invite link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Session ID or link"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinSession()}
              />
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={handleJoinSession}
                disabled={!joinSessionId.trim()}
              >
                Join Session
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-8">
            Everything you need for effective retrospectives
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Collaboration</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                See changes instantly as your team adds items and votes
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Voting & Prioritization</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Vote on items to surface what matters most to your team
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">AI-Generated Reports</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get comprehensive summaries powered by AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
