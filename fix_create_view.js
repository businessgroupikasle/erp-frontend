const fs = require('fs');
const file = 'src/app/sales/proforma-invoice/page.tsx';
let c = fs.readFileSync(file, 'utf-8');

c = c.replace('<div className="flex flex-col h-screen bg-[#f0f0f0] overflow-hidden">', '<div className="flex flex-col bg-gray-50 overflow-hidden" style={{ height: \'calc(100vh - 56px)\' }}>');
c = c.replaceAll('bg-[#f0f0f0]', 'bg-gray-50');

fs.writeFileSync(file, c);
console.log('Fixed proforma invoice create view');
