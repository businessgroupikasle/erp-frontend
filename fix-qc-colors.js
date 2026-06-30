const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/modules/purchases/QCClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Clean up duplicate classes
content = content.replace(/bg-white dark:bg-white dark:bg-slate-950/g, 'bg-white dark:bg-slate-950');
content = content.replace(/bg-slate-50 dark:bg-white dark:bg-slate-900\/30/g, 'bg-slate-50 dark:bg-slate-900/30');
content = content.replace(/bg-white dark:bg-white dark:bg-slate-900\/30/g, 'bg-white dark:bg-slate-900/30');
content = content.replace(/bg-slate-50 dark:bg-white dark:bg-slate-900\/40/g, 'bg-slate-50 dark:bg-slate-900/40');
content = content.replace(/bg-slate-100 dark:bg-white dark:bg-slate-900\/20/g, 'bg-slate-50 dark:bg-slate-900/20');
content = content.replace(/bg-white dark:bg-white dark:bg-slate-950/g, 'bg-white dark:bg-slate-950');

// 2. Change Emerald/Teal to Orange (#F97316 or Tailwind orange-500)
content = content.replace(/from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400/g, 'text-[#F97316]');
content = content.replace(/bg-gradient-to-r text-\[\#F97316\]/g, 'text-[#F97316]');
content = content.replace(/bg-clip-text text-transparent/g, ''); // Remove clip text so solid color works
content = content.replace(/text-emerald-600 dark:text-emerald-400/g, 'text-orange-500');
content = content.replace(/bg-emerald-500\/10/g, 'bg-orange-500/10');
content = content.replace(/border-emerald-500\/30/g, 'border-orange-500/30');
content = content.replace(/border-emerald-500/g, 'border-orange-500');
content = content.replace(/text-emerald-500\/20/g, 'text-orange-500/20');

// Fix button gradient
content = content.replace(/bg-gradient-to-r from-emerald-600 to-teal-600/g, 'bg-[#F97316]');

// Ensure we don't have multiple dark: classes
content = content.replace(/dark:bg-white dark:bg-slate-900\/30/g, 'dark:bg-slate-900/30');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done QCClient colors!');
