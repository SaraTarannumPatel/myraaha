import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import DirectorySearch, { DirectoryMode } from "./DirectorySearch";
import DirectoryDetailSheet from "./DirectoryDetailSheet";

interface DirectorySearchDrawerProps {
  mode?: DirectoryMode;
  triggerLabel?: string;
  onSelect?: (item: any, type: string) => void;
  className?: string;
}

const DirectorySearchDrawer = ({
  mode = "all",
  triggerLabel,
  onSelect,
  className = "",
}: DirectorySearchDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("");

  const handleSelect = (item: any, type: string) => {
    setSelectedItem(item);
    setSelectedType(type);
    onSelect?.(item, type);
  };

  const defaultLabels: Record<DirectoryMode, string> = {
    all: "Browse Directory",
    careers: "Browse Career Paths",
    jobs: "Browse Job Roles",
    domains: "Browse Domains",
    universities: "Browse Universities",
    skills: "Browse Skills",
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${className}`}
        onClick={() => setOpen(true)}
      >
        <Globe size={14} />
        {triggerLabel || defaultLabels[mode]}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-lg flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              {triggerLabel || defaultLabels[mode]}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <DirectorySearch
              mode={mode}
              showTabs={mode === "all"}
              onSelect={handleSelect}
              maxResults={40}
              autoFocus
            />
          </div>
        </SheetContent>
      </Sheet>

      <DirectoryDetailSheet
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        type={selectedType}
      />
    </>
  );
};

export default DirectorySearchDrawer;
