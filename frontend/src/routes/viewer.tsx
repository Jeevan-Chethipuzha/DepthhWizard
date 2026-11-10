import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Box,
  MapPin,
  Mountain,
  Play,
  Satellite,
} from "lucide-react";
import { AppShell, StatLabel } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { TerrainViewer } from "@/components/terrain-viewer";
import { MapView } from "@/components/map-view";

const API =
  import.meta.env.VITE_API_URL ||
  "https://depthhwizard.onrender.com";

type Location = {
  lat: number;
  lng: number;
};

export const Route = createFileRoute("/viewer")({
  head: () => ({
    meta: [
      { title: "3D Terrain Explorer — DepthWizard" },
      {
        name: "description",
        content: "Explore uploaded images with worldwide maps and 3D terrain.",
      },
    ],
  }),
  component: Viewer,
});

function Viewer() {
  const [exaggeration, setExaggeration] = useState(1.5);
  const [wireframe, setWireframe] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [heights, setHeights] = useState<number[][]>([]);
  const [imageData, setImageData] = useState<string | null>(null);
  const [status, setStatus] = useState("Preparing your terrain...");
  const [projectName, setProjectName] = useState("Your uploaded project");
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    const savedImage = sessionStorage.getItem(
      "depthwizard-image-preview"
    );
    setImageData(savedImage);

    const savedLocation = sessionStorage.getItem(
      "depthwizard-location"
    );

    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch {
        // Ignore invalid saved location.
      }
    }

    const savedProject = sessionStorage.getItem("depthwizard-project");

    if (savedProject) {
      try {
        const project = JSON.parse(savedProject);
        setProjectName(
          typeof project === "string"
            ? project
            : project.name || "Your uploaded project"
        );
      } catch {
        setProjectName(savedProject);
      }
    }

    async function loadTerrain() {
      try {
        const imageId = Number(
          sessionStorage.getItem("depthwizard-image-id") || "1"
        );
        const resultId = Number(
          sessionStorage.getItem("depthwizard-result-id") || "1"
        );

        const response = await fetch(`${API}/terrain/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_id: imageId,
            result_id: resultId,
          }),
        });

        if (!response.ok) {
          throw new Error("Backend terrain is not available.");
        }

        const data = await response.json();

        setHeights(data.heights || []);
        setStatus(
          data.note ||
            "Terrain data loaded. Heights are relative, not metres."
        );
      } catch (error) {
        console.error("Terrain backend:", error);
        setStatus(
          "Using image-based relative depth. Backend terrain data was unavailable."
        );
      }
    }

    loadTerrain();
  }, []);

  function updateLocation(next: Location) {
    setLocation(next);
    sessionStorage.setItem(
      "depthwizard-location",
      JSON.stringify(next)
    );
  }

  return (
    <AppShell
      title="3D Terrain Explorer"
      subtitle="Explore your uploaded image, select a worldwide location and view its 3D surface."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">
            {projectName}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={13} />
            Worldwide map · Image-based terrain
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link to="/results">
            <ArrowLeft /> Back to results
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <Satellite size={18} className="text-primary" />
            <h2 className="font-display text-base font-bold">
              Worldwide map explorer
            </h2>
          </div>

          <MapView
            imageData={imageData}
            onLocationChange={updateLocation}
          />

          <div className="border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground">
              SELECTED LOCATION
            </p>

            {location ? (
              <p className="mt-2 font-mono text-sm">
                Latitude: {location.lat.toFixed(6)} · Longitude:{" "}
                {location.lng.toFixed(6)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Search for a place or click on the map to select coordinates.
              </p>
            )}
          </div>
        </section>

        <section className="min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <Box size={18} className="text-primary" />
            <h2 className="font-display text-base font-bold">
              3D depth visualization
            </h2>
          </div>

          <div className="relative h-[520px] overflow-hidden rounded-lg border border-border bg-ink">
            {imageData ? (
              <TerrainViewer
                exaggeration={exaggeration}
                wireframe={wireframe}
                autoRotate={rotate}
                heights={heights}
                imageData={imageData}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-white">
                <Mountain size={42} />
                <p className="font-semibold">
                  No uploaded image found
                </p>
                <p className="text-sm text-white/60">
                  Upload an image first, then open the 3D viewer again.
                </p>
                <Button asChild>
                  <Link to="/upload">Upload image</Link>
                </Button>
              </div>
            )}

            <div className="pointer-events-none absolute left-3 top-3 rounded bg-black/75 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-lime-300">
              Relative depth · Image-based
            </div>
          </div>

          <div className="space-y-5 border border-border bg-card p-5">
            <div>
              <div className="flex items-center justify-between">
                <StatLabel>Vertical exaggeration</StatLabel>
                <span className="font-display text-sm font-bold text-primary">
                  {exaggeration.toFixed(1)}×
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={exaggeration}
                onChange={(event) =>
                  setExaggeration(Number(event.target.value))
                }
                className="mt-3 w-full accent-primary"
                aria-label="Vertical exaggeration"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={!wireframe ? "default" : "outline"}
                size="sm"
                onClick={() => setWireframe(false)}
              >
                Surface
              </Button>

              <Button
                variant={wireframe ? "default" : "outline"}
                size="sm"
                onClick={() => setWireframe(true)}
              >
                Wireframe
              </Button>

              <Button
                variant={rotate ? "default" : "outline"}
                size="sm"
                onClick={() => setRotate(!rotate)}
              >
                <Play size={15} />
                {rotate ? "Pause rotation" : "Auto rotate"}
              </Button>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Mountain size={16} className="text-primary" />
                <h3 className="font-semibold">Terrain details</h3>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {status}
              </p>

              <div className="mt-3 flex justify-between text-xs">
                <span className="text-muted-foreground">Height grid</span>
                <span>
                  {heights.length
                    ? `${heights[0]?.length || 0} × ${heights.length}`
                    : "Image-based"}
                </span>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Note: Brightness-based depth is an approximation, not
                measured ground elevation. A selected map location does
                not automatically georeference the uploaded image.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
