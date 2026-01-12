import { memo } from "react";
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

export const PromptPanel = memo(function PromptPanel({
  prompt,
}: PromptPanelProps) {
  return (
    <Card as="article">
      <CardHeader>
        <CardTitle>Prompt</CardTitle>
        <CardDescription>User input to AI model</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{prompt}</p>
      </CardContent>
    </Card>
  );
});
