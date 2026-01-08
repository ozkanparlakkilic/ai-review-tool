import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PromptPanelProps {
  prompt: string;
}

export function PromptPanel({ prompt }: PromptPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt</CardTitle>
        <CardDescription>User input to AI model</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{prompt}</p>
      </CardContent>
    </Card>
  );
}
