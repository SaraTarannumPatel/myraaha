const fs = require('fs');

let originalCode = fs.readFileSync('src/pages/career/CareerMap.tsx', 'utf8');

let inSingleLineComment = false;
let inMultiLineComment = false;
let inStringDouble = false;
let inStringSingle = false;
let inTemplateLiteral = false;
let escape = false;

const stack = [];

const lines = originalCode.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const nextChar = line[j+1];
    
    if (escape) {
      escape = false;
      continue;
    }
    
    if (inSingleLineComment) {
      continue;
    }
    
    if (inMultiLineComment) {
      if (char === '*' && nextChar === '/') {
        inMultiLineComment = false;
        j++;
      }
      continue;
    }
    
    if (inStringDouble) {
      if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inStringDouble = false;
      }
      continue;
    }
    
    if (inStringSingle) {
      if (char === '\\') {
        escape = true;
      } else if (char === '\'') {
        inStringSingle = false;
      }
      continue;
    }
    
    if (inTemplateLiteral) {
      if (char === '\\') {
        escape = true;
      } else if (char === '`') {
        inTemplateLiteral = false;
      }
      continue;
    }
    
    // Check comments
    if (char === '/' && nextChar === '/') {
      inSingleLineComment = true;
      j++;
      continue;
    }
    if (char === '/' && nextChar === '*') {
      inMultiLineComment = true;
      j++;
      continue;
    }
    
    // Check strings
    if (char === '"') {
      inStringDouble = true;
      continue;
    }
    if (char === '\'') {
      inStringSingle = true;
      continue;
    }
    if (char === '`') {
      inTemplateLiteral = true;
      continue;
    }
    
    // Check curly braces
    if (char === '{') {
      const item = { line: i + 1, col: j + 1, text: line.substring(j, j + 40).trim() };
      stack.push(item);
      if (item.line >= 2820 && item.line <= 3560) {
        console.log(`PUSH: { at line ${item.line}, col ${item.col}: ${item.text}`);
      }
    } else if (char === '}') {
      if (stack.length === 0) {
        console.log(`Extra } found at line ${i + 1}, col ${j + 1}`);
      } else {
        const popped = stack.pop();
        if (popped.line >= 2820 && popped.line <= 3560) {
          console.log(`POP: matched { at line ${popped.line} with } at line ${i + 1}`);
        }
      }
    }
  }
  inSingleLineComment = false;
}
