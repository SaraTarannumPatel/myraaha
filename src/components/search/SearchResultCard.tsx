import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface SearchResultCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  tags?: string[];
  metadata?: { label: string; value: string }[];
  onClick?: () => void;
  variant?: "default" | "compact" | "detailed";
  accentColor?: string;
}

const SearchResultCard = ({
  title,
  subtitle,
  description,
  icon,
  tags = [],
  metadata = [],
  onClick,
  variant = "default",
  accentColor,
}: SearchResultCardProps) => {
  if (variant === "compact") {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-all text-left group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {icon && <span className="text-xl shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display font-medium text-foreground truncate">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {tags.length > 0 && (
          <div className="hidden sm:flex gap-1 shrink-0">
            {tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="outline" className="text-[10px] px-1.5">{t}</Badge>
            ))}
          </div>
        )}
        <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full flex flex-col p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all text-left group"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3 mb-2">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {description && variant === "detailed" && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 font-body">{description}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
          ))}
          {tags.length > 4 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{tags.length - 4}</Badge>
          )}
        </div>
      )}

      {metadata.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-auto pt-2 border-t border-border/50">
          {metadata.map((m) => (
            <div key={m.label} className="text-[10px]">
              <span className="text-muted-foreground">{m.label}: </span>
              <span className="text-foreground font-medium">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.button>
  );
};

export default SearchResultCard;
