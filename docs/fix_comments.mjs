import fs from 'fs';

let jsx = fs.readFileSync('src/pages/career/CareerMap.tsx', 'utf-8');

// Replace HTML comments with JSX comments
jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

fs.writeFileSync('src/pages/career/CareerMap.tsx', jsx);
console.log("Fixed comments in JSX");
