"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Copy, Check, Sparkles, Globe, Palette } from "lucide-react";

interface ReportGeneratorProps {
  sessionId: string;
}

type ReportTone = "formal" | "informal";
type ReportLanguage = "en" | "nl";

export function ReportGenerator({ sessionId }: ReportGeneratorProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<ReportTone>("informal");
  const [language, setLanguage] = useState<ReportLanguage>("en");
  const [customInstructions, setCustomInstructions] = useState("");

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/retrospective/${sessionId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone,
          language,
          customInstructions: customInstructions || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      } else {
        const error = await response.json();
        console.error("Failed to generate report:", error);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retrospective-report-${sessionId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-4 space-y-6">
      {/* Configuration Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Report Settings</h3>

        <div className="flex gap-4">
          {/* Tone Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Palette className="mr-2 h-4 w-4" />
                {tone === "formal" ? "Formal" : "Informal"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTone("formal")}>
                Formal - Professional business language
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTone("informal")}>
                Informal - Friendly and conversational
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Globe className="mr-2 h-4 w-4" />
                {language === "en" ? "English" : "Nederlands"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("nl")}>
                Nederlands
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            Custom Instructions (optional)
          </label>
          <Textarea
            placeholder="Add any specific focus areas or instructions for the AI..."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            rows={2}
          />
        </div>

        {/* Generate Button */}
        <Button onClick={generateReport} disabled={loading} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Generate AI Report"}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-1/2 mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {/* Report Display */}
      {report && !loading && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Markdown
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadMarkdown}>
              <Download className="mr-2 h-4 w-4" />
              Download .md
            </Button>
          </div>

          {/* Report Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-mono bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-auto max-h-[500px]">
                  {report}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Format Badges */}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <FileText className="h-4 w-4" />
            <span>Available formats:</span>
            <Badge variant="secondary">Markdown</Badge>
            <Badge variant="outline" className="opacity-50">PDF (coming soon)</Badge>
            <Badge variant="outline" className="opacity-50">Slack (coming soon)</Badge>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && (
        <Card>
          <CardContent className="p-8 text-center text-zinc-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configure your settings and click Generate to create an AI-powered report of your retrospective.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
