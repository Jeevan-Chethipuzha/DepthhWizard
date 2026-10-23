import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, ChartNoAxesCombined, ChevronDown, CircleHelp, FolderClock, LayoutDashboard, Menu, Mountain, Plus, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/upload", label: "New analysis", icon: ScanLine },
  { to: "/history", label: "Projects", icon: FolderClock },
];

export function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" className={`inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-normal ${light ? "text-primary-foreground" : "text-ink"}`} aria-label="DepthWizard home"><span className={`grid size-9 place-items-center rounded-md ${light ? "bg-lime text-lime-foreground" : "bg-primary text-primary-foreground"}`}><Mountain size={20} strokeWidth={2.5} /></span><span>Depth<span className={light ? "text-lime" : "text-primary"}>Wizard</span></span></Link>;
}

export function AppShell({ children, title, subtitle, action }: { children: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: s => s.location.pathname });
  return <div className="min-h-screen bg-background lg:flex">
    <aside className={`${open ? "flex" : "hidden"} fixed inset-0 z-40 flex-col bg-ink px-5 py-6 text-primary-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:px-5`}>
      <div className="flex items-center justify-between px-2"><Brand light /><Button variant="sidebarGhost" size="icon" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X /></Button></div>
      <div className="mt-12 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-primary-foreground/40">Workspace</div>
      <nav className="mt-4 space-y-1" aria-label="Main navigation">{nav.map(item => <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors ${path === item.to ? "bg-primary-foreground/12 text-lime" : "text-primary-foreground/65 hover:bg-primary-foreground/8 hover:text-primary-foreground"}`}><item.icon size={18} />{item.label}</Link>)}</nav>
      <div className="mt-auto border-t border-primary-foreground/12 pt-5"><div className="flex items-center gap-3 px-2"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime font-display text-xs font-bold text-lime-foreground">DW</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Demo workspace</p><p className="text-xs text-primary-foreground/45">SIH project</p></div><ChevronDown size={15} className="text-primary-foreground/40" /></div><Link to="/" className="mt-5 flex items-center gap-2 px-3 text-xs text-primary-foreground/50 hover:text-primary-foreground"><CircleHelp size={15} /> About DepthWizard <ArrowUpRight size={13} /></Link></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur-md lg:h-20 lg:px-10"><div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></Button><div className="min-w-0"><p className="hidden text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground sm:block">Workspace / <span className="text-primary">{title}</span></p><p className="truncate font-display text-base font-bold lg:hidden">{title}</p></div></div><div className="flex shrink-0 items-center gap-3"><span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="size-1.5 rounded-full bg-sea" />System ready</span><Button size="sm" asChild><Link to="/upload"><Plus size={16} /> <span className="hidden sm:inline">New analysis</span></Link></Button></div></header>
      <main className="mx-auto max-w-[1500px] px-5 py-8 lg:px-10 lg:py-10"><div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><div className="min-w-0"><h1 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{title}</h1>{subtitle && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>{children}</main>
    </div>
  </div>;
}

export function StatLabel({ children }: { children: React.ReactNode }) { return <p className="text-[11px] font-bold uppercase tracking-[.14em] text-muted-foreground">{children}</p>; }
export function SectionHeading({ title, link, to }: { title: string; link?: string; to?: "/history" | "/upload" | "/results" }) { return <div className="mb-5 flex items-center justify-between gap-4"><h2 className="font-display text-xl font-bold text-ink">{title}</h2>{link && to && <Link to={to} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{link}<ArrowUpRight size={15} /></Link>}</div>; }
export function MetricIcon() { return <ChartNoAxesCombined size={20} />; }
