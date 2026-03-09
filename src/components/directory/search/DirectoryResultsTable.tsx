import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DirectoryResultsTable({
  activeTab,
  items,
  onSelect,
}: {
  activeTab: "careers" | "jobs" | "domains" | "universities";
  items: any[];
  onSelect?: (item: any, type: string) => void;
}) {
  if (activeTab === "careers") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Career</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Demand</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id} className="cursor-pointer" onClick={() => onSelect?.(c, "career")}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.icon_emoji || "💼"}</span>
                  <span className="text-foreground">{c.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-[10px]">
                  {c.domain}
                </Badge>
              </TableCell>
              <TableCell>
                {c.difficulty ? (
                  <Badge variant="outline" className="text-[10px]">
                    {c.difficulty}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {c.demand_level ? (
                  <Badge variant="outline" className="text-[10px]">
                    {c.demand_level}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (activeTab === "jobs") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Role</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Demand</TableHead>
            <TableHead>Top skills</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((j) => (
            <TableRow key={j.id} className="cursor-pointer" onClick={() => onSelect?.(j, "job")}>
              <TableCell className="font-medium text-foreground">{j.title}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-[10px]">
                  {j.domain}
                </Badge>
              </TableCell>
              <TableCell>
                {j.demand_level ? (
                  <Badge variant="outline" className="text-[10px]">
                    {j.demand_level}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {(j.skills_required || []).slice(0, 3).map((s: string) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (activeTab === "domains") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Domain</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Parent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((d) => (
            <TableRow key={d.id} className="cursor-pointer" onClick={() => onSelect?.(d, "domain")}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-base">{d.icon_emoji || "📁"}</span>
                  <span className="text-foreground">{d.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {d.category}
                </Badge>
              </TableCell>
              <TableCell>
                {d.parent_domain ? (
                  <span className="text-sm text-muted-foreground">{d.parent_domain}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // universities
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>University</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Rank</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((u) => (
          <TableRow key={u.id} className="cursor-pointer" onClick={() => onSelect?.(u, "university")}>
            <TableCell className="font-medium text-foreground">{u.name}</TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">{u.country}</span>
            </TableCell>
            <TableCell>
              {u.type ? (
                <Badge variant="outline" className="text-[10px]">
                  {u.type}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              {u.ranking_tier ? (
                <Badge variant="secondary" className="text-[10px]">
                  {u.ranking_tier}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
