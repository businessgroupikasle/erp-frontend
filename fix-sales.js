const fs = require('fs');
const file = 'src/app/sales/invoices/page.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/import GSTInvoice from "@\/components\/documents\/GSTInvoice";\s*import GSTInvoice from "@\/components\/documents\/GSTInvoice";/g, 'import GSTInvoice from "@/components/documents/GSTInvoice";');
text = text.replace(/const \[printingInvoice, setPrintingInvoice\] = useState<any>\(null\);\s*const \[printingInvoice, setPrintingInvoice\] = useState<any>\(null\);/g, 'const [printingInvoice, setPrintingInvoice] = useState<any>(null);');

const printFixRegex = /const handlePrint = \(inv: any\) => \{\s*setPrintingInvoice\(inv\);\s*\};\s*<strong>Total:[\s\S]*?w\.document\.close\(\);\s*\};/g;

text = text.replace(printFixRegex, 'const handlePrint = (inv: any) => {\n    setPrintingInvoice(inv);\n  };');

fs.writeFileSync(file, text);
console.log('Fixed sales invoices!');
