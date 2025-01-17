import React from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingOverlayProps {
  progress?: number;
  message?: string;
  isVisible?: boolean;
}

const ProcessingOverlay = ({
  progress = 0,
  message = "Analyzing your plant...",
  isVisible = true,
}: ProcessingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full space-y-6 text-center border">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>

        <h3 className="text-xl font-semibold text-foreground">{message}</h3>

        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">{progress}% Complete</p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>This might take a few moments</p>
          <p>
            We're using AI to identify your plant and gather care information
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
