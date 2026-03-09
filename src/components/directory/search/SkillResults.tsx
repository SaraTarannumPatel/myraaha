import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const SkillResults = ({ items, onSelect }: { items: any[]; onSelect?: (i: any, t: string) => void }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <motion.button
        key={item.title}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground text-xs font-medium transition-all"
        onClick={() => onSelect?.(item, "skill")}
      >
        <Sparkles size={10} className="inline mr-1" />
        {item.title}
      </motion.button>
    ))}
  </div>
);
