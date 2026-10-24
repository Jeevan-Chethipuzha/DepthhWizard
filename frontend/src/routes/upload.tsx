import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CloudUpload, FileImage, ImagePlus, Info, RotateCcw, X } from "lucide-react";
import { AppShell, StatLabel } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { terrainAerial } from "@/lib/demo";
export const Route = createFileRoute("/upload")({ head: () => ({ meta: [{ title: "Upload imagery — DepthWizard" }, { name: "description", content: "Upload and preview an overhead image for terrain analysis." }, { property: "og:title", content: "Upload imagery — DepthWizard" }, { property: "og:description", content: "Prepare overhead imagery for terrain analysis." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Upload });
function Upload() { const navigate = useNavigate(); const fileRef = useRef<HTMLInputElement>(null); const [preview,setPreview] = useState<string | null>(null); const [selectedFile,setSelectedFile] = useState<File | null>(null); const [isUploading,setIsUploading] = useState(false); const [fileName,setFileName] = useState(""); const [projectName,setProjectName] = useState(""); const [drag,setDrag] = useState(false); const [error,setError] = useState("");
  function choose(file?: File) { if (!file) return; if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; } if (file.size > 20*1024*1024) { setError("Please choose an image under 20 MB."); return; } if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); setPreview(URL.createObjectURL(file)); setSelectedFile(file); setFileName(file.name); setProjectName(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")); setError(""); }
  function sample() { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); setPreview(terrainAerial); setSelectedFile(null); setFileName("himalayan-ridge-satellite.jpg"); setProjectName("Himalayan Ridge Survey"); setError(""); }
  async function startAnalysis() {
    if (!selectedFile || !projectName.trim()) {
      setError("Please select an image file and enter a project name.");
      return;
    }

    const token = localStorage.getItem("depthwizard_token");
    if (!token) {
      setError("Please log in first, then upload your image again.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch(
        "https://zany-space-goggles-gxrvg677gqqxcwqv9-8000.app.github.dev/images/upload",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.detail || "Image upload failed.");
      }

      const resultResponse = await fetch(
        `https://zany-space-goggles-gxrvg677gqqxcwqv9-8000.app.github.dev/results/generate/${uploadData.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resultData = await resultResponse.json();
      if (!resultResponse.ok) {
        throw new Error(resultData.detail || "Image processing failed.");
      }

     const reader = new FileReader();

reader.onload = () => {
  if (typeof reader.result === "string") {
    sessionStorage.setItem("depthwizard-image-preview", reader.result);
  }

  sessionStorage.setItem("depthwizard-project", projectName.trim());
  sessionStorage.setItem("depthwizard-image-id", String(uploadData.id));
  sessionStorage.setItem("depthwizard-result-id", String(resultData.id));

  navigate({ to: "/processing" });
};

reader.onerror = () => {
  setError("Could not save image preview. Please try again.");
};

reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  }

  return <AppShell title="New analysis" subtitle="Upload an overhead image to begin your terrain exploration."><div className="mb-8 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-2 text-primary"><span className="grid size-6 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">1</span> Upload & preview</span><span className="mx-2 h-px w-8 bg-border" /><span className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full border border-border">2</span> Processing</span><span className="mx-2 h-px w-8 bg-border" /><span className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full border border-border">3</span> Results</span></div><div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]"><div><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Image preview</h2>{preview && <Button variant="ghost" size="sm" onClick={() => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); setPreview(null); setSelectedFile(null); setFileName(""); }}><RotateCcw size={14} /> Replace</Button>}</div><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => choose(e.target.files?.[0])} />{preview ? <div className="relative aspect-[4/3] overflow-hidden border border-border bg-muted"><img src={preview} alt="Selected overhead image preview" className="h-full w-full object-contain" /><span className="absolute bottom-4 left-4 flex items-center gap-2 bg-ink/85 px-3 py-2 text-xs font-semibold text-primary-foreground"><Check size={14} className="text-lime" /> Ready for analysis</span></div> : <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); choose(e.dataTransfer.files[0]); }} className={`flex aspect-[4/3] flex-col items-center justify-center border-2 border-dashed px-6 text-center transition-colors ${drag ? "border-primary bg-secondary" : "border-border bg-card"}`}><span className="mb-5 grid size-16 place-items-center rounded-full bg-secondary text-primary"><CloudUpload size={30} /></span><h3 className="font-display text-xl font-bold">Drop your image here</h3><p className="mt-2 text-sm text-muted-foreground">or browse your files to get started</p><Button className="mt-6" onClick={() => fileRef.current?.click()}><ImagePlus /> Browse files</Button><p className="mt-5 text-xs text-muted-foreground">JPG, PNG or WebP · Maximum 20 MB</p></div>}{error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}<div className="mt-4 flex items-start gap-3 bg-secondary p-4 text-xs leading-5 text-secondary-foreground"><Info size={17} className="mt-0.5 shrink-0" /><span>For best results, use a clear overhead image with visible terrain features and minimal cloud coverage.</span></div></div><div><h2 className="mb-4 font-display text-lg font-bold">Analysis details</h2><div className="border border-border bg-card p-6"><StatLabel>Project name</StatLabel><input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Mountain Ridge Survey" className="mt-3 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" /><div className="mt-8 border-t border-border pt-7"><StatLabel>Selected image</StatLabel>{preview ? <div className="mt-4 flex items-center gap-3 border border-border p-3"><FileImage size={21} className="shrink-0 text-primary" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{fileName}</span><Check size={17} className="shrink-0 text-primary" /></div> : <p className="mt-4 text-sm text-muted-foreground">No image selected yet.</p>}</div><div className="mt-8 border-t border-border pt-7"><StatLabel>Analysis pipeline</StatLabel><div className="mt-4 space-y-3 text-sm">{["Image preprocessing", "Depth estimation", "Elevation mapping", "3D terrain generation"].map(s => <div key={s} className="flex items-center gap-3"><span className="size-1.5 rounded-full bg-sea" />{s}</div>)}</div></div><Button className="mt-9 h-12 w-full" disabled={!selectedFile || !projectName.trim() || isUploading} onClick={startAnalysis}>{isUploading ? "Uploading and processing..." : "Start analysis"} <ArrowRight /></Button><p className="mt-3 text-center text-xs text-muted-foreground">Your selected image will be uploaded for processing.</p></div><Button variant="ghost" size="sm" className="mt-5" asChild><Link to="/dashboard"><ArrowLeft /> Back to overview</Link></Button></div></div></AppShell>;
}
