const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/production/batch-recall/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Colors
content = content.replace(/rose-500/g, '[#F97316]');
content = content.replace(/rose-600/g, 'orange-600');
content = content.replace(/rose-50/g, 'orange-500/10');
content = content.replace(/text-rose-600/g, 'text-[#F97316]');

// Border Radiuses
content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-3xl');

// Backgrounds
// Replace the hardcoded `min-h-screen bg-[#F8FAFC] dark:bg-[#090a0f] p-4 md:p-8` with a standard layout wrapper
content = content.replace(/className="min-h-screen flex items-center justify-center bg-\[\#F8FAFC\] dark:bg-\[\#090a0f\]"/, 'className="flex h-[50vh] items-center justify-center"');
content = content.replace(/className="min-h-screen bg-\[\#F8FAFC\] dark:bg-\[\#090a0f\] p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500"/, 'className="space-y-6 md:space-y-8 animate-in fade-in duration-500"');

// Fix text-rose-500 that might have been replaced to text-[#F97316] where the literal rose-500 wasn't exactly written
// Wait, my regex replaced `rose-500` with `[#F97316]`, so `text-rose-500` became `text-[#F97316]` which is valid Tailwind in JIT!
// Same for `bg-[#F97316]`, `border-[#F97316]`, `ring-[#F97316]/20`, `shadow-[#F97316]/20`. These are all valid arbitrary values!

// However, let's fix the header to look standard
// The header currently says "Batch Recall" with "Recall" in orange.
// That's fine, let's keep the styling but in orange.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done BatchRecall colors and layout!');
