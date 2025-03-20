"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function MaxLengthSelector({ value, onValueChange }) {
  return (
    <div className="grid gap-2 pt-2">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maxlength" className="text-green-400">
                Maximum Length
              </Label>
              <span className="w-12 rounded-md border border-green-500 px-2 py-0.5 text-right text-sm text-green-400">
                {value}
              </span>
            </div>
            <Slider
              id="maxlength"
              max={4000}
              value={value}
              step={10}
              onValueChange={onValueChange}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-500"
              aria-label="Maximum Length"
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm bg-gray-900 border-green-500 text-green-400"
          side="left"
        >
          The maximum number of tokens to generate. Requests can use up to 2,048
          or 4,000 tokens, shared between prompt and completion. The exact limit
          varies by model.
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
