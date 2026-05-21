const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      let changed = false;
      if (content.includes('className="flex flex-col h-screen')) {
        content = content.replaceAll('className="flex flex-col h-screen', 'className="flex flex-col');
        changed = true;
      }

      if (content.includes('bg-[#f0f0f0]')) {
        content = content.replaceAll('bg-[#f0f0f0]', 'bg-gray-50');
        changed = true;
      }

      if (content.includes('className="flex flex-col bg-gray-50 overflow-hidden"')) {
        content = content.replaceAll('className="flex flex-col bg-gray-50 overflow-hidden"', 'className="flex flex-col bg-gray-50 overflow-hidden" style={{ height: \'calc(100vh - 56px)\' }}');
        // If there's already a style tag, it might get doubled up, but React will catch syntax errors.
        // Let's use a safer replace just for the view === create.
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', fullPath);
      }
    }
  }
}

// Just specifically fix the height issue in proforma, estimation, payment-in, invoices
const pages = [
  'src/app/sales/proforma-invoice/page.tsx',
  'src/app/sales/estimation/page.tsx',
  'src/app/sales/payment-in/page.tsx',
  'src/app/sales/invoices/page.tsx'
];

for (const p of pages) {
  let c = fs.readFileSync(p, 'utf-8');
  
  c = c.replaceAll('className="flex flex-col h-screen bg-[#f0f0f0] overflow-hidden"', 'className="flex flex-col bg-gray-50 overflow-hidden" style={{ height: \'calc(100vh - 56px)\' }}');
  c = c.replaceAll('className="flex flex-col h-screen bg-gray-50 overflow-hidden"', 'className="flex flex-col bg-gray-50 overflow-hidden" style={{ height: \'calc(100vh - 56px)\' }}');
  c = c.replaceAll('bg-[#f0f0f0]', 'bg-gray-50');
  
  fs.writeFileSync(p, c);
  console.log('Fixed:', p);
}
