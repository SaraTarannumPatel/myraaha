import { useState, useMemo } from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  label?: string;
  totalCount?: number;
  className?: string;
  /** Optional formatter: option -> "Domain (12)" */
  formatOption?: (opt: string) => string;
}

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  label,
  totalCount,
  className,
  formatOption,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, search]);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt));
    else onChange([...selected, opt]);
  };

  const clearAll = () => onChange([]);
  const selectAll = () => onChange(options);

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected.length} ${label || "selected"}`;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 min-w-[180px] justify-between"
            aria-expanded={open}
          >
            <span className="truncate font-body text-sm">
              {triggerLabel}
              {totalCount != null && selected.length === 0 && (
                <span className="ml-1 text-muted-foreground">({totalCount})</span>
              )}
            </span>
            <ChevronDown size={14} className="opacity-60 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[280px] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label || "options"}...`}
                className="h-8 pl-7 text-sm"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={selectAll}
                className="font-body text-xs text-primary hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="font-body text-xs text-muted-foreground hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
          <ScrollArea className="max-h-64">
            <div className="p-1">
              {filtered.length === 0 ? (
                <div className="py-6 text-center font-body text-xs text-muted-foreground">
                  No results
                </div>
              ) : (
                filtered.map((opt) => {
                  const isSel = selected.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggle(opt)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors",
                        isSel ? "bg-primary/10 text-foreground" : "hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                          isSel ? "bg-primary border-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {isSel && <Check size={12} />}
                      </span>
                      <span className="font-body truncate">{formatOption ? formatOption(opt) : opt}</span>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {selected.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary" className="gap-1 pr-1">
              {s}
              <button
                type="button"
                onClick={() => onChange(selected.filter((x) => x !== s))}
                className="hover:bg-background/50 rounded-full p-0.5"
                aria-label={`Remove ${s}`}
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
          {selected.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selected.length - 3} more
            </Badge>
          )}
          <button
            type="button"
            onClick={clearAll}
            className="font-body text-xs text-muted-foreground hover:text-foreground hover:underline ml-1"
          >
            clear
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
