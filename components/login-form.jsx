"use client"; // Ensure this runs as a client-side component

import { useState } from "react";
import { useRouter } from "next/navigation"; // Correct router import for App Router
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }) {
  const [apiKey, setApiKey] = useState("");
  const router = useRouter(); // This now works in a client component

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!apiKey.startsWith("sk-")) {
      alert("Invalid API key. Please enter a valid OpenAI API key.");
      return;
    }

    sessionStorage.setItem("openai_api_key", apiKey);
    router.push("/"); // Redirect to homepage
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Add an API key</CardTitle>
          <CardDescription>
            Enter your OpenAI API key below to gain access to the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="openAIKey">OpenAI API key</Label>
                <Input
                  id="openAIKey"
                  type="text"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Save to session storage
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
