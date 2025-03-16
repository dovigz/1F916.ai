"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Check, RefreshCw, X } from "lucide-react";

export function Recaptcha({ theme = "dark" }) {
  // Use a single state for verification status: "idle", "success", or "failed"
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [loading, setLoading] = useState(false);

  const handleVerification = () => {
    setLoading(true);

    // Always fail after a short delay
    setTimeout(() => {
      setVerificationStatus("failed");
      setLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setVerificationStatus("idle");
  };

  return (
    <Card className={`w-full max-w-md ${theme === "dark" ? "dark" : ""}`}>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Security Check</CardTitle>
        </div>
        <CardDescription>
          Please verify that you are not a robot
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verificationStatus === "idle" ? (
          <div
            className="flex items-center space-x-2 border rounded-md p-4 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={!loading ? handleVerification : undefined}
          >
            <Checkbox
              id="recaptcha-checkbox"
              checked={verificationStatus === "success"}
              disabled={loading}
              className={loading ? "opacity-50" : ""}
            />
            <Label
              htmlFor="recaptcha-checkbox"
              className={`flex-1 cursor-pointer ${loading ? "opacity-50" : ""}`}
            >
              I'm not a robot
            </Label>
            {loading && (
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        ) : verificationStatus === "success" ? (
          <div className="flex items-center space-x-2 border rounded-md p-4 bg-primary/10 border-primary/20">
            <div className="h-4 w-4 flex items-center justify-center rounded-sm bg-primary">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
            <Label className="flex-1">Verification successful</Label>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 border rounded-md p-4 bg-destructive/10 border-destructive/20">
              <div className="h-4 w-4 flex items-center justify-center rounded-sm bg-destructive">
                <X className="h-3 w-3 text-destructive-foreground" />
              </div>
              <Label className="flex-1 text-destructive">
                Verification failed
              </Label>
            </div>
            <p className="text-sm text-destructive px-1">Please try again</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={handleReset}
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Protected by reverseCAPTCHA
        </p>
        {verificationStatus === "success" && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
