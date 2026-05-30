const fs = require('fs');
const path = 'f:/Invincx Projects/myraaha-dev/src/pages/onboarding';
const files = fs.readdirSync(path).filter(f => f.endsWith('.tsx'));
for (const file of files) {
  const p = path + '/' + file;
  let c = fs.readFileSync(p, 'utf8');
  let original = c;
  
  // Replace the wrapper div class to include padding bottom and flex-col
  c = c.replace(/className="flex-1 flex items-center justify-center([^"]*)"/g, 'className="flex-1 flex flex-col items-center justify-center$1 py-12 pb-24"');
  
  // To handle the multi-line className in EntrepreneurshipOnboarding
  c = c.replace(/className="flex-1 flex items-center justify-center[\s\S]*?p-6"/g, 'className="flex-1 flex flex-col items-center justify-center p-6 py-12 pb-24"');
  
  if (original !== c) {
    fs.writeFileSync(p, c);
    console.log('Updated ' + file);
  }
}
