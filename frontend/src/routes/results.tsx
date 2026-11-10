import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

const API = "https://depthhwizard.onrender.com";

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
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);

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

    let objectUrl: string | null = null;

    fetch(`${API}/results/${resultId}/flythrough`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Flythrough video is not available.");
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setVideoBlobUrl(objectUrl);
        setVideoAvailable(true);
      })
      .catch(() => setVideoAvailable(false));

    fetch(`${API}/geospatial/results/${resultId}/elevation-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("The elevation summary is not available.");
        return response.json();
      })
      .then((data) => setSummary(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the summary."));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resultId]);

  return (
    <AppShell
      title="Analysis results"
      subtitle="Review your uploaded image and generated terrain outputs."
    >
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold">{project}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {resultId ? `Backend result ID: ${resultId}` : "No result ID was saved."}
          </p>
        </div>

        {image && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-lg font-semibold">Uploaded satellite image</h3>
            <img
              src={image}
              alt="Uploaded image for terrain analysis"
              className="max-h-80 w-full rounded-lg object-contain"
            />
          </section>
        )}

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">Relative depth summary</h3>
          {summary ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {["min", "max", "mean", "range"].map((key) => (
                <div key={key} className="rounded-lg bg-secondary p-3">
                  <p className="text-sm capitalize text-muted-foreground">{key}</p>
                  <p className="mt-1 text-xl font-bold">
                    {typeof summary[key] === "number"
                      ? (summary[key] as number).toFixed(3)
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {error || "Loading relative depth summary..."}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Values are normalized relative image-depth estimates, not measured real-world elevations.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">3D flythrough</h3>
          {videoBlobUrl && videoAvailable ? (
            <video
              src={videoBlobUrl}
              controls
              playsInline
              className="w-full rounded-lg bg-black"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Flythrough video is not available. You can still open the interactive viewer.
            </p>
          )}
          <Button className="mt-4" asChild>
            <Link to="/viewer">Open 3D terrain viewer</Link>
          </Button>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/upload">Analyze another image</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
