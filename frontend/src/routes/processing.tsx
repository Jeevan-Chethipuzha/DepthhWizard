
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, CircleDashed, Layers3, ScanLine, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Processing — DepthWizard" },
      { name: "description", content: "Processing your uploaded image." },
    ],
  }),
  component: Processing,
});

function Processing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("Checking your uploaded image...");

  useEffect(() => {
    const imageId = sessionStorage.getItem("depthwizard-image-id");
    const resultId = sessionStorage.getItem("depthwizard-result-id");
    const savedPreview = sessionStorage.getItem("depthwizard-image-preview");

    if (!imageId || !resultId) {
      setMessage("No backend result was found. Return to Upload and select your image.");
      return;
    }

    if (savedPreview) setImagePreview(savedPreview);
    setMessage(`Backend result received. Image ID: ${imageId}, Result ID: ${resultId}`);

    const interval = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(100, value + 5);
        if (next === 100) window.clearInterval(interval);
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, []);

  const steps = [
    { title: "Image received", icon: ScanLine },
    { title: "Depth result received", icon: Layers3 },
    { title: "Elevation summary", icon: CircleDashed },
    { title: "Results ready", icon: Sparkles },
  ];
  const active = Math.min(3, Math.floor(progress / 25));

  return (
    <AppShell title="Analyzing terrain" subtitle="Processing status for your uploaded image.">
      <div className="mx-auto max-w-3xl">
        <div className="relative aspect-[16/9] overflow-hidden bg-ink">
          {imagePreview ? (
            <img src={imagePreview} alt="Your uploaded city image" className="h-full w-full object-cover opacity-80" />
          ) : (
            <div className="flex h-full items-center justify-center text-primary-foreground">
              No image preview saved. The backend result may still be available.
            </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/30 text-primary-foreground">
            <span className="grid size-20 place-items-center rounded-full border border-lime/60 bg-ink/60">
              <Layers3 size={36} className="text-lime" />
            </span>
            <span className="mt-5 font-display text-4xl font-bold">{progress}%</span>
            <span className="mt-1 text-sm">{progress === 100 ? "Backend response received" : steps[active]?.title}</span>
          </div>
        </div>

        <div className="mt-6 h-2 bg-secondary">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <step.icon size={19} />
                {progress >= (index + 1) * 25 && <Check size={15} />}
              </div>
              <p className="mt-4 text-xs font-semibold">{step.title}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{message}</p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Progress shown here is a UI indicator, not a measurement of AI computation.
        </p>

        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate({ to: "/results" })}>
            View results <ArrowRight />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
