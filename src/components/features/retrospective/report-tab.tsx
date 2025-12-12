"use client";

import { useState } from "react";
import { useStorage, useMutation } from "@/lib/liveblocks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Copy, RefreshCw, FileText, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Props = {
  sessionId: string;
};

export function ReportTab({ sessionId }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const report = useStorage((root) => root.report);
  const items = useStorage((root) => root.items);

  const setReport = useMutation(
    (
      { storage },
      reportData: { content: string | null; isGenerating: boolean; generatedAt: string | null }
    ) => {
      storage.set("report", reportData);
    },
    []
  );

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReport({
      content: null,
      isGenerating: true,
      generatedAt: null,
    });

    try {
      const response = await fetch(`/api/retrospective/${sessionId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            tone: "informal",
            language: "nl",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const data = await response.json();

      setReport({
        content: data.content,
        isGenerating: false,
        generatedAt: data.generatedAt || new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating report:", error);
      setReport({
        content: null,
        isGenerating: false,
        generatedAt: null,
      });
      alert("Er ging iets mis bij het genereren van het rapport.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (report?.content) {
      await navigator.clipboard.writeText(report.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (report?.content) {
      const blob = new Blob([report.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `retrospective-rapport-${sessionId}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (report?.isGenerating || isGenerating) {
    return <ReportSkeleton />;
  }

  if (!report?.content) {
    return (
      <GenerateReportPrompt
        onGenerate={handleGenerateReport}
        itemCount={items?.length || 0}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Retrospective Rapport
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Gekopieerd!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Kopiëren
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
            <Download className="mr-2 h-4 w-4" />
            Download MD
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Opnieuw
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="prose prose-slate max-w-none p-6 dark:prose-invert">
          <ReactMarkdown>{report.content}</ReactMarkdown>
        </CardContent>
      </Card>

      {report.generatedAt && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gegenereerd op:{" "}
          {new Date(report.generatedAt).toLocaleString("nl-NL", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
      )}
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-slate-500">
        Rapport wordt gegenereerd...
      </p>
    </div>
  );
}

function GenerateReportPrompt({
  onGenerate,
  itemCount,
}: {
  onGenerate: () => void;
  itemCount: number;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Nog geen rapport gegenereerd
        </h3>
        <p className="mt-2 max-w-md text-center text-slate-500 dark:text-slate-400">
          Genereer een AI-samenvatting van deze retrospective met alle items,
          stemmen en discussiepunten.
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {itemCount} items beschikbaar
        </p>
        <Button className="mt-6" onClick={onGenerate} disabled={itemCount === 0}>
          <FileText className="mr-2 h-4 w-4" />
          Genereer Rapport
        </Button>
      </CardContent>
    </Card>
  );
}
