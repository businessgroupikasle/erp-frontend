const fs = require('fs');
const file = 'src/app/sales/invoices/page.tsx';
let text = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!text.includes('import GSTInvoice')) {
  text = text.replace(
    /import AddInventoryProductForm from "@\/components\/modules\/inventory\/AddInventoryProductForm";/,
    'import AddInventoryProductForm from "@/components/modules/inventory/AddInventoryProductForm";\nimport GSTInvoice from "@/components/documents/GSTInvoice";'
  );
}

// 2. Add JSX at the end of the file
if (!text.includes('<GSTInvoice')) {
  const jsx = `
        {printingInvoice && (
          <GSTInvoice
            order={{
              ...printingInvoice,
              id: printingInvoice.id,
              poNumber: printingInvoice.order?.invoiceNum ? \`INV-\${printingInvoice.order.invoiceNum}\` : undefined,
              createdAt: printingInvoice.createdAt,
              items: (printingInvoice.order?.orderItems || []).map((it: any) => ({
                itemName: it.product?.name || "Unknown Item",
                quantity: it.quantity,
                price: it.price,
                gstRate: it.taxAmount > 0 ? ((it.taxAmount / (it.quantity * it.price)) * 100).toFixed(0) : 0,
                hsnCode: it.product?.sku || '06'
              }))
            }}
            vendor={printingInvoice.order?.customer || { name: 'Walk-In Customer' }}
            companyDetails={{
              name: 'Kiddos Food',
              address: '123 Business Park, Block A\\nBengaluru, Karnataka - 560001',
              gstin: '29ABCDE1234F1Z5',
              state: 'Karnataka',
              email: 'hello@kiddosfood.com',
              phone: '+91 98765 43210'
            }}
            onClose={() => setPrintingInvoice(null)}
          />
        )}
      </div>
    </div>
  );
}
`;
  text = text.replace(/      <\/div>\r?\n    <\/div>\r?\n  \);\r?\n}\r?\n?$/, jsx);
}

fs.writeFileSync(file, text);
console.log('Final fix applied!');
