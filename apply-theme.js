const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/modules/purchases/QCClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace with boundary to avoid prefix matching
const replacements = [
  // Backgrounds
  [/bg-slate-950\b/g, 'bg-white dark:bg-slate-950'],
  [/bg-slate-900\/20/g, 'bg-slate-100 dark:bg-slate-900/20'],
  [/bg-slate-900\/30/g, 'bg-slate-50 dark:bg-slate-900/30'],
  [/bg-slate-900\/40/g, 'bg-slate-50 dark:bg-slate-900/40'],
  [/bg-slate-900\/60/g, 'bg-slate-100 dark:bg-slate-900/60'],
  [/bg-slate-900\b/g, 'bg-white dark:bg-slate-900'],
  [/bg-slate-800\b/g, 'bg-slate-100 dark:bg-slate-800'],
  [/bg-slate-850\b/g, 'bg-slate-50 dark:bg-slate-800'],
  [/bg-slate-950/g, 'bg-white dark:bg-slate-950'], // catch any leftovers
  
  // Text
  [/\btext-white\b/g, 'text-slate-900 dark:text-white'],
  [/\btext-slate-200\b/g, 'text-slate-800 dark:text-slate-200'],
  [/\btext-slate-300\b/g, 'text-slate-600 dark:text-slate-300'],
  [/\btext-slate-400\b/g, 'text-slate-500 dark:text-slate-400'],
  [/\btext-slate-450\b/g, 'text-slate-600 dark:text-slate-400'],
  [/\btext-emerald-400\b/g, 'text-emerald-600 dark:text-emerald-400'],
  
  // Borders
  [/border-slate-900\/60/g, 'border-slate-200 dark:border-slate-900/60'],
  [/\bborder-slate-900\b/g, 'border-slate-200 dark:border-slate-900'],
  [/\bborder-slate-800\b/g, 'border-slate-200 dark:border-slate-800'],
  [/\bborder-slate-850\b/g, 'border-slate-200 dark:border-slate-800'],
  
  // Gradients
  [/from-emerald-400 to-teal-400/g, 'from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400']
];

for (const [regex, replacement] of replacements) {
  content = content.replace(regex, replacement);
}

// Ensure the height fix is still there
content = content.replace(/h-\[calc\(100vh-100px\)\]/g, 'h-[calc(100vh-56px)]');
content = content.replace(/-m-6 md:-m-8/g, '-m-4 md:-m-6');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done fixing QCClient!');
