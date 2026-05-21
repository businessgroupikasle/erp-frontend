const fs = require('fs');
const estFile = 'src/app/sales/estimation/page.tsx';
const pmtFile = 'src/app/sales/payment-in/page.tsx';

// Read MiniCalendar definition
const estContent = fs.readFileSync(estFile, 'utf-8');
const match = estContent.match(/(function MiniCalendar.*?^})/ms);
if (!match) {
  console.error('MiniCalendar not found in estimation/page.tsx');
  process.exit(1);
}
const miniCalendarCode = match[0];

let pmtContent = fs.readFileSync(pmtFile, 'utf-8');

// remove bad import
pmtContent = pmtContent.replace('import MiniCalendar from "@/components/ui/calendar";\n', '');

// add definition before Main
const insertPoint = '// ── Main ──────────────────────────────────────────────────────────────────────';
pmtContent = pmtContent.replace(insertPoint, miniCalendarCode + '\n\n' + insertPoint);

// ArrowLeft and ArrowRight required by MiniCalendar
pmtContent = pmtContent.replace('Share2, Trash2,', 'Share2, Trash2, ArrowLeft, ArrowRight,');

fs.writeFileSync(pmtFile, pmtContent);
console.log('Fixed MiniCalendar');
