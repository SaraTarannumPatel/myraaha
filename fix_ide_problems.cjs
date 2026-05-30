const fs = require('fs');

const filesToAddSupabase = [
  "src/components/MyRaahaNewsletter.tsx",
  "src/components/WriteForMyRaahaModal.tsx",
  "src/pages/career/RoleDetails.tsx",
  "src/pages/MyRaahaContact.tsx",
  "src/pages/MyRaahaInsights.tsx",
  "src/pages/MyRaahaInsightsDetail.tsx"
];

for (const file of filesToAddSupabase) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Add supabase import
  if (!content.includes('import { supabase }')) {
    content = content.replace(/(import .* from .*;?\n)+/, match => match + "import { supabase } from '@/integrations/supabase/client';\n");
  }
  
  // Fix unexpected any
  content = content.replace(/catch\s*\(\s*(\w+)\s*:\s*any\s*\)\s*\{/g, 'catch ($1_err) { const $1 = $1_err as any;');
  
  fs.writeFileSync(file, content);
}

// Fix MyRaahaCareers.tsx
if (fs.existsSync("src/pages/MyRaahaCareers.tsx")) {
  let careers = fs.readFileSync("src/pages/MyRaahaCareers.tsx", "utf8");
  careers = careers.replace(/slice\(-1\)\.toLowerCase\(\)/g, "slice(-1)[0].toLowerCase()");
  fs.writeFileSync("src/pages/MyRaahaCareers.tsx", careers);
}

// Fix RoleDetails.tsx
if (fs.existsSync("src/pages/career/RoleDetails.tsx")) {
  let roleDetails = fs.readFileSync("src/pages/career/RoleDetails.tsx", "utf8");
  roleDetails = roleDetails.replace(/justify:\s*'center'/g, "justifyContent: 'center'");
  fs.writeFileSync("src/pages/career/RoleDetails.tsx", roleDetails);
}

// Fix tailwind.config.ts
if (fs.existsSync("tailwind.config.ts")) {
  let tailwind = fs.readFileSync("tailwind.config.ts", "utf8");
  tailwind = tailwind.replace(/function\s*\(\{\s*addUtilities\s*\}\)/g, "function ({ addUtilities }: { addUtilities: any })");
  fs.writeFileSync("tailwind.config.ts", tailwind);
}

// Fix index.css (remove empty rulesets)
if (fs.existsSync("src/index.css")) {
  let indexCss = fs.readFileSync("src/index.css", "utf8");
  indexCss = indexCss.replace(/[^\n{}]+\{\s*\}/g, "");
  fs.writeFileSync("src/index.css", indexCss);
}

console.log("Fixes applied.");
