import { useState, useEffect } from "react";

export interface AcademicBoard {
  id: string;
  name: string;
  type: string;
  streams: any[];
  note?: string;
}

export interface AcademicStream {
  id: string;
  name: string;
  type: string;
}

export interface AcademicExam {
  id: string;
  name: string;
  type: string;
  scope: string;
  level: string;
  roles: string[];
}

export interface AcademicDepartment {
  id: string;
  name: string;
  type: string;
  eligibility: string;
  boardRequirement: string;
  roles: string[];
}

export interface AcademicCollege {
  id: string;
  name: string;
  type: string;
  affiliation: string;
  tier: string;
  associatedRoles: string[];
}

export interface AcademicMapData {
  boards: AcademicBoard[];
  streams: AcademicStream[];
  exams: AcademicExam[];
  departments: AcademicDepartment[];
  colleges: AcademicCollege[];
  roleMappings: {
    roleToExams: Record<string, string[]>;
    roleToDept: Record<string, string[]>;
    roleToColleges: Record<string, string[]>;
  };
}

export function useAcademicMapData() {
  const [academicData, setAcademicData] = useState<AcademicMapData | null>(null);
  const [isLoadingAcademic, setIsLoadingAcademic] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const mod = await import("@/data/academic_exam_data.json");
        if (cancelled) return;

        setAcademicData(mod.default || mod);
      } catch (err) {
        console.error("[CareerMap] Failed to load academic data:", err);
      } finally {
        if (!cancelled) {
          setIsLoadingAcademic(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { academicData, isLoadingAcademic };
}
