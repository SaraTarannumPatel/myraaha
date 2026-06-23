import fs from 'fs';

const html = fs.readFileSync('docs/careermap_full_app_ui.html', 'utf-8');

function styleToObject(styleString) {
  if (!styleString) return '{}';
  const styleObj = {};
  styleString.split(';').forEach(s => {
    const [key, ...values] = s.split(':');
    if (key && values.length > 0) {
      let reactKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      let reactValue = values.join(':').trim();
      if (!isNaN(reactValue) && reactValue !== '') {
        reactValue = `"${reactValue}"`;
      } else {
        reactValue = `"${reactValue.replace(/"/g, "'")}"`;
      }
      styleObj[reactKey] = reactValue;
    }
  });
  
  let result = '{';
  for (const [k, v] of Object.entries(styleObj)) {
    result += `${k}: ${v}, `;
  }
  result += '}';
  return result;
}

let jsx = html;

const styleMatch = jsx.match(/<style>([\s\S]*?)<\/style>/);
const cssContent = styleMatch ? styleMatch[1] : '';
jsx = jsx.replace(/<style>[\s\S]*?<\/style>/, '');

jsx = jsx.replace(/class="/g, 'className="');
jsx = jsx.replace(/onclick="showScreen\('([^']+)'\)"/g, 'onClick={() => setActiveScreen(\'$1\')}');
jsx = jsx.replace(/onclick="openRole\('([^']+)'\)"/g, 'onClick={() => setActiveScreen(\'roleview\')}');
jsx = jsx.replace(/onclick="openGate\('([^']+)'\)"/g, 'onClick={() => setActiveScreen(\'roleview\')}');
jsx = jsx.replace(/onclick="null"/g, 'onClick={() => {}}');
jsx = jsx.replace(/onclick="handleMapClick\(event\)"/g, 'onClick={(e) => {}}');
jsx = jsx.replace(/onclick="expandSheet\(\)"/g, 'onClick={() => {}}');
jsx = jsx.replace(/onclick="this\.classList\.toggle\('on'\)"/g, 'onClick={(e) => e.currentTarget.classList.toggle(\'on\')}');

jsx = jsx.replace(/style="([^"]+)"/g, (match, p1) => {
  return `style={${styleToObject(p1)}}`;
});

jsx = jsx.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
jsx = jsx.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
jsx = jsx.replace(/aria-hidden="true"/g, 'aria-hidden={true}');
jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
jsx = jsx.replace(/stroke-dasharray/g, 'strokeDasharray');
jsx = jsx.replace(/text-anchor/g, 'textAnchor');

// Replace HTML comments with JSX comments
jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

// Extract body content: between <h2 class="sr-only"> and <script>
const bodyContent = jsx.split('<h2 className="sr-only">')[1].split('<script>')[0];

// Fix active screen
let finalJsx = bodyContent.replace(
  /<div id="screen-([a-z]+)" className="screen(?: active)?"(>| )/g,
  `<div id="screen-$1" className={\`screen \${activeScreen === '$1' ? 'active' : ''}\`}$2`
);

// Fix top nav active state
finalJsx = finalJsx.replace(
  /<button onClick=\{\(\) => setActiveScreen\('([^']+)'\)\} id="nav-([a-z]+)" style=\{([^}]+)\}/g,
  `<button onClick={() => setActiveScreen('$1')} id="nav-$2" style={activeScreen === '$1' ? {padding: "6px 14px", borderRadius: "16px", fontSize: "11px", cursor: "pointer", border: "0.5px solid #3B8BD4", background: "#E6F1FB", color: "#185FA5", fontWeight: "500"} : {padding: "6px 14px", borderRadius: "16px", fontSize: "11px", cursor: "pointer", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-secondary)"}}`
);

const component = `import { useState, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";

export default function CareerMap() {
  const [activeScreen, setActiveScreen] = useState('explore');

  const dummyData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 19253; i++) {
      data.push({
        position: [(Math.random() - 0.5) * 4000, (Math.random() - 0.5) * 4000],
        color: [255, 255, 255, 120],
        radius: Math.random() * 2 + 1,
      });
    }
    return data;
  }, []);

  const INITIAL_VIEW_STATE = { target: [0, 0, 0], zoom: 0.5, minZoom: -2, maxZoom: 10 };
  const layers = [
    new ScatterplotLayer({
      id: "roles-layer",
      data: dummyData,
      getPosition: (d: any) => d.position,
      getFillColor: (d: any) => d.color,
      getRadius: (d: any) => d.radius,
      radiusScale: 1,
      radiusMinPixels: 1,
      radiusMaxPixels: 5,
    }),
  ];

  return (
    <div className="absolute inset-0 font-sans text-foreground overflow-hidden bg-[#e8f0e4]">
      <style dangerouslySetInnerHTML={{__html: \`${cssContent.replace(/`/g, "\\`")}\`}} />
      
      {/* Background Deck.gl Canvas */}
      <div className="absolute inset-0 z-0">
        <DeckGL
          views={[new OrthographicView({ id: "ortho" })]}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          getCursor={({ isDragging }) => (isDragging ? "grabbing" : "grab")}
        />
      </div>

      <div className="absolute inset-0 z-10 overflow-auto pt-4">
        {/* React injected conditional screens based on HTML */}
        <h2 className="sr-only">CareerMap</h2>
        ${finalJsx}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/career/CareerMap.tsx', component);
console.log("Conversion complete!");
