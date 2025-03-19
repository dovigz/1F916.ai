"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ModelSelector({ models, types, onModelSelect, ...props }) {
  const [open, setOpen] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState(models[0]);
  const [peekedModel, setPeekedModel] = React.useState(models[0]);

  const handleSelect = (model) => {
    setSelectedModel(model);
    setOpen(false);
    if (onModelSelect) {
      onModelSelect(model);
    }
  };

  return (
    <div className="grid gap-2">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <Label htmlFor="model" className="text-green-400">
            Model
          </Label>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm bg-gray-900 border-green-500 text-green-400"
          side="left"
        >
          The model which will generate the completion. Some models are suitable
          for natural language tasks, others specialize in code.
        </HoverCardContent>
      </HoverCard>
      <Popover open={open} onOpenChange={setOpen} {...props}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a model"
            className="w-full justify-between border-green-500 text-green-400 hover:bg-green-950 hover:text-green-300"
          >
            {selectedModel ? selectedModel.name : "Select a model..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[250px] p-0 bg-gray-900 border-green-500"
        >
          <HoverCard>
            <HoverCardContent
              side="left"
              align="start"
              forceMount
              className="min-h-[280px] bg-gray-900 border-green-500 text-green-400"
            >
              <div className="grid gap-2">
                <h4 className="font-medium leading-none">{peekedModel.name}</h4>
                <div className="text-sm text-green-400/70">
                  {peekedModel.description}
                </div>
                {peekedModel.strengths ? (
                  <div className="mt-4 grid gap-2">
                    <h5 className="text-sm font-medium leading-none">
                      Strengths
                    </h5>
                    <div className="text-sm text-green-400/70">
                      {peekedModel.strengths}
                    </div>
                  </div>
                ) : null}
              </div>
            </HoverCardContent>
            <Command className="bg-gray-900">
              <CommandList className="h-[var(--cmdk-list-height)] max-h-[400px]">
                <CommandInput
                  placeholder="Search Models..."
                  className="text-green-400"
                />
                <CommandEmpty className="text-green-400">
                  No Models found.
                </CommandEmpty>
                <HoverCardTrigger />
                {types.map((type) => (
                  <CommandGroup
                    key={type}
                    heading={type}
                    className="text-green-300"
                  >
                    {models
                      .filter((model) => model.type === type)
                      .map((model) => (
                        <ModelItem
                          key={model.id}
                          model={model}
                          isSelected={selectedModel?.id === model.id}
                          onPeek={(model) => setPeekedModel(model)}
                          onSelect={() => handleSelect(model)}
                        />
                      ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </HoverCard>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ModelItem({ model, isSelected, onSelect, onPeek }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current && ref.current.getAttribute("aria-selected") === "true") {
      onPeek(model);
    }
  }, [model, onPeek]);

  return (
    <CommandItem
      key={model.id}
      onSelect={onSelect}
      ref={ref}
      className="aria-selected:bg-green-950 aria-selected:text-green-300 text-green-400"
    >
      {model.name}
      <Check
        className={cn(
          "ml-auto text-green-500",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
    </CommandItem>
  );
}
