// CareerMap — Google Maps for Careers.
// Interactive 2D map of 18,033 roles laid out by KSAO similarity (UMAP).
// Click any pin for a Role Deep Dive; "Get Directions" hands off to the
// AI Roadmaps module which already handles staged learning paths.
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Compass, Layers, MapPin, Navigation, Loader2, Plus, Minus, Locate, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  loadMapRoles, sectorHulls, sectorColor, sectorFill, SECTOR_HUES,
  worldToScreen, screenToWorld, nearestRole,
  type MapRole, type Viewport,
} from "@/lib/careerMap";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SECTOR_LIST = Object.keys(SECTOR_HUES);

export default function CareerMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["careermap-roles"],
    queryFn: loadMapRoles,
    staleTime: 1000 * 60 * 30,
  });

  const [vp, setVp] = useState<Viewport>({ width: 800, height: 600, zoom: 1, panX: 0, panY: 0 });
  const [hoverRole, setHoverRole] = useState<MapRole | null>(null);
  const [selected, setSelected] = useState<MapRole | null>(null);
  const [query, setQuery] = useState("");
  const [showLabels, setShowLabels] = useState(true);
  const [showHulls, setShowHulls] = useState(true);
  const [activeSectors, setActiveSectors] = useState<Set<string>>(new Set(SECTOR_LIST));
  const [layersOpen, setLayersOpen] = useState(false);
  const [youAreHere, setYouAreHere] = useState<{ x: number; y: number; label: string } | null>(null);

  const hulls = useMemo(() => sectorHulls(roles), [roles]);

  // "You Are Here" — derive from user's strongest signals → pick a representative role.
  useEffect(() => {
    if (!user || !roles.length) return;
    (async () => {
      const { data } = await supabase
        .from("user_signals")
        .select("signal_value, strength")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (!data || !data.length) return;
      const freq: Record<string, number> = {};
      data.forEach((s: any) => {
        const v = String(s.signal_value || "").toLowerCase();
        freq[v] = (freq[v] || 0) + Number(s.strength || 0.5);
      });
      const tokens = new Set(Object.keys(freq));
      // Score each role by overlap of role_name/domain tokens with user tokens.
      let best: { r: MapRole; score: number } | null = null;
      for (const r of roles) {
        const hay = `${r.role_name} ${r.domain_name ?? ""} ${r.career_cluster ?? ""}`.toLowerCase();
        let score = 0;
        tokens.forEach((t) => { if (t.length > 3 && hay.includes(t)) score += freq[t]; });
        if (score > 0 && (!best || score > best.score)) best = { r, score };
      }
      if (best) setYouAreHere({ x: best.r.coord_x, y: best.r.coord_y, label: best.r.role_name });
    })();
  }, [user, roles]);

  // Resize canvas to fit its wrapper.
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      const w = wrapRef.current!.clientWidth;
      const h = wrapRef.current!.clientHeight;
      setVp((v) => ({ ...v, width: w, height: h }));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Render loop — canvas redraw whenever data, viewport, filters change.
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs || !roles.length) return;
    const dpr = window.devicePixelRatio || 1;
    cvs.width = vp.width * dpr;
    cvs.height = vp.height * dpr;
    cvs.style.width = `${vp.width}px`;
    cvs.style.height = `${vp.height}px`;
    const ctx = cvs.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Background — soft cream
    ctx.fillStyle = "hsl(40, 45%, 96%)";
    ctx.fillRect(0, 0, vp.width, vp.height);

    // Subtle grid (longitudes/latitudes)
    ctx.strokeStyle = "hsla(220, 15%, 70%, 0.18)";
    ctx.lineWidth = 1;
    for (let g = -100; g <= 100; g += 20) {
      const { sx } = worldToScreen(vp, g, 0);
      const { sy } = worldToScreen(vp, 0, g);
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, vp.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(vp.width, sy); ctx.stroke();
    }

    // Sector hulls (continents)
    if (showHulls) {
      for (const h of hulls) {
        if (!activeSectors.has(h.sector)) continue;
        ctx.beginPath();
        h.hull.forEach((p, i) => {
          const { sx, sy } = worldToScreen(vp, p.x, p.y);
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.fillStyle = sectorFill(h.sector, 0.14);
        ctx.fill();
        ctx.strokeStyle = sectorColor(h.sector, 0.45);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // Role pins
    const q = query.trim().toLowerCase();
    const dotR = Math.max(1.2, 1.6 * vp.zoom);
    for (const r of roles) {
      if (!activeSectors.has(r.sector_name)) continue;
      const { sx, sy } = worldToScreen(vp, r.coord_x, r.coord_y);
      if (sx < -10 || sx > vp.width + 10 || sy < -10 || sy > vp.height + 10) continue;
      const matched = q && r.role_name.toLowerCase().includes(q);
      ctx.fillStyle = matched ? "hsl(0, 80%, 50%)" : sectorColor(r.sector_name, 0.75);
      ctx.beginPath();
      ctx.arc(sx, sy, matched ? dotR + 2 : dotR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sector labels (centroids)
    if (showLabels) {
      ctx.font = "600 12px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const h of hulls) {
        if (!activeSectors.has(h.sector)) continue;
        const { sx, sy } = worldToScreen(vp, h.centroid.x, h.centroid.y);
        const short = h.sector.replace(/ &.*$/, "").replace(/,.*$/, "");
        ctx.fillStyle = "hsla(220, 30%, 12%, 0.85)";
        ctx.strokeStyle = "hsla(40, 45%, 96%, 0.95)";
        ctx.lineWidth = 3;
        ctx.strokeText(short, sx, sy);
        ctx.fillText(short, sx, sy);
      }
    }

    // Selected pin
    if (selected) {
      const { sx, sy } = worldToScreen(vp, selected.coord_x, selected.coord_y);
      ctx.fillStyle = "hsl(220, 80%, 25%)";
      ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
    }

    // You Are Here pin
    if (youAreHere) {
      const { sx, sy } = worldToScreen(vp, youAreHere.x, youAreHere.y);
      ctx.fillStyle = "hsl(210, 85%, 50%)";
      ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
      // pulse ring
      ctx.strokeStyle = "hsla(210, 85%, 50%, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI * 2); ctx.stroke();
    }
  }, [roles, vp, hulls, query, selected, youAreHere, showLabels, showHulls, activeSectors]);

  // Mouse interactions — pan, click-to-select, wheel-zoom, hover.
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, panX: vp.panX, panY: vp.panY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      const s = (Math.min(vp.width, vp.height) / 220) * vp.zoom;
      setVp((v) => ({ ...v, panX: dragRef.current!.panX + dx / s, panY: dragRef.current!.panY - dy / s }));
    } else {
      const { x, y } = screenToWorld(vp, sx, sy);
      const r = nearestRole(roles, x, y, 3 / vp.zoom);
      setHoverRole(r);
    }
  };
  const onMouseUp = (e: React.MouseEvent) => {
    const moved = dragRef.current && (Math.abs(e.clientX - dragRef.current.x) > 3 || Math.abs(e.clientY - dragRef.current.y) > 3);
    dragRef.current = null;
    if (moved) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const { x, y } = screenToWorld(vp, e.clientX - rect.left, e.clientY - rect.top);
    const r = nearestRole(roles, x, y, 5 / vp.zoom);
    if (r) setSelected(r);
  };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setVp((v) => ({ ...v, zoom: Math.max(0.5, Math.min(20, v.zoom * factor)) }));
  };

  const zoomTo = (r: MapRole) => {
    setSelected(r);
    setVp((v) => ({ ...v, zoom: Math.max(v.zoom, 4), panX: -r.coord_x, panY: -r.coord_y }));
  };
  const recenterMe = () => {
    if (!youAreHere) { toast.info("Complete the Curiosity Compass to drop your pin on the map."); return; }
    setVp((v) => ({ ...v, zoom: 3, panX: -youAreHere.x, panY: -youAreHere.y }));
  };

  // Live search results — top 40 by substring then by sector activation.
  const searchHits = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const hits: MapRole[] = [];
    for (const r of roles) {
      if (!activeSectors.has(r.sector_name)) continue;
      if (r.role_name.toLowerCase().includes(q)) {
        hits.push(r);
        if (hits.length >= 40) break;
      }
    }
    return hits;
  }, [roles, query, activeSectors]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="border-b bg-card px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 grid place-items-center">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold">CareerMap</h1>
            <p className="text-[11px] text-muted-foreground -mt-0.5">
              {isLoading ? "Plotting careers…" : `${roles.length.toLocaleString()} roles • ${hulls.length} sectors`}
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search 18,000+ careers (e.g. data scientist, surgeon, UX designer)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
          {searchHits.length > 0 && (
            <div className="absolute z-30 mt-1 w-full bg-popover border rounded-lg shadow-lg max-h-72 overflow-auto">
              {searchHits.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { zoomTo(r); setQuery(""); }}
                  className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2 text-sm border-b last:border-b-0"
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: sectorColor(r.sector_name) }} />
                  <span className="flex-1 truncate">{r.role_name}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">{r.sector_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button size="sm" variant="outline" onClick={() => setLayersOpen((o) => !o)}>
          <Layers className="h-4 w-4 mr-1" /> Layers
        </Button>
        <Button size="sm" variant="outline" onClick={recenterMe}>
          <Locate className="h-4 w-4 mr-1" /> You Are Here
        </Button>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden" ref={wrapRef}>
        {isLoading && (
          <div className="absolute inset-0 grid place-items-center bg-background/60 z-20">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading 18,033 careers, computing terrain…</p>
            </div>
          </div>
        )}
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { dragRef.current = null; setHoverRole(null); }}
          onWheel={onWheel}
        >
          <canvas ref={canvasRef} />
        </div>

        {/* Hover tooltip */}
        {hoverRole && !dragRef.current && (
          <div
            className="absolute pointer-events-none bg-popover border rounded-md shadow-md px-3 py-2 text-xs max-w-[280px] z-10"
            style={(() => {
              const { sx, sy } = worldToScreen(vp, hoverRole.coord_x, hoverRole.coord_y);
              return { left: Math.min(vp.width - 290, sx + 12), top: Math.max(8, sy - 36) };
            })()}
          >
            <div className="font-semibold truncate">{hoverRole.role_name}</div>
            <div className="text-muted-foreground truncate">{hoverRole.sector_name}</div>
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-card border rounded-md shadow-md">
          <button className="p-2 hover:bg-accent" onClick={() => setVp((v) => ({ ...v, zoom: Math.min(20, v.zoom * 1.3) }))}>
            <Plus className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-accent border-t" onClick={() => setVp((v) => ({ ...v, zoom: Math.max(0.5, v.zoom / 1.3) }))}>
            <Minus className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-accent border-t" onClick={() => setVp((v) => ({ ...v, zoom: 1, panX: 0, panY: 0 }))}>
            <Compass className="h-4 w-4" />
          </button>
        </div>

        {/* Layers panel */}
        {layersOpen && (
          <div className="absolute top-4 right-4 w-72 bg-card border rounded-lg shadow-lg p-3 z-10 max-h-[80%] overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Map Layers</h3>
              <button onClick={() => setLayersOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <Label htmlFor="hulls" className="text-xs">Sector borders</Label>
              <Switch id="hulls" checked={showHulls} onCheckedChange={setShowHulls} />
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <Label htmlFor="labs" className="text-xs">Sector labels</Label>
              <Switch id="labs" checked={showLabels} onCheckedChange={setShowLabels} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 mb-1 uppercase tracking-wide">Sectors</p>
            <div className="space-y-1">
              {SECTOR_LIST.map((s) => (
                <label key={s} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeSectors.has(s)}
                    onChange={(e) => {
                      const n = new Set(activeSectors);
                      if (e.target.checked) n.add(s); else n.delete(s);
                      setActiveSectors(n);
                    }}
                  />
                  <span className="h-2 w-2 rounded-full" style={{ background: sectorColor(s) }} />
                  <span className="flex-1 truncate">{s}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Bottom hint */}
        <div className="absolute bottom-4 left-4 bg-card/85 backdrop-blur border rounded-md px-3 py-1.5 text-[11px] text-muted-foreground">
          Drag to pan • Scroll to zoom • Click a pin for the role
        </div>
      </div>

      {/* Role Deep Dive */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {selected && <RoleDeepDive role={selected} onDirections={() => navigate("/dashboard/roadmap", { state: { entity: selected.role_name } })} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function RoleDeepDive({ role, onDirections }: { role: MapRole; onDirections: () => void }) {
  return (
    <>
      <SheetHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: sectorColor(role.sector_name) }} />
          <Badge variant="outline" className="text-[10px]">{role.sector_name}</Badge>
        </div>
        <SheetTitle className="text-2xl leading-tight">{role.role_name}</SheetTitle>
        <SheetDescription className="text-xs">
          {[role.sub_sector_name, role.domain_name, role.sub_domain_name].filter(Boolean).join(" • ")}
        </SheetDescription>
      </SheetHeader>

      <div className="flex gap-2 mt-4">
        <Button onClick={onDirections} className="flex-1">
          <Navigation className="h-4 w-4 mr-2" /> Get Directions
        </Button>
        <Button variant="outline" onClick={() => toast.success("Saved to Dream Board")}>
          <MapPin className="h-4 w-4 mr-2" /> Save
        </Button>
      </div>

      <Tabs defaultValue="overview" className="mt-5">
        <TabsList className="w-full grid grid-cols-4 text-[11px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="path">Pathway</TabsTrigger>
          <TabsTrigger value="ksao">KSAO</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-3 text-sm">
          <DetailRow label="Sector" value={role.sector_name} />
          <DetailRow label="Sub-Sector" value={role.sub_sector_name} />
          <DetailRow label="Domain" value={role.domain_name} />
          <DetailRow label="Sub-Domain" value={role.sub_domain_name} />
          <DetailRow label="Career Cluster" value={role.career_cluster} />
          <DetailRow label="Pathway Cluster" value={role.career_pathway_cluster} />
          <DetailRow label="Map Coordinates" value={`(${role.coord_x.toFixed(1)}, ${role.coord_y.toFixed(1)})`} />
          <DetailRow label="Cluster Region" value={role.cluster_id != null ? `#${role.cluster_id}` : "—"} />
        </TabsContent>

        <TabsContent value="path" className="mt-3">
          <p className="text-sm text-muted-foreground">
            PathFinder will plot a turn-by-turn route from where you are to <strong>{role.role_name}</strong> —
            milestones, skill gates, and exam checkpoints. Tap <em>Get Directions</em> above to launch the AI Roadmap.
          </p>
        </TabsContent>

        <TabsContent value="ksao" className="mt-3">
          <KsaoPanel roleId={role.role_uuid} />
        </TabsContent>

        <TabsContent value="nearby" className="mt-3">
          <NearbyRoles role={role} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm text-right">{value || "—"}</span>
    </div>
  );
}

function KsaoPanel({ roleId }: { roleId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["role-ksao", roleId],
    queryFn: async () => {
      const { data } = await supabase
        .from("role_ksao_vectors")
        .select("weight, dimension:ksao_dimensions(dimension_name, layer_name)")
        .eq("role_id", roleId)
        .order("weight", { ascending: false })
        .limit(15);
      return data || [];
    },
  });
  if (isLoading) return <div className="text-sm text-muted-foreground">Reading KSAO fingerprint…</div>;
  if (!data?.length) return <div className="text-sm text-muted-foreground">No KSAO weights computed yet.</div>;
  return (
    <ScrollArea className="h-72">
      <div className="space-y-2 pr-2">
        {data.map((d: any, i: number) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="truncate">{d.dimension?.dimension_name || "—"}</span>
              <span className="text-muted-foreground">{Math.round(Number(d.weight) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, Number(d.weight) * 100)}%` }} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{d.dimension?.layer_name}</div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function NearbyRoles({ role }: { role: MapRole }) {
  // Spatial proximity on the 2D map = KSAO similarity.
  const { data: all } = useQuery({ queryKey: ["careermap-roles"], queryFn: loadMapRoles });
  const nearby = useMemo(() => {
    if (!all) return [];
    return all
      .filter((r) => r.id !== role.id)
      .map((r) => ({ r, d: Math.hypot(r.coord_x - role.coord_x, r.coord_y - role.coord_y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 12);
  }, [all, role]);
  return (
    <ScrollArea className="h-72">
      <div className="space-y-1.5 pr-2">
        {nearby.map(({ r, d }) => (
          <div key={r.id} className="flex items-center gap-2 p-2 rounded border text-sm">
            <span className="h-2 w-2 rounded-full" style={{ background: sectorColor(r.sector_name) }} />
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium text-xs">{r.role_name}</div>
              <div className="truncate text-[10px] text-muted-foreground">{r.sector_name}</div>
            </div>
            <Badge variant="outline" className="text-[10px]">{d.toFixed(1)}u</Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
