const fs = require('fs');
let pmt = fs.readFileSync('src/app/sales/payment-in/page.tsx', 'utf-8');

const constants = `
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
`;

pmt = pmt.replace('function MiniCalendar', constants + '\nfunction MiniCalendar');
// Also fix parameter d implicitly has any type
pmt = pmt.replace('DAY_NAMES.map((d) =>', 'DAY_NAMES.map((d: string) =>');

fs.writeFileSync('src/app/sales/payment-in/page.tsx', pmt);
console.log('Fixed constants');
