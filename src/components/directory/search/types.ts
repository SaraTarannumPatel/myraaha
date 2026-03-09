import type { LucideIcon } from "lucide-react";

export type DirectoryMode = "all" | "careers" | "jobs" | "domains" | "universities" | "skills";

export interface DirectoryResults {
  careers: any[];
  jobs: any[];
  domains: any[];
  universities: any[];
}

export type DirectoryView = "cards" | "table";

export type DirectorySelectHandler = (item: any, type: string) => void;

export type TabConfigItem = {
  key: Exclude<DirectoryMode, "all" | "skills">;
  label: string;
  icon: LucideIcon;
  count: number;
};
