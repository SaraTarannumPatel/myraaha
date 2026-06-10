// CareerMap — Google Maps for Careers.
// Full-viewport canvas map with Google-Maps-style search, layers, pins,
// PathFinder routes, RoleView, Dream Board, and Journey Timeline surfaces.
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Bookmark,
  Briefcase,
  Building2,
  Camera,
  Car,
  Clock,
  Compass,
  GraduationCap,
  IndianRupee,
  Layers,
  Locate,
  MapPin,
  Mic,
  Minus,
  Navigation,
  Play,
  Plus,
  Route,
  Search,
  Share2,
  ShieldAlert,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  FALLBACK_MAP_ROLES,
  SECTOR_HUES,
  loadMapRoles,
  nearestRole,
  roleMetrics,
  screenToWorld,
  sectorColor,
  sectorFill,
  sectorHulls,
  worldToScreen,
  type MapRole,
  type Viewport,
} from "@/lib/careerMap";

type ViewMode = "default" | "skills" | "lifestyle";
type Overlay = "hiring" | "salary" | "automation" | "remote" | "gates";
type RouteMode = "fastest" | "safest" | "no-cost";

const SECTOR_LIST = Object.keys(SECTOR_HUES);

const CHIPS = [
  "High demand",
  "No degree path",
  "Remote-friendly",
  "Under 12 months",
  "Exam gates",
  "AI-safe",
];

const ROLE_TABS = [
  "overview",
  "day",
  "skills",
  "match",
  "salary",
  "ladder",
  "gates",
  "education",
  "companies",
  "cities",
  "ai",
  "similar",
  "lifestyle",
  "reality",
  "workspace",
  "challenge",
  "trends",
  "next",
];

export default function CareerMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const { data: liveRoles = [], isLoading, isError } = useQuery({
    queryKey: ["careermap-roles"],
    queryFn: loadMapRoles,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const roles = liveRoles.length ? liveRoles : FALLBACK_MAP_ROLES;
  const [vp, setVp] = useState<Viewport>({ width: 1200, height: 760, zoom: 1.15, panX: 0, panY: 0 });
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MapRole | null>(null);
  const [hoverRole, setHoverRole] = useState<MapRole | null>(null);
  const [routeTarget, setRouteTarget] = useState<MapRole | null>(null);
  const [routeMode, setRouteMode] = useState<RouteMode>("fastest");
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [layersOpen, setLayersOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [dreamOpen, setDreamOpen] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState<Set<Overlay>>(new Set(["hiring"]));
  const [activeSectors, setActiveSectors] = useState<Set<string>>(new Set(SECTOR_LIST));
  const [youAreHere, setYouAreHere] = useState<{ x: number; y: number; label: string } | null>(null);

  const visibleRoles = useMemo(
    () => roles.filter((role) => activeSectors.has(role.sector_name)),
    [roles, activeSectors]
  );
  const hulls = useMemo(() => sectorHulls(visibleRoles), [visibleRoles]);
  const journeyItems = useMemo(() => roles.slice(3, 11), [roles]);
  const dreamItems = useMemo(() => [roles[1], roles[4], roles[7], roles[10]].filter(Boolean), [roles]);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return;
    const resize = () => {
      const rect = node.getBoundingClientRect();
      setVp((v) => ({ ...v, width: Math.max(320, rect.width), height: Math.max(420, rect.height) }));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!roles.length) return;
    if (!user) {
      const starter = roles.find((r) => r.role_name.toLowerCase().includes("data scientist")) || roles[0];
      setYouAreHere({ x: starter.coord_x - 12, y: starter.coord_y + 6, label: "Exploration start" });
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_signals")
        .select("signal_value, strength")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (!data?.length) {
        const starter = roles[0];
        setYouAreHere({ x: starter.coord_x, y: starter.coord_y, label: "Curiosity Compass start" });
        return;
      }
      const freq: Record<string, number> = {};
      data.forEach((signal: any) => {
        const value = String(signal.signal_value || "").toLowerCase();
        freq[value] = (freq[value] || 0) + Number(signal.strength || 0.5);
      });
      let best: { role: MapRole; score: number } | null = null;
      for (const role of roles) {
        const haystack = `${role.role_name} ${role.domain_name ?? ""} ${role.career_cluster ?? ""}`.toLowerCase();
        const score = Object.entries(freq).reduce((sum, [token, strength]) => sum + (token.length > 3 && haystack.includes(token) ? strength : 0), 0);
        if (score > 0 && (!best || score > best.score)) best = { role, score };
      }
      const pin = best?.role || roles[0];
      setYouAreHere({ x: pin.coord_x, y: pin.coord_y, label: pin.role_name });
    })();
  }, [roles, user]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !vp.width || !vp.height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(vp.width * dpr);
    canvas.height = Math.round(vp.height * dpr);
    canvas.style.width = `${vp.width}px`;
    canvas.style.height = `${vp.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawMap(ctx, vp, visibleRoles, hulls, { viewMode, activeOverlays, selected, hoverRole, routeTarget, youAreHere, query });
  }, [vp, visibleRoles, hulls, viewMode, activeOverlays, selected, hoverRole, routeTarget, youAreHere, query]);

  const searchHits = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return roles.slice(0, 7);
    return roles
      .filter((role) => {
        const hay = `${role.role_name} ${role.sector_name} ${role.domain_name ?? ""} ${role.career_cluster ?? ""}`.toLowerCase();
        return hay.includes(text);
      })
      .slice(0, 12);
  }, [roles, query]);

  const flyTo = (role: MapRole, zoom = 5) => {
    setSelected(role);
    setVp((v) => ({ ...v, zoom: Math.max(v.zoom, zoom), panX: -role.coord_x, panY: -role.coord_y }));
  };

  const startRoute = (role: MapRole) => {
    setRouteTarget(role);
    setSelected(role);
    setVp((v) => ({ ...v, zoom: Math.max(2.4, v.zoom), panX: -role.coord_x * 0.45, panY: -role.coord_y * 0.45 }));
    toast.success(`PathFinder is plotting ${routeMode.replace("-", " ")} route to ${role.role_name}`);
  };

  const recenter = () => {
    if (!youAreHere) return toast.info("Finish Curiosity Compass to lock your live career GPS pin.");
    setVp((v) => ({ ...v, zoom: 3.2, panX: -youAreHere.x, panY: -youAreHere.y }));
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { x: event.clientX, y: event.clientY, panX: vp.panX, panY: vp.panY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    if (dragRef.current) {
      const scale = (Math.min(vp.width, vp.height) / 220) * vp.zoom;
      setVp((v) => ({
        ...v,
        panX: dragRef.current!.panX + (event.clientX - dragRef.current!.x) / scale,
        panY: dragRef.current!.panY - (event.clientY - dragRef.current!.y) / scale,
      }));
      return;
    }
    const world = screenToWorld(vp, sx, sy);
    setHoverRole(nearestRole(visibleRoles, world.x, world.y, Math.max(1.5, 5 / vp.zoom)));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const moved = dragRef.current && (Math.abs(event.clientX - dragRef.current.x) > 4 || Math.abs(event.clientY - dragRef.current.y) > 4);
    dragRef.current = null;
    if (moved) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const world = screenToWorld(vp, event.clientX - rect.left, event.clientY - rect.top);
    const role = nearestRole(visibleRoles, world.x, world.y, Math.max(1.6, 6 / vp.zoom));
    if (role) setSelected(role);
  };

  const toggleOverlay = (overlay: Overlay) => {
    setActiveOverlays((current) => {
      const next = new Set(current);
      next.has(overlay) ? next.delete(overlay) : next.add(overlay);
      return next;
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen">
      <div className="fixed inset-x-0 top-14 bottom-16 z-10 overflow-hidden bg-background lg:left-64 lg:top-0 lg:bottom-0">
        <div ref={mapRef} className="relative h-full w-full overflow-hidden bg-muted">
          <div
            className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (dragRef.current = null)}
            onPointerLeave={() => {
              dragRef.current = null;
              setHoverRole(null);
            }}
            onWheel={(event) => {
              event.preventDefault();
              const factor = event.deltaY < 0 ? 1.18 : 1 / 1.18;
              setVp((v) => ({ ...v, zoom: Math.max(0.55, Math.min(24, v.zoom * factor)) }));
            }}
          >
            <canvas ref={canvasRef} className="block" />
          </div>

          <TopSearch
            query={query}
            setQuery={setQuery}
            hits={searchHits}
            onPick={(role) => {
              flyTo(role);
              setQuery(role.role_name);
            }}
            isLoading={isLoading && !liveRoles.length}
            isFallback={isError || !liveRoles.length}
            roleCount={liveRoles.length || 18033}
          />

          <div className="absolute left-4 top-28 z-20 hidden w-80 space-y-3 xl:block">
            <DirectionsPanel target={routeTarget || selected} mode={routeMode} setMode={setRouteMode} onStart={startRoute} />
            <ExploreNearby roles={roles.slice(0, 8)} onPick={flyTo} />
          </div>

          <div className="absolute right-4 top-24 z-20 flex flex-col gap-2">
            <IconButton label="Layers" active={layersOpen} onClick={() => setLayersOpen((v) => !v)} icon={<Layers className="h-5 w-5" />} />
            <IconButton label="Recenter" onClick={recenter} icon={<Locate className="h-5 w-5" />} />
            <IconButton label="Dream Board" active={dreamOpen} onClick={() => setDreamOpen((v) => !v)} icon={<Bookmark className="h-5 w-5" />} />
            <IconButton label="Timeline" active={timelineOpen} onClick={() => setTimelineOpen((v) => !v)} icon={<Clock className="h-5 w-5" />} />
          </div>

          <div className="absolute bottom-24 right-4 z-20 overflow-hidden rounded-md border bg-card shadow-lg lg:bottom-6">
            <button className="grid h-10 w-10 place-items-center hover:bg-accent" onClick={() => setVp((v) => ({ ...v, zoom: Math.min(24, v.zoom * 1.28) }))} aria-label="Zoom in">
              <Plus className="h-4 w-4" />
            </button>
            <button className="grid h-10 w-10 place-items-center border-t hover:bg-accent" onClick={() => setVp((v) => ({ ...v, zoom: Math.max(0.55, v.zoom / 1.28) }))} aria-label="Zoom out">
              <Minus className="h-4 w-4" />
            </button>
            <button className="grid h-10 w-10 place-items-center border-t hover:bg-accent" onClick={() => setVp((v) => ({ ...v, zoom: 1.15, panX: 0, panY: 0 }))} aria-label="Reset map">
              <Compass className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute bottom-24 left-4 z-20 flex max-w-[calc(100%-6rem)] gap-2 overflow-x-auto pb-1 lg:bottom-6 lg:left-96">
            {CHIPS.map((chip) => (
              <button key={chip} className="shrink-0 rounded-full border bg-card/95 px-4 py-2 text-xs font-medium shadow-sm backdrop-blur hover:bg-accent" onClick={() => toast.info(`${chip} filter applied to CareerMap`)}>
                {chip}
              </button>
            ))}
          </div>

          {layersOpen && (
            <LayersPanel
              viewMode={viewMode}
              setViewMode={setViewMode}
              activeOverlays={activeOverlays}
              toggleOverlay={toggleOverlay}
              activeSectors={activeSectors}
              setActiveSectors={setActiveSectors}
              close={() => setLayersOpen(false)}
            />
          )}

          {timelineOpen && <FloatingCollection title="Journey Timeline" icon={<Clock className="h-4 w-4" />} roles={journeyItems} onPick={flyTo} onClose={() => setTimelineOpen(false)} />}
          {dreamOpen && <FloatingCollection title="Dream Board" icon={<Bookmark className="h-4 w-4" />} roles={dreamItems} onPick={flyTo} onClose={() => setDreamOpen(false)} />}

          {hoverRole && !dragRef.current && <HoverCard role={hoverRole} vp={vp} />}

          <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
            <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-2xl">
              {selected && <RoleView role={selected} onRoute={startRoute} onRoadmap={() => navigate("/dashboard/roadmap", { state: { entity: selected.role_name } })} />}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

function drawMap(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  roles: MapRole[],
  hulls: ReturnType<typeof sectorHulls>,
  opts: {
    viewMode: ViewMode;
    activeOverlays: Set<Overlay>;
    selected: MapRole | null;
    hoverRole: MapRole | null;
    routeTarget: MapRole | null;
    youAreHere: { x: number; y: number; label: string } | null;
    query: string;
  }
) {
  const isSkills = opts.viewMode === "skills";
  const isLifestyle = opts.viewMode === "lifestyle";
  const bg = isSkills ? "hsl(220, 36%, 96%)" : isLifestyle ? "hsl(150, 26%, 95%)" : "hsl(42, 44%, 96%)";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, vp.width, vp.height);

  drawGrid(ctx, vp);
  drawCareerRoads(ctx, vp, roles);

  for (const hull of hulls) {
    if (hull.hull.length < 3) continue;
    ctx.beginPath();
    hull.hull.forEach((point, index) => {
      const { sx, sy } = worldToScreen(vp, point.x, point.y);
      index === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.fillStyle = sectorFill(hull.sector, isSkills ? 0.1 : 0.18);
    ctx.fill();
    ctx.strokeStyle = sectorColor(hull.sector, 0.42);
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  drawRoute(ctx, vp, opts.youAreHere, opts.routeTarget);

  const query = opts.query.trim().toLowerCase();
  for (const role of roles) {
    const { sx, sy } = worldToScreen(vp, role.coord_x, role.coord_y);
    if (sx < -20 || sx > vp.width + 20 || sy < -20 || sy > vp.height + 20) continue;
    const metrics = roleMetrics(role);
    const match = query && `${role.role_name} ${role.sector_name}`.toLowerCase().includes(query);
    let fill = sectorColor(role.sector_name, 0.86);
    if (opts.activeOverlays.has("salary")) fill = salaryColor(metrics.salaryHigh);
    if (opts.activeOverlays.has("automation")) fill = riskColor(metrics.automation);
    if (opts.activeOverlays.has("remote") && metrics.remote) fill = "hsla(210, 80%, 48%, 0.95)";
    if (opts.activeOverlays.has("gates") && metrics.gateCount) fill = "hsla(358, 70%, 48%, 0.95)";
    const radius = Math.max(2, Math.min(7, 2.4 * Math.sqrt(vp.zoom))) + (metrics.hiring > 82 ? 1.6 : 0) + (match ? 3 : 0);
    if (opts.activeOverlays.has("hiring") && metrics.hiring > 76) {
      ctx.strokeStyle = "hsla(145, 72%, 42%, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
    if (match || role.id === opts.selected?.id || role.id === opts.hoverRole?.id) {
      ctx.strokeStyle = "hsl(0, 0%, 100%)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  drawLabels(ctx, vp, hulls);
  if (opts.youAreHere) drawYouAreHere(ctx, vp, opts.youAreHere);
}

function drawGrid(ctx: CanvasRenderingContext2D, vp: Viewport) {
  ctx.strokeStyle = "hsla(218, 18%, 62%, 0.16)";
  ctx.lineWidth = 1;
  for (let g = -120; g <= 120; g += 20) {
    const a = worldToScreen(vp, g, -120);
    const b = worldToScreen(vp, g, 120);
    const c = worldToScreen(vp, -120, g);
    const d = worldToScreen(vp, 120, g);
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c.sx, c.sy);
    ctx.lineTo(d.sx, d.sy);
    ctx.stroke();
  }
}

function drawCareerRoads(ctx: CanvasRenderingContext2D, vp: Viewport, roles: MapRole[]) {
  const byCluster = new Map<number, MapRole[]>();
  roles.forEach((role) => {
    if (role.cluster_id == null) return;
    const bucket = byCluster.get(role.cluster_id) || [];
    if (bucket.length < 16) bucket.push(role);
    byCluster.set(role.cluster_id, bucket);
  });
  ctx.lineCap = "round";
  byCluster.forEach((bucket, clusterId) => {
    if (bucket.length < 3) return;
    const sorted = bucket.slice().sort((a, b) => a.coord_x - b.coord_x);
    ctx.strokeStyle = clusterId % 2 ? "hsla(45, 18%, 48%, 0.24)" : "hsla(215, 18%, 45%, 0.2)";
    ctx.lineWidth = Math.max(1, 1.8 * Math.sqrt(vp.zoom));
    ctx.beginPath();
    sorted.forEach((role, index) => {
      const { sx, sy } = worldToScreen(vp, role.coord_x, role.coord_y);
      index === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.stroke();
  });
}

function drawRoute(ctx: CanvasRenderingContext2D, vp: Viewport, start: { x: number; y: number } | null, target: MapRole | null) {
  if (!start || !target) return;
  const a = worldToScreen(vp, start.x, start.y);
  const b = worldToScreen(vp, target.coord_x, target.coord_y);
  const midX = (a.sx + b.sx) / 2;
  const midY = (a.sy + b.sy) / 2 - 70;
  ctx.strokeStyle = "hsla(214, 92%, 48%, 0.95)";
  ctx.lineWidth = 6;
  ctx.setLineDash([16, 10]);
  ctx.beginPath();
  ctx.moveTo(a.sx, a.sy);
  ctx.quadraticCurveTo(midX, midY, b.sx, b.sy);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "hsl(214, 92%, 48%)";
  ctx.beginPath();
  ctx.arc(b.sx, b.sy, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawLabels(ctx: CanvasRenderingContext2D, vp: Viewport, hulls: ReturnType<typeof sectorHulls>) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  hulls.forEach((hull) => {
    const { sx, sy } = worldToScreen(vp, hull.centroid.x, hull.centroid.y);
    if (sx < -80 || sx > vp.width + 80 || sy < -40 || sy > vp.height + 40) return;
    const short = hull.sector.replace(/ &.*$/, "").replace(/,.*/, "");
    ctx.font = `${Math.max(12, Math.min(22, 11 * Math.sqrt(vp.zoom)))}px Poppins, ui-sans-serif`;
    ctx.strokeStyle = "hsla(42, 44%, 96%, 0.9)";
    ctx.lineWidth = 5;
    ctx.strokeText(short, sx, sy);
    ctx.fillStyle = "hsla(222, 38%, 19%, 0.86)";
    ctx.fillText(short, sx, sy);
  });
}

function drawYouAreHere(ctx: CanvasRenderingContext2D, vp: Viewport, pin: { x: number; y: number }) {
  const { sx, sy } = worldToScreen(vp, pin.x, pin.y);
  ctx.fillStyle = "hsl(214, 92%, 48%)";
  ctx.beginPath();
  ctx.arc(sx, sy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "hsla(214, 92%, 48%, 0.28)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(sx, sy, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(sx, sy, 4, 0, Math.PI * 2);
  ctx.fill();
}

function salaryColor(high: number) {
  if (high >= 25) return "hsla(358, 72%, 48%, 0.9)";
  if (high >= 16) return "hsla(30, 86%, 50%, 0.9)";
  if (high >= 9) return "hsla(48, 86%, 46%, 0.9)";
  return "hsla(145, 54%, 42%, 0.9)";
}

function riskColor(risk: number) {
  if (risk > 68) return "hsla(358, 72%, 48%, 0.9)";
  if (risk > 42) return "hsla(38, 86%, 50%, 0.9)";
  return "hsla(145, 54%, 42%, 0.9)";
}

function TopSearch({ query, setQuery, hits, onPick, isLoading, isFallback, roleCount }: { query: string; setQuery: (value: string) => void; hits: MapRole[]; onPick: (role: MapRole) => void; isLoading: boolean; isFallback: boolean; roleCount: number }) {
  return (
    <div className="absolute left-4 right-20 top-4 z-30 md:left-6 md:right-auto md:w-[560px]">
      <div className="rounded-2xl border bg-card/98 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search careers, skills, companies, paths…" className="h-11 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent" onClick={() => toast.info("Voice career search is listening in demo mode.")} aria-label="Voice search">
            <Mic className="h-4 w-4" />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent" onClick={() => toast.info("Upload a JD screenshot to find similar roles.")} aria-label="Visual search">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
          {isLoading ? "Plotting the career universe…" : `${roleCount.toLocaleString()} roles mapped • 17 sectors • 229-D KSAO GPS`} {isFallback ? "• demo cache active" : "• live data"}
        </div>
        {(query || hits.length > 0) && (
          <div className="max-h-80 overflow-y-auto border-t">
            {hits.map((role) => {
              const metrics = roleMetrics(role);
              return (
                <button key={role.id} onClick={() => onPick(role)} className="flex w-full items-center gap-3 border-b px-3 py-3 text-left last:border-b-0 hover:bg-accent">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: sectorFill(role.sector_name, 0.5), color: sectorColor(role.sector_name) }}>
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{role.role_name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{role.sector_name} • {metrics.match}% match • {metrics.months} months away</span>
                  </span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">₹{metrics.salaryLow}-{metrics.salaryHigh}L</Badge>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DirectionsPanel({ target, mode, setMode, onStart }: { target: MapRole | null; mode: RouteMode; setMode: (mode: RouteMode) => void; onStart: (role: MapRole) => void }) {
  const metrics = target ? roleMetrics(target) : null;
  return (
    <div className="rounded-2xl border bg-card/95 p-4 shadow-xl backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <Route className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold">PathFinder™</h2>
      </div>
      <div className="rounded-xl border bg-background p-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground"><Locate className="h-4 w-4 text-primary" /> You are here</div>
        <div className="ml-2 h-7 border-l border-dashed" />
        <div className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-destructive" /> {target?.role_name || "Pick a destination"}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {(["fastest", "safest", "no-cost"] as RouteMode[]).map((item) => (
          <button key={item} onClick={() => setMode(item)} className={`rounded-xl border px-2 py-2 text-[11px] capitalize ${mode === item ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}>
            {item.replace("-", " ")}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
        <Metric label="ETA" value={metrics ? `${metrics.months} mo` : "—"} />
        <Metric label="Gates" value={metrics ? `${metrics.gateCount}` : "—"} />
        <Metric label="Fit" value={metrics ? `${metrics.match}%` : "—"} />
      </div>
      <Button disabled={!target} className="mt-3 w-full" onClick={() => target && onStart(target)}>
        <Navigation className="mr-2 h-4 w-4" /> Start navigation
      </Button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-muted px-2 py-2"><div className="font-bold">{value}</div><div className="text-muted-foreground">{label}</div></div>;
}

function ExploreNearby({ roles, onPick }: { roles: MapRole[]; onPick: (role: MapRole) => void }) {
  return (
    <div className="rounded-2xl border bg-card/95 p-4 shadow-xl backdrop-blur">
      <h2 className="mb-3 text-sm font-bold">Explore nearby careers</h2>
      <div className="space-y-2">
        {roles.map((role) => (
          <button key={role.id} onClick={() => onPick(role)} className="flex w-full items-center gap-2 rounded-xl border bg-background p-2 text-left hover:bg-accent">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: sectorColor(role.sector_name) }} />
            <span className="min-w-0 flex-1 truncate text-xs font-medium">{role.role_name}</span>
            <span className="text-[10px] text-muted-foreground">{roleMetrics(role).match}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function IconButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className={`grid h-11 w-11 place-items-center rounded-full border shadow-lg backdrop-blur ${active ? "bg-primary text-primary-foreground" : "bg-card/95 hover:bg-accent"}`}>
      {icon}
    </button>
  );
}

function LayersPanel({ viewMode, setViewMode, activeOverlays, toggleOverlay, activeSectors, setActiveSectors, close }: { viewMode: ViewMode; setViewMode: (mode: ViewMode) => void; activeOverlays: Set<Overlay>; toggleOverlay: (overlay: Overlay) => void; activeSectors: Set<string>; setActiveSectors: (value: Set<string>) => void; close: () => void }) {
  const overlays: { id: Overlay; label: string; icon: React.ReactNode }[] = [
    { id: "hiring", label: "Live Hiring Pulse", icon: <Activity className="h-4 w-4" /> },
    { id: "salary", label: "Salary Heat", icon: <IndianRupee className="h-4 w-4" /> },
    { id: "automation", label: "AI Risk", icon: <ShieldAlert className="h-4 w-4" /> },
    { id: "remote", label: "Remote-Friendly", icon: <Briefcase className="h-4 w-4" /> },
    { id: "gates", label: "Exam Gates", icon: <GraduationCap className="h-4 w-4" /> },
  ];
  return (
    <div className="absolute right-16 top-24 z-30 w-[330px] max-w-[calc(100vw-5rem)] rounded-2xl border bg-card/98 p-4 shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold">Career layers</h2></div>
        <button onClick={close} aria-label="Close layers"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(["default", "skills", "lifestyle"] as ViewMode[]).map((mode) => (
          <button key={mode} onClick={() => setViewMode(mode)} className={`rounded-xl border px-2 py-2 text-[11px] capitalize ${viewMode === mode ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}>{mode}</button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {overlays.map((overlay) => (
          <div key={overlay.id} className="flex items-center justify-between rounded-xl border bg-background px-3 py-2">
            <Label className="flex items-center gap-2 text-xs">{overlay.icon}{overlay.label}</Label>
            <Switch checked={activeOverlays.has(overlay.id)} onCheckedChange={() => toggleOverlay(overlay.id)} />
          </div>
        ))}
      </div>
      <div className="mt-4 max-h-56 space-y-1 overflow-y-auto pr-1">
        {SECTOR_LIST.map((sector) => (
          <label key={sector} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-accent">
            <input type="checkbox" checked={activeSectors.has(sector)} onChange={(event) => {
              const next = new Set(activeSectors);
              event.target.checked ? next.add(sector) : next.delete(sector);
              setActiveSectors(next);
            }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: sectorColor(sector) }} />
            <span className="min-w-0 flex-1 truncate">{sector}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FloatingCollection({ title, icon, roles, onPick, onClose }: { title: string; icon: React.ReactNode; roles: MapRole[]; onPick: (role: MapRole) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-24 left-4 right-4 z-30 rounded-2xl border bg-card/98 p-4 shadow-2xl backdrop-blur md:left-auto md:right-20 md:top-[360px] md:h-fit md:w-96">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">{icon}<h2 className="text-sm font-bold">{title}</h2></div>
        <button onClick={onClose} aria-label={`Close ${title}`}><X className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-3 overflow-x-auto md:block md:space-y-2">
        {roles.map((role, index) => (
          <button key={role.id} onClick={() => onPick(role)} className="min-w-64 rounded-xl border bg-background p-3 text-left hover:bg-accent md:w-full">
            <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground"><span>{index + 1}</span><span className="h-2 w-2 rounded-full" style={{ background: sectorColor(role.sector_name) }} />{role.sector_name}</div>
            <div className="truncate text-sm font-semibold">{role.role_name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{roleMetrics(role).match}% match • {roleMetrics(role).demand}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HoverCard({ role, vp }: { role: MapRole; vp: Viewport }) {
  const metrics = roleMetrics(role);
  const { sx, sy } = worldToScreen(vp, role.coord_x, role.coord_y);
  return (
    <div className="pointer-events-none absolute z-20 w-72 rounded-xl border bg-card/95 p-3 text-xs shadow-xl backdrop-blur" style={{ left: Math.max(12, Math.min(vp.width - 300, sx + 14)), top: Math.max(88, Math.min(vp.height - 150, sy - 24)) }}>
      <div className="font-bold">{role.role_name}</div>
      <div className="mt-0.5 truncate text-muted-foreground">{role.sector_name}</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <Metric label="match" value={`${metrics.match}%`} />
        <Metric label="ETA" value={`${metrics.months}m`} />
        <Metric label="salary" value={`₹${metrics.salaryHigh}L`} />
      </div>
    </div>
  );
}

function RoleView({ role, onRoute, onRoadmap }: { role: MapRole; onRoute: (role: MapRole) => void; onRoadmap: () => void }) {
  const metrics = roleMetrics(role);
  return (
    <div>
      <div className="relative min-h-64 overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-25" style={{ background: `radial-gradient(circle at 20% 20%, ${sectorColor(role.sector_name, 0.9)}, transparent 36%), radial-gradient(circle at 78% 18%, hsl(var(--accent)), transparent 30%), linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.72))` }} />
        <div className="relative p-6">
          <Badge variant="secondary" className="mb-4">RoleView™</Badge>
          <SheetHeader>
            <SheetTitle className="text-left text-3xl leading-tight text-primary-foreground">{role.role_name}</SheetTitle>
            <SheetDescription className="text-left text-primary-foreground/80">{role.sector_name} · {role.domain_name || role.career_cluster}</SheetDescription>
          </SheetHeader>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroMetric icon={<Star className="h-4 w-4" />} label="Your match" value={`${metrics.match}%`} />
            <HeroMetric icon={<IndianRupee className="h-4 w-4" />} label="Salary" value={`₹${metrics.salaryLow}-${metrics.salaryHigh}L`} />
            <HeroMetric icon={<TrendingUp className="h-4 w-4" />} label="Demand" value={`${metrics.hiring}/100`} />
            <HeroMetric icon={<Clock className="h-4 w-4" />} label="Ready in" value={`${metrics.months} mo`} />
          </div>
        </div>
      </div>
      <div className="sticky top-0 z-10 border-b bg-card p-3">
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={() => onRoute(role)}><Navigation className="mr-2 h-4 w-4" />Path</Button>
          <Button variant="outline" onClick={() => toast.success("Saved to Dream Board") }><Bookmark className="mr-2 h-4 w-4" />Save</Button>
          <Button variant="outline" onClick={() => toast.info("Compare mode opened in demo") }><Car className="mr-2 h-4 w-4" />Compare</Button>
          <Button variant="outline" onClick={() => toast.success("Interest shared") }><Share2 className="mr-2 h-4 w-4" />Share</Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="p-4">
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <TabsList className="inline-flex h-auto w-max gap-1 bg-muted p-1">
            {ROLE_TABS.map((tab) => <TabsTrigger key={tab} value={tab} className="text-[11px] capitalize">{tab}</TabsTrigger>)}
          </TabsList>
        </ScrollArea>
        <TabContent role={role} metrics={metrics} onRoadmap={onRoadmap} />
      </Tabs>
    </div>
  );
}

function HeroMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 p-3 backdrop-blur"><div className="mb-1 flex items-center gap-1 text-primary-foreground/80">{icon}<span className="text-[10px] uppercase">{label}</span></div><div className="font-bold">{value}</div></div>;
}

function TabContent({ role, metrics, onRoadmap }: { role: MapRole; metrics: ReturnType<typeof roleMetrics>; onRoadmap: () => void }) {
  const rows = [
    ["overview", <OverviewTab role={role} metrics={metrics} />],
    ["day", <MediaTab title="Day-in-Life" icon={<Play className="h-5 w-5" />} text={`A 9 AM to 6 PM simulated POV: ${role.role_name} reviews priorities, collaborates with teams, uses core tools, and closes the day with measurable outcomes.`} />],
    ["skills", <KsaoPanel role={role} />],
    ["match", <MatchTab metrics={metrics} />],
    ["salary", <SalaryTab metrics={metrics} />],
    ["ladder", <LadderTab role={role} />],
    ["gates", <GateTab role={role} metrics={metrics} />],
    ["education", <CardGrid items={["Degree route", "Bootcamp route", "Self-taught portfolio", "Certification stack"]} icon={<GraduationCap className="h-4 w-4" />} />],
    ["companies", <CardGrid items={["Tata Group", "Infosys", "Reliance", "Zomato", "Apollo", "Govt missions"]} icon={<Building2 className="h-4 w-4" />} />],
    ["cities", <CardGrid items={["Bengaluru", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Tier 3 remote"]} icon={<MapPin className="h-4 w-4" />} />],
    ["ai", <MediaTab title="AI Impact" icon={<ShieldAlert className="h-5 w-5" />} text={`${metrics.automation}% automation pressure. The safest path is to stack judgment, communication, domain context, and tool fluency.`} />],
    ["similar", <CardGrid items={["Adjacent role", "Higher ladder role", "Cross-sector bridge", "Lower-gate alternative"]} icon={<Route className="h-4 w-4" />} />],
    ["lifestyle", <LifestyleTab />],
    ["reality", <MediaTab title="Reality Checks™" icon={<Users className="h-5 w-5" />} text="Short professional testimonials, day-pressure notes, hidden tradeoffs, and honest advice from people already doing this work." />],
    ["workspace", <MediaTab title="Workspace Tour" icon={<Camera className="h-5 w-5" />} text="Interactive desk, tools, dashboards, files, meetings, and artifacts this career touches in a normal workday." />],
    ["challenge", <MediaTab title="Challenge Simulation" icon={<Activity className="h-5 w-5" />} text={`Try a 20-minute mini task from ${role.role_name}: diagnose, decide, create, and get feedback.`} />],
    ["trends", <MediaTab title="Market Trends" icon={<TrendingUp className="h-5 w-5" />} text={`${metrics.demand}. Hiring pulse is calculated from demand score, skill adjacency, company growth and competition intensity.`} />],
    ["next", <NextSteps onRoadmap={onRoadmap} />],
  ] as const;
  return <>{rows.map(([value, node]) => <TabsContent key={value} value={value} className="mt-4">{node}</TabsContent>)}</>;
}

function OverviewTab({ role, metrics }: { role: MapRole; metrics: ReturnType<typeof roleMetrics> }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="leading-relaxed text-muted-foreground">On a normal Tuesday, a {role.role_name} solves problems inside {role.domain_name || role.sector_name}, works with tools and teams, makes decisions, and ships outcomes that can be measured.</p>
      <Detail label="Sector" value={role.sector_name} />
      <Detail label="Career cluster" value={role.career_cluster || "—"} />
      <Detail label="Hiring pulse" value={`${metrics.demand} · ${metrics.hiring}/100`} />
      <Detail label="Time-to-ready" value={`${metrics.months} months from current GPS`} />
      <Detail label="Map logic" value="distance = weighted KSAO gap + gate load + portfolio proof needed" />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b py-2"><span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>;
}

function KsaoPanel({ role }: { role: MapRole }) {
  const { data, isLoading } = useQuery({
    queryKey: ["role-ksao", role.role_uuid],
    queryFn: async () => {
      if (role.role_uuid.startsWith("fallback")) return [];
      const { data } = await supabase
        .from("role_ksao_vectors")
        .select("weight, dimension:ksao_dimensions(dimension_name, layer_name)")
        .eq("role_id", role.role_uuid)
        .order("weight", { ascending: false })
        .limit(10);
      return data || [];
    },
  });
  const fallback = ["Domain knowledge", "Analytical thinking", "Communication", "Tool fluency", "Decision-making", "Collaboration", "Execution discipline", "Ethical judgment"].map((name, index) => ({ dimension: { dimension_name: name, layer_name: index < 2 ? "Knowledge" : index < 5 ? "Skill" : "Other" }, weight: 0.92 - index * 0.075 }));
  const rows = data?.length ? data : fallback;
  if (isLoading) return <div className="text-sm text-muted-foreground">Reading KSAO fingerprint…</div>;
  return <div className="space-y-3">{rows.map((item: any, index: number) => <ProgressRow key={index} label={item.dimension?.dimension_name || "KSAO"} sub={item.dimension?.layer_name || "Signal"} value={Math.round(Number(item.weight) * 100)} />)}</div>;
}

function ProgressRow({ label, sub, value }: { label: string; sub: string; value: number }) {
  return <div><div className="mb-1 flex justify-between text-xs"><span className="font-medium">{label}</span><span className="text-muted-foreground">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(100, value)}%` }} /></div><div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div></div>;
}

function MatchTab({ metrics }: { metrics: ReturnType<typeof roleMetrics> }) {
  return <div className="space-y-3"><ProgressRow label="Current fit" sub="Your GPS against role KSAO" value={metrics.match} /><ProgressRow label="Transferable skills" sub="Already useful from nearby territories" value={Math.min(96, metrics.match + 8)} /><ProgressRow label="Critical gaps" sub="Lower is better" value={100 - metrics.match} /><ProgressRow label="Confidence" sub="Based on signal density" value={84} /></div>;
}

function SalaryTab({ metrics }: { metrics: ReturnType<typeof roleMetrics> }) {
  return <CardGrid items={[`Entry: ₹${metrics.salaryLow}LPA`, `Mid: ₹${Math.round((metrics.salaryLow + metrics.salaryHigh) / 2)}LPA`, `Senior: ₹${metrics.salaryHigh}LPA`, "Bengaluru premium", "Tier 2 adjusted", "Freelance upside"]} icon={<IndianRupee className="h-4 w-4" />} />;
}

function LadderTab({ role }: { role: MapRole }) {
  return <div className="space-y-2">{["Explorer", "Intern / trainee", role.role_name, "Senior specialist", "Lead / manager", "Founder / expert"].map((step, i) => <div key={step} className="flex items-center gap-3 rounded-xl border p-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span><span className="font-medium">{step}</span></div>)}</div>;
}

function GateTab({ role, metrics }: { role: MapRole; metrics: ReturnType<typeof roleMetrics> }) {
  const gates = metrics.gateCount ? ["Mandatory entrance gate", "Licensing / certification gate"] : ["No mandatory national exam", "Portfolio proof gate"];
  return <CardGrid items={gates.concat([`${role.sector_name} readiness check`, "Mentor validation checkpoint"])} icon={<ShieldAlert className="h-4 w-4" />} />;
}

function LifestyleTab() {
  return <div className="grid gap-3 sm:grid-cols-2"><ProgressRow label="Work-life balance" sub="Typical weekly rhythm" value={72} /><ProgressRow label="Collaboration" sub="People intensity" value={78} /><ProgressRow label="Travel" sub="Location movement" value={34} /><ProgressRow label="Stress" sub="Pressure cycles" value={58} /></div>;
}

function MediaTab({ title, icon, text }: { title: string; icon: React.ReactNode; text: string }) {
  return <div className="rounded-2xl border bg-muted/40 p-4"><div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-card"><div className="text-center"><div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">{icon}</div><div className="font-bold">{title}</div><div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Play className="h-3 w-3" /> video <HeadphonesIcon /> audio <Camera className="h-3 w-3" /> 360°</div></div></div><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></div>;
}

function HeadphonesIcon() {
  return <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full border" /></span>;
}

function CardGrid({ items, icon }: { items: string[]; icon: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border p-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span><span className="text-sm font-medium">{item}</span></div>)}</div>;
}

function NextSteps({ onRoadmap }: { onRoadmap: () => void }) {
  return <div className="space-y-3"><CardGrid items={["Save this career", "Compare 3 alternatives", "Find a mentor", "Try a challenge"]} icon={<Star className="h-4 w-4" />} /><Button className="w-full" onClick={onRoadmap}><Navigation className="mr-2 h-4 w-4" />Open full AI Roadmap</Button></div>;
}