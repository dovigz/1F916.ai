"use client";

import * as React from "react";
import { Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CodeViewer({ code }) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse the JSON to extract values for the code display
  let config = {};
  try {
    config = JSON.parse(code);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
  }

  // Format the prompt for display
  const formattedPrompt = config.prompt ? `"${config.prompt}"` : '""';

  return (
    <Card className="relative overflow-hidden rounded-md border">
      <div className="flex justify-between items-center p-3 bg-muted/50 border-b">
        <h3 className="text-sm font-medium">Generate your AI agent</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={copyToClipboard}
        >
          <Clipboard className="h-4 w-4 mr-1" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div className="rounded-md bg-black p-6 overflow-auto max-h-[600px]">
        <pre className="whitespace-pre-wrap break-words">
          <code className="grid gap-1 text-sm text-muted-foreground [&_span]:h-4">
            <span>
              <span className="text-sky-300">import</span> os
            </span>
            <span>
              <span className="text-sky-300">import</span> openai
            </span>
            <span />
            <span>
              openai.api_key = sessionStorage.getItem(
              <span className="text-green-300">&quot;OPENAI_API_KEY&quot;</span>
              )
            </span>
            <span />
            <span>response = openai.Completion.create(</span>
            <span>
              {" "}
              model=
              <span className="text-green-300">
                &quot;{config.model || "davinci"}&quot;
              </span>
              ,
            </span>

            <span>
              {" "}
              temperature=
              <span className="text-amber-300">
                {config.temperature || 0.9}
              </span>
              ,
            </span>
            <span>
              {" "}
              max_tokens=
              <span className="text-amber-300">{config.max_tokens || 5}</span>,
            </span>
            <span>
              {" "}
              top_p=<span className="text-amber-300">{config.top_p || 1}</span>,
            </span>
            <span>
              {" "}
              frequency_penalty=
              <span className="text-amber-300">
                {config.frequency_penalty || 0}
              </span>
              ,
            </span>
            <span>
              {" "}
              presence_penalty=
              <span className="text-green-300">
                {config.presence_penalty || 0}
              </span>
              ,
            </span>
            <span>
              {" "}
              prompt=<span className="text-amber-300">{formattedPrompt}</span>)
            </span>
          </code>
        </pre>
      </div>
    </Card>
  );
}
