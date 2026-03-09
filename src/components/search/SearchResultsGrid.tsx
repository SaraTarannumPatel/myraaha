import { AnimatePresence, motion } from "framer-motion";
import type { SearchViewMode } from "./ModuleSearchBar";
import SearchResultCard from "./SearchResultCard";
import { Search } from "lucide-react";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  tags?: string[];
  metadata?: { label: string; value: string }[];
  data?: any;
}

interface SearchResultsGridProps {
  items: SearchResultItem[];
  viewMode?: SearchViewMode;
  onSelect?: (item: SearchResultItem) => void;
  loading?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
}

const SearchResultsGrid = ({
  items,
  viewMode = "cards",
  onSelect,
  loading = false,
  emptyMessage = "No results found",
  columns = 3,
}: SearchResultsGridProps) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse font-body text-sm text-muted-foreground">Searching...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 bg-card rounded-xl border border-border">
        <Search className="mx-auto text-muted-foreground mb-2" size={32} />
        <p className="font-display text-foreground text-sm">{emptyMessage}</p>
        <p className="font-body text-xs text-muted-foreground mt-1">Try different keywords or broaden your filters</p>
      </div>
    );
  }

  const colClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];

  if (viewMode === "table") {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Tags</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 hover:bg-accent/20 cursor-pointer transition-colors"
                  onClick={() => onSelect?.(item)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.icon && <span>{item.icon}</span>}
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{item.subtitle || "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {(item.tags || []).slice(0, 3).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  }

  // Detail view = compact list
  if (viewMode === "detail") {
    return (
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.015 }}
            >
              <SearchResultCard
                title={item.title}
                subtitle={item.subtitle}
                description={item.description}
                icon={item.icon}
                tags={item.tags}
                metadata={item.metadata}
                onClick={() => onSelect?.(item)}
                variant="detailed"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Cards grid (default)
  return (
    <div className={`grid gap-3 ${colClass}`}>
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.015 }}
          >
            <SearchResultCard
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              icon={item.icon}
              tags={item.tags}
              metadata={item.metadata}
              onClick={() => onSelect?.(item)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SearchResultsGrid;
