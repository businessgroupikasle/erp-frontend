const fs = require('fs');
const file = 'src/app/sales/invoices/page.tsx';
let text = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!text.includes('GSTInvoice')) {
  text = text.replace(/import AddInventoryProductForm.*?;/, 'import AddInventoryProductForm from "@/components/modules/inventory/AddInventoryProductForm";\nimport GSTInvoice from "@/components/documents/GSTInvoice";');
}

// 2. Add state
if (!text.includes('printingInvoice')) {
  text = text.replace(/const \[invoices, setInvoices\] = useState.*?;/, 'const [invoices, setInvoices] = useState<any[]>([]);\n  const [printingInvoice, setPrintingInvoice] = useState<any>(null);');
}

// 3. Update handlePrint
const oldPrintRegex = /const handlePrint = \(inv: any\) => \{\s*const w = window\.open\("", "_blank"\);[\s\S]*?\n    \};\n    w\.document\.close\(\);\n  \};/;
text = text.replace(oldPrintRegex, 'const handlePrint = (inv: any) => { setPrintingInvoice(inv); };');

// 4. Render GSTInvoice
if (!text.includes('<GSTInvoice')) {
  const modalCode = `
  const companyDetails = {
    name: 'Kiddos Food',
    address: '123 Business Park, Block A\\nBengaluru, Karnataka - 560001',
    gstin: '29ABCDE1234F1Z5',
    state: 'Karnataka',
    email: 'hello@kiddosfood.com',
    phone: '+91 98765 43210'
  };

  if (printingInvoice) {
    return (
      <GSTInvoice
        order={{
          ...printingInvoice,
          id: printingInvoice.id,
          poNumber: printingInvoice.order?.invoiceNum ? \`INV-\${printingInvoice.order.invoiceNum}\` : undefined,
          createdAt: printingInvoice.createdAt,
          items: printingInvoice.order?.orderItems?.map((it: any) => ({
            itemName: it.product?.name,
            quantity: it.quantity,
            price: it.price,
            gstRate: it.taxAmount > 0 ? ((it.taxAmount / (it.quantity * it.price)) * 100).toFixed(0) : 0,
            hsnCode: it.product?.sku || '06'
          }))
        }}
        vendor={printingInvoice.order?.customer || { name: 'Walk-In Customer' }}
        companyDetails={companyDetails}
        onClose={() => setPrintingInvoice(null)}
      />
    );
  }
`;
  text = text.replace(/\/\/ ══════════════════════════════════════════════════════════════════════════\n  \/\/ CREATE VIEW/, modalCode + '\n  // ══════════════════════════════════════════════════════════════════════════\n  // CREATE VIEW');
}

fs.writeFileSync(file, text);
console.log('Done sales invoice');
