import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Box, ChartNoAxesCombined, Clock3, FolderClock, Layers3, Loader2, Mountain, Play, Plus, ScanLine } from "lucide-react";
import { AppShell, SectionHeading, StatLabel } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { projects, terrainAerial, type ProjectStatus } from "@/lib/demo";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DepthWizard" }, { name: "description", content: "Your DepthWizard terrain analysis overview and recent projects." }, { property: "og:title", content: "Dashboard — DepthWizard" }, { property: "og:description", content: "Terrain analysis overview and recent projects." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Dashboard,
});

const statusRoute: Record<ProjectStatus, string> = { Completed: "/results", Processing: "/processing", Ready: "/upload" };

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    Completed: "bg-secondary text-primary",
    Processing: "bg-warning/15 text-ink border border-warning/40",
    Ready: "bg-sea/15 text-ink border border-sea/40",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status === "Processing" && <Loader2 size={11} className="animate-spin" />}
      {status}
    </span>
  );
}

function Dashboard() {
  const completed = projects.filter(p => p.status === "Completed").length;
  const processing = projects.filter(p => p.status === "Processing").length;
  const ready = projects.filter(p => p.status === "Ready").length;

  return (
    <AppShell
      title="Overview"
      subtitle="Welcome back — here's what's happening in your workspace."
      action={<Button asChild><Link to="/upload"><Plus size={16} /> New Analysis</Link></Button>}
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Layers3, label: "Total analyses", value: "12", detail: "Across all sample projects" },
          { icon: Mountain, label: "Terrain mapped", value: "37.4", unit: "km²", detail: "Estimated coverage" },
          { icon: ChartNoAxesCombined, label: "Highest elevation", value: "4,218", unit: "m", detail: "Himalayan Ridge Survey" },
        ].map(s => (
          <div key={s.label} className="border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <StatLabel>{s.label}</StatLabel>
              <s.icon size={19} className="text-primary" />
            </div>
            <div className="mt-5 font-display text-4xl font-bold text-ink">{s.value}<span className="ml-1 text-lg font-medium text-muted-foreground">{s.unit}</span></div>
            <p className="mt-2 text-xs text-muted-foreground">{s.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Sample figures for demonstration — not real analysis results.</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        {/* Start here band */}
        <div className="relative min-h-[350px] overflow-hidden bg-ink text-primary-foreground sm:min-h-[390px]">
          <img src={terrainAerial} width={1600} height={1104} alt="Satellite view of mountain terrain" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 terrain-shade" />
          <div className="relative flex h-full min-h-[350px] flex-col justify-between p-7 sm:min-h-[390px] sm:p-9">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-lime"><span className="size-1.5 rounded-full bg-lime" /> Start here</div>
            <div>
              <h2 className="max-w-md font-display text-3xl font-bold leading-tight sm:text-4xl">Discover what your image is hiding.</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-primary-foreground/75">Upload an overhead image and see the landscape take shape.</p>
              <Button variant="lime" className="mt-7" asChild><Link to="/upload"><Plus /> New Analysis <ArrowUpRight /></Link></Button>
            </div>
          </div>
        </div>

        {/* Analysis status */}
        <div className="flex flex-col border border-border bg-card p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Analysis status</h2>
            <Clock3 size={20} className="text-primary" />
          </div>
          <div className="mt-6 flex-1 space-y-0">
            {[
              { label: "Completed", count: completed, dot: "bg-sea", hint: "Results and 3D terrain ready to view" },
              { label: "Processing", count: processing, dot: "bg-warning", hint: "Depth estimation in progress" },
              { label: "Ready", count: ready, dot: "bg-primary", hint: "Image queued — start when you are" },
            ].map((row, i) => (
              <div key={row.label} className={`flex items-center gap-4 py-5 ${i < 2 ? "border-b border-border" : ""}`}>
                <span className={`size-2 rounded-full ${row.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold text-ink">{row.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{row.hint}</p>
                </div>
                <span className="font-display text-2xl font-bold text-ink">{row.count}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4 w-full" asChild><Link to="/history">View all projects <ArrowUpRight size={15} /></Link></Button>
        </div>
      </div>

      {/* Quick access */}
      <div className="mt-12">
        <SectionHeading title="Quick access" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/upload", icon: ScanLine, title: "Upload Image", desc: "Start a new analysis" },
            { to: "/results", icon: ChartNoAxesCombined, title: "Results", desc: "Depth & elevation insights" },
            { to: "/viewer", icon: Box, title: "3D Viewer", desc: "Fly through terrain" },
            { to: "/history", icon: FolderClock, title: "History", desc: "All past projects" },
          ].map(q => (
            <Link key={q.to} to={q.to} className="group flex items-center gap-4 border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5">
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><q.icon size={20} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold text-ink">{q.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{q.desc}</p>
              </div>
              <ArrowUpRight size={15} className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent projects */}
      <div className="mt-12">
        <SectionHeading title="Recent projects" link="View all projects" to="/history" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map(p => (
            <Link key={p.id} to={statusRoute[p.status]} data-status={p.status} className="group overflow-hidden border border-border bg-card transition-colors hover:border-primary">
              <div className="relative h-40 overflow-hidden">
                <img loading="lazy" src={p.image} alt={`${p.name} — sample overhead image`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute right-3 top-3"><StatusBadge status={p.status} /></span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-ink">{p.name}</h3>
                  {p.status === "Completed"
                    ? <Play size={16} className="mt-1 shrink-0 text-primary" />
                    : <ArrowUpRight size={16} className="mt-1 shrink-0 text-primary" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.location}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock3 size={13} /> {p.date}</span>
                  <span>{p.elevation} peak</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">Sample projects with placeholder imagery — results are demonstrations, not real terrain data.</p>
      </div>
    </AppShell>
  );
}

