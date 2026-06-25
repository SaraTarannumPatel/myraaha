const fs = require('fs');

let originalCode = fs.readFileSync('src/pages/career/CareerMap.tsx', 'utf8');

// We want to count curly braces in code, ignoring strings, comments, and template literals.
// Let's implement a robust character-by-character scanner.
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
      // continues until end of line
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
      stack.push({ line: i + 1, col: j + 1 });
    } else if (char === '}') {
      if (stack.length === 0) {
        console.log(`Extra } found at line ${i + 1}, col ${j + 1}`);
      } else {
        stack.pop();
      }
    }
  }
  inSingleLineComment = false;
}

if (stack.length > 0) {
  console.log(`Unclosed curly braces count: ${stack.length}`);
  console.log('Unclosed positions:', stack);
} else {
  console.log('Curly braces are perfectly balanced!');
}
