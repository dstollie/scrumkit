"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RetrospectiveSession } from "@/lib/db";

type Props = {
  session: RetrospectiveSession;
  onJoin: (name: string) => void;
};

export function JoinSessionDialog({ session, onJoin }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Deelnemen aan sessie</CardTitle>
          <p className="mt-2 text-lg font-medium text-slate-700 dark:text-slate-300">
            {session.name}
          </p>
          {session.sprintName && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {session.sprintName}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Jouw naam
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Voer je naam in"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={!name.trim()}>
              Deelnemen
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
