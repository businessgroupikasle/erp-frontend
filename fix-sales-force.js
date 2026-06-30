const fs = require('fs');
const file = 'src/app/sales/invoices/page.tsx';
let text = fs.readFileSync(file, 'utf8');

const startStr = 'const handlePrint = (inv: any) => {';
const endStr = '// ── Filtered list';

const startIndex = text.indexOf(startStr);
const endIndex = text.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const before = text.substring(0, startIndex);
  const after = text.substring(endIndex);
  
  const newMiddle = `const handlePrint = (inv: any) => {
    setPrintingInvoice(inv);
  };

  `;
  
  text = before + newMiddle + after;
  fs.writeFileSync(file, text);
  console.log('Fixed handlePrint completely.');
} else {
  console.log('Could not find start or end string.');
}
