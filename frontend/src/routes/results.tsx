
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Image as ImageIcon, Mountain, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

const API = "https://zany-space-goggles-gxrvg677gqqxcwqv9-8000.app.github.dev";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [{ title: "Analysis results — DepthWizard" }],
  }),
  component: Results,
});

function Results() {
  const [project, setProject] = useState("Terrain Analysis");
  const [image, setImage] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setProject(sessionStorage.getItem("depthwizard-project") || "Terrain Analysis");
    setImage(sessionStorage.getItem("depthwizard-image-preview"));
    setResultId(sessionStorage.getItem("depthwizard-result-id"));
  }, []);

  useEffect(() => {
    if (!resultId) return;

    const token = localStorage.getItem("depthwizard_token");
    if (!token) {
      setError("Please log in again to retrieve your analysis.");
      return;
    }

    fetch(`${API}/geospatial/results/${resultId}/elevation-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error("The backend summary is not available yet.");
        }
        return response.json();
      })
      .then(data => setSummary(data))
      .catch(err => setError(err instanceof Error ? err.message : "Could not load the result."));
  }, [resultId]);

  return (
    <AppShell
      title="Analysis results"
      subtitle="Review the uploaded image and the available analysis output."
      action={
        <span className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Check size={15} /> Upload submitted
        </span>
      }
    >
      <div className="mb-7 border-b border-border pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          DepthWizard / Results
        </p>
        <h2 className="mt-2 text-2xl font-bold">{project}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {resultId ? `Backend result ID: ${resultId}` : "No result ID was saved."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <ImageIcon size={18} /> Your uploaded image
          </h3>
          <div className="flex min-h-64 items-center justify-center overflow-hidden border border-border bg-muted">
            {image ? (
              <img
                src={image}
                alt="Uploaded satellite image"
                className="max-h-[480px] w-full object-contain"
              />
            ) : (
              <p className="p-6 text-sm text-muted-foreground">
                No saved image preview was found. Start a new analysis and upload the image again.
              </p>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Mountain size={18} /> Analysis output
          </h3>
          <div className="min-h-64 border border-border bg-card p-5">
            {summary ? (
              <>
                <p className="font-semibold">Backend elevation summary</p>
                <pre className="mt-4 overflow-auto whitespace-pre-wrap break-words text-sm">
                  {JSON.stringify(summary, null, 2)}
                </pre>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {error || "Loading the backend summary…"}
              </p>
            )}

            <div className="mt-5 border-t border-border pt-4 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <AlertCircle size={16} /> Important limitation
              </p>
              <p className="mt-2 text-muted-foreground">
                Relative depth is not the same as real-world elevation in metres.
                Accurate absolute elevation requires suitable reference or geospatial data.
                The AI model and full 3D terrain integration are still pending.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/upload">Analyze another image</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </AppShell>
  );
}
