"use client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Prompt({ value, onChange }) {
  return (
    <div className="grid gap-2">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <Label htmlFor="prompt">Prompt</Label>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          The input text that you want the model to use. Be specific and clear
          about what you want the model to generate.
        </HoverCardContent>
      </HoverCard>
      <Textarea
        id="prompt"
        placeholder="Enter your prompt here..."
        className="min-h-[120px] resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
