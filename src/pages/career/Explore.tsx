import { useState } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import DirectorySearch from "@/components/directory/DirectorySearch";
import DirectoryDetailSheet from "@/components/directory/DirectoryDetailSheet";

const Explore = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState("");

  const handleSelect = (item: any, type: string) => {
    setSelectedItem(item);
    setSelectedType(type);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Globe size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Explore Directory</h1>
            <p className="font-body text-sm text-muted-foreground">
              Search careers, jobs, domains & universities worldwide
            </p>
          </div>
        </div>
      </motion.div>

      <DirectorySearch
        mode="all"
        showTabs
        onSelect={handleSelect}
        maxResults={30}
      />

      <DirectoryDetailSheet
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        type={selectedType}
      />
    </div>
  );
};

export default Explore;
