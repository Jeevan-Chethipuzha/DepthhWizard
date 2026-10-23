import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  ChartNoAxesCombined,
  ChevronRight,
  Crosshair,
  FolderClock,
  ImageUp,
  Layers3,
  Mountain,
  Orbit,
  ScanLine,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { terrainAerial, terrainAlt } from "@/lib/demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DepthWizard — From imagery to insight" },
      { name: "description", content: "AI-powered single-view height estimation and interactive 3D terrain flythrough from overhead and satellite images." },
      { property: "og:title", content: "DepthWizard — From imagery to insight" },
      { property: "og:description", content: "Turn a single overhead image into a depth map, elevation insights and an explorable 3D terrain." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

const steps = [
  { num: "01", icon: ImageUp, title: "Upload image", body: "Bring in an overhead or satellite image of your area of interest." },
  { num: "02", icon: Sparkles, title: "AI depth estimation", body: "The model reads the single view and estimates a depth map of the scene." },
  { num: "03", icon: Mountain, title: "Elevation analysis", body: "Depth values are translated into an elevation profile for the terrain." },
  { num: "04", icon: Box, title: "3D terrain", body: "The elevation model is rebuilt as a three-dimensional surface." },
  { num: "05", icon: Orbit, title: "Flythrough", body: "Fly over the reconstructed landscape and inspect it from any angle." },
];

const features = [
  { icon: Crosshair, title: "Single-view estimation", body: "One overhead image is all the input the pipeline needs — no stereo pairs or ground sensors." },
  { icon: Layers3, title: "Depth visualization", body: "See the terrain's vertical structure as a clear depth map layered over the original image." },
  { icon: ChartNoAxesCombined, title: "Elevation insights", body: "Peak, low point and elevation range are summarized from the estimated surface." },
  { icon: Box, title: "Interactive 3D terrain", body: "The elevation model becomes a 3D surface you can orbit, zoom and inspect." },
  { icon: Orbit, title: "Terrain flythrough", body: "Take an automatic camera pass over the reconstructed landscape for a first-person view." },
  { icon: SlidersHorizontal, title: "Adjustable view", body: "Control vertical exaggeration, wireframe mode and rotation while you explore." },
];

const applications = [
  { title: "Geography & research", body: "Turn study imagery into an explorable terrain model for fieldwork preparation and analysis." },
  { title: "Planning & infrastructure", body: "Understand the shape of a site before visiting it — slopes, valleys and ridge lines at a glance." },
  { title: "Disaster assessment support", body: "Review terrain around affected areas from overhead imagery to support response planning." },
  { title: "Environmental studies", body: "Observe landforms and watershed structure across a region without a site visit." },
  { title: "Education & training", body: "Give students a hands-on way to connect flat maps with real three-dimensional terrain." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-5 lg:px-12">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#applications" className="transition-colors hover:text-foreground">Applications</a>
            <Link to="/history" className="transition-colors hover:text-foreground">Explore projects</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-semibold text-foreground transition-colors hover:text-primary sm:block">Log in</Link>
            <Button asChild size="sm"><Link to="/signup">Get started <ArrowUpRight size={15} /></Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-primary-foreground">
        <img src={terrainAerial} width={1600} height={1104} alt="Satellite view of alpine mountain terrain and a turquoise river" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 terrain-shade" />
        <div className="absolute inset-0 terrain-bottom-shade" />
        <div className="absolute inset-0 grid-dark opacity-40" />
        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1440px] flex-col justify-center px-5 pb-28 pt-16 sm:px-12 sm:min-h-[680px] lg:min-h-[700px] lg:px-20">
          <Reveal>
            <span className="inline-flex w-fit items-center gap-2 border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[.15em] backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-lime" /> AI single-view terrain intelligence
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-7 max-w-[820px] font-display text-[clamp(2.8rem,6.5vw,5.8rem)] font-bold leading-[1.05]">
              DepthWizard<span className="text-lime">.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-[600px] font-display text-xl leading-snug text-primary-foreground/90 sm:text-2xl">
              From one overhead image to an explorable 3D world.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-5 max-w-[520px] text-sm leading-7 text-primary-foreground/70 sm:text-base">
              DepthWizard estimates height from a single satellite or aerial image, maps elevation and lets you fly through the terrain in 3D.
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button variant="lime" size="lg" asChild>
                <Link to="/upload">Start Analysis <ArrowRight size={18} /></Link>
              </Button>
              <Button variant="sidebarGhost" size="lg" asChild>
                <a href="#how-it-works">How it works <ArrowUpRight size={17} /></a>
              </Button>
            </div>
          </Reveal>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-primary-foreground/20 px-5 py-5 text-[10px] font-semibold uppercase tracking-[.15em] text-primary-foreground/65 sm:px-12 lg:px-20">
          <span>01 / Single overhead image</span>
          <span className="hidden sm:block">Depth · Elevation · 3D</span>
          <span>Scroll to explore ↓</span>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 lg:px-12 lg:py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">The project in one paragraph</p>
          <p className="mt-5 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">
            DepthWizard is an AI system that reads a single overhead photograph and reconstructs what the camera can't show —
            <span className="text-primary"> height, elevation and three-dimensional terrain</span> — then presents it as an interactive flythrough.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            The workflow is simple: upload an image, let the model estimate depth, review the elevation results, and explore the reconstructed terrain. This build is a working frontend demo of that pipeline.
          </p>
        </Reveal>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border bg-secondary/50 py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-12">
          <Reveal className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">How it works</p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">Five steps, one image.</h2>
            <p className="mt-5 leading-7 text-muted-foreground">Every analysis follows the same path — from a flat image on your screen to a landscape you can fly through.</p>
          </Reveal>
          <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 90} className="h-full">
                <div className="relative flex h-full flex-col bg-card p-6 lg:min-h-[290px]">
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-md bg-secondary text-primary"><s.icon size={22} /></span>
                    <span className="font-display text-xs font-bold text-muted-foreground">{s.num}</span>
                  </div>
                  <h3 className="mt-10 font-display text-lg font-bold text-ink">{s.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{s.body}</p>
                  {i < steps.length - 1 && <ArrowRight size={16} className="absolute -right-3 top-11 z-10 hidden size-6 place-items-center rounded-full border border-border bg-background text-primary lg:grid" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1440px] px-5 py-20 lg:px-12 lg:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Key features</p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">Built around the terrain.</h2>
          </div>
          <Button variant="outline" asChild><Link to="/upload">Try the demo <ArrowUpRight /></Link></Button>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90} className="h-full">
              <div className="group h-full border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <span className="grid size-11 place-items-center rounded-md bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><f.icon size={22} /></span>
                <h3 className="mt-6 font-display text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Applications */}
      <section id="applications" className="bg-ink py-20 text-primary-foreground lg:py-28">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20 lg:px-12">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden">
              <img loading="lazy" src={terrainAlt} width={1200} height={912} alt="Overhead mountainous terrain" className="h-full w-full object-cover" />
              <div className="absolute bottom-5 left-5 border border-primary-foreground/20 bg-ink/85 px-5 py-4 backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[.15em] text-lime">Where it applies</p>
                <p className="mt-2 font-display text-2xl font-bold">Terrain, understood</p>
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-lime">Applications</p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">One pipeline, many use cases.</h2>
              <p className="mt-5 max-w-lg leading-7 text-primary-foreground/65">Whenever a flat overhead image needs to become understandable terrain, DepthWizard can help.</p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-10 border-t border-primary-foreground/20">
                {applications.map((a) => (
                  <div key={a.title} className="flex items-start gap-4 border-b border-primary-foreground/20 py-5">
                    <Mountain size={18} className="mt-1 shrink-0 text-lime" />
                    <div>
                      <p className="font-display text-lg font-semibold">{a.title}</p>
                      <p className="mt-1 text-sm leading-6 text-primary-foreground/60">{a.body}</p>
                    </div>
                    <ChevronRight size={16} className="ml-auto mt-2 shrink-0 text-primary-foreground/40" />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 px-5 py-20 lg:flex-row lg:items-center lg:px-12">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Ready when you are</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Go beyond the surface.</h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/upload">Start Analysis <ArrowRight /></Link></Button>
            <Button variant="outline" size="lg" asChild><Link to="/history">Explore projects <FolderClock size={16} /></Link></Button>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50">
        <div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-12">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="max-w-sm">
              <Brand />
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Single-view height estimation and 3D terrain flythrough from overhead imagery.</p>
            </div>
            <div className="flex flex-wrap gap-12 sm:gap-16">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.15em] text-ink">Product</p>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  <li><a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a></li>
                  <li><a href="#features" className="transition-colors hover:text-foreground">Features</a></li>
                  <li><a href="#applications" className="transition-colors hover:text-foreground">Applications</a></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.15em] text-ink">Workspace</p>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  <li><Link to="/login" className="transition-colors hover:text-foreground">Log in</Link></li>
                  <li><Link to="/signup" className="transition-colors hover:text-foreground">Sign up</Link></li>
                  <li><Link to="/upload" className="transition-colors hover:text-foreground">Start Analysis</Link></li>
                  <li><Link to="/history" className="transition-colors hover:text-foreground">Projects</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">© 2026 DepthWizard · Built for SIH</p>
            <p className="text-xs text-muted-foreground">Demo build — frontend only, sample data</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
