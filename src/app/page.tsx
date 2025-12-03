import { CreateSessionForm } from "@/components/features/retrospective/create-session-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Scrumkit
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            AI-powered toolbox voor scrum teams
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-md">
          <div className="rounded-xl border bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Nieuwe Retrospective
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Start een nieuwe sprint retrospective sessie voor je team.
            </p>
            <div className="mt-6">
              <CreateSessionForm />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-center text-lg font-semibold text-slate-900 dark:text-white">
            Features
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="mt-4 font-medium text-slate-900 dark:text-white">
                Real-time Samenwerking
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Werk samen met je team in real-time
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <span className="text-2xl">🗳️</span>
              </div>
              <h3 className="mt-4 font-medium text-slate-900 dark:text-white">
                Voting Systeem
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Prioriteer items met stemmen
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="mt-4 font-medium text-slate-900 dark:text-white">
                AI Rapporten
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Automatisch gegenereerde samenvattingen
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
