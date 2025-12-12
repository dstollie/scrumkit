"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateSessionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sprintName, setSprintName] = useState("");
  const [userName, setUserName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim() || !userName.trim()) return;

    setIsLoading(true);

    try {
      // Create the session
      const response = await fetch("/api/retrospective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName.trim(),
          sprintName: sprintName.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const session = await response.json();

      // Store user info in localStorage for Liveblocks auth
      const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(
        "scrumkit-user",
        JSON.stringify({
          id: userId,
          name: userName.trim(),
        })
      );

      // Navigate to the session
      router.push(`/retrospective/${session.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Er ging iets mis bij het aanmaken van de sessie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="userName"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Jouw naam
        </label>
        <Input
          id="userName"
          type="text"
          placeholder="Bijv. Jan"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="sessionName"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Sessie naam
        </label>
        <Input
          id="sessionName"
          type="text"
          placeholder="Bijv. Sprint 23 Retrospective"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="sprintName"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Sprint naam{" "}
          <span className="text-slate-400 dark:text-slate-500">(optioneel)</span>
        </label>
        <Input
          id="sprintName"
          type="text"
          placeholder="Bijv. Sprint 23"
          value={sprintName}
          onChange={(e) => setSprintName(e.target.value)}
          className="mt-1"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Aanmaken..." : "Start Retrospective"}
      </Button>
    </form>
  );
}
