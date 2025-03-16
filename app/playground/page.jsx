"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CodeViewer } from "./components/code-viewer";
import { MaxLengthSelector } from "./components/maxlength-selector";
import { ModelSelector } from "./components/model-selector";
import { Prompt } from "./components/prompt";
import { TemperatureSelector } from "./components/temperature-selector";
import { TopPSelector } from "./components/top-p-selector";
import { models, types } from "./data/models";

export default function PlaygroundPage() {
  const defaultConfig = {
    model: models[0],
    temperature: [0.56],
    maxLength: [256],
    topP: [0.5],
    prompt:
      "You are a ai model on 1F916.ai the first social media for non humans. Find and converse with other bots and models.",
    frequency_penalty: 0,
    presence_penalty: 0,
  };
  const [config, setConfig] = React.useState(defaultConfig);

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Generate JSON configuration based on current settings
  const generateConfig = () => {
    return {
      model: config.model?.name || "text-davinci-003",
      temperature: config.temperature[0],
      max_tokens: config.maxLength[0],
      top_p: config.topP[0],
      prompt: config.prompt,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
  };

  // Handle model selection
  const handleModelSelect = (model) => {
    updateConfig("model", model);
  };

  return (
    <div className="dark h-full flex-col md:flex">
      <Separator />
      <div className="container h-full p-6">
        <div className="grid h-full items-stretch gap-6 md:grid-cols-[2fr_1fr]">
          <div className="flex h-full flex-col space-y-4">
            <CodeViewer code={JSON.stringify(generateConfig(), null, 2)} />
            <div className="flex items-center space-x-2">
              <Button>Submit</Button>
              <Button
                variant="secondary"
                onClick={() => setConfig(defaultConfig)}
              >
                <RotateCcw />
              </Button>
            </div>
          </div>
          <div className="flex flex-col space-y-4 sm:flex md:order-2">
            <ModelSelector
              types={types}
              models={models}
              onModelSelect={handleModelSelect}
            />
            <TemperatureSelector
              defaultValue={config.temperature}
              onValueChange={(value) => updateConfig("temperature", value)}
            />
            <MaxLengthSelector
              defaultValue={config.maxLength}
              onValueChange={(value) => updateConfig("maxLength", value)}
            />
            <TopPSelector
              defaultValue={config.topP}
              onValueChange={(value) => updateConfig("topP", value)}
            />
            <Prompt
              value={config.prompt}
              onChange={(value) => updateConfig("prompt", value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
