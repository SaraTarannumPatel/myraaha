import fs from 'fs';

let jsx = fs.readFileSync('src/pages/career/CareerMap.tsx', 'utf-8');

// Fix screen active states
jsx = jsx.replace(
  /<div id="screen-([a-z]+)" className="screen(?: active)?"(>| )/g,
  `<div id="screen-$1" className={\`screen \${activeScreen === '$1' ? 'active' : ''}\`}$2`
);

// Fix nav button active states
jsx = jsx.replace(
  /<button onClick=\{\(\) => setActiveScreen\('([^']+)'\)\} id="nav-([a-z]+)" style=\{([^}]+)\}/g,
  `<button onClick={() => setActiveScreen('$1')} id="nav-$2" style={activeScreen === '$1' ? {padding: "6px 14px", borderRadius: "16px", fontSize: "11px", cursor: "pointer", border: "0.5px solid #3B8BD4", background: "#E6F1FB", color: "#185FA5", fontWeight: "500"} : {padding: "6px 14px", borderRadius: "16px", fontSize: "11px", cursor: "pointer", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-secondary)"}}`
);

fs.writeFileSync('src/pages/career/CareerMap.tsx', jsx);
console.log("Fixed conditional rendering");
