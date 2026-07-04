import fs from 'fs';

const filePath = 'src/app/production/batches/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add imports
content = content.replace(
  'import { productBatchesApi, productsFullApi, franchiseApi } from "@/lib/api";',
  'import { productBatchesApi, productsFullApi, franchiseApi, productionApi } from "@/lib/api";\nimport toast from "react-hot-toast";'
);

// 2. Add states
content = content.replace(
  'const [packQty, setPackQty] = useState("");',
  `const [packQty, setPackQty] = useState("");
  const [packagings, setPackagings] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQCModal, setShowQCModal] = useState(false);
  const [qcBatch, setQcBatch] = useState<any>(null);
  const [qcStatus, setQcStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");`
);

// 3. Update fetchBatches
content = content.replace(
  'productsFullApi.getAll(),',
  'productsFullApi.getAll(),\n        productionApi.getPackagings(franchiseId || undefined),'
);
content = content.replace(
  'const [bRes, pRes] = await Promise.all',
  'const [bRes, pRes, packRes] = await Promise.all'
);
content = content.replace(
  'setProducts(pRes.data ?? []);',
  'setProducts(pRes.data ?? []);\n      setPackagings(packRes.data ?? []);'
);

// 4. Update Actions in Batch Registry
const newActions = `
                                <div className="flex gap-2">
                                  {["View", "QC", "Pack", "Dispatch", "Recall"].map((action) => {
                                    let isDisabled = false;
                                    if (action === "QC" && batch.qcStatus === "APPROVED") isDisabled = true;
                                    if (action === "Pack" && (batch.qcStatus !== "APPROVED" || batch.packagingStatus === "PACKAGED")) isDisabled = true;

                                    return (
                                      <button
                                        key={action}
                                        disabled={isDisabled}
                                        onClick={() => {
                                          if (action === "Pack") {
                                            setPackBatch(batch);
                                            setShowPackModal(true);
                                          } else if (action === "View") {
                                            setSelectedBatch(batch);
                                            setShowBatchDetails(true);
                                          } else if (action === "QC") {
                                            setQcBatch(batch);
                                            setShowQCModal(true);
                                          } else if (action === "Dispatch") {
                                            alert(\`Preparing to dispatch batch \${batch.batchCode}\`);
                                          } else if (action === "Recall") {
                                            alert(\`Initiating recall for batch \${batch.batchCode}\`);
                                          }
                                        }}
                                        className={clsx(
                                          "text-[9px] font-black uppercase transition-colors tracking-wider",
                                          isDisabled ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" : "text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                                        )}
                                      >
                                        {action}
                                      </button>
                                    );
                                  })}
                                </div>
`;

content = content.replace(
  /<div className="flex gap-2">\s*\{\["View", "QC", "Pack", "Dispatch", "Recall"\]\.map\(\(action\) => \([\s\S]*?<\/button>\s*\)\)\}\s*<\/div>/,
  newActions
);

// 5. Update Status badge in Registry based on qcStatus
content = content.replace(
  /<td className="px-4 py-3">\s*<span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-\[9px\] font-bold uppercase tracking-wider">\s*Active\s*<\/span>\s*<\/td>/,
  `<td className="px-4 py-3">
                              <span className={clsx("px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider",
                                batch.qcStatus === "APPROVED" && batch.packagingStatus === "PACKAGED" ? "bg-blue-50 text-blue-600" :
                                batch.qcStatus === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                                batch.qcStatus === "REJECTED" ? "bg-rose-50 text-rose-600" :
                                "bg-amber-50 text-amber-600"
                              )}>
                                {batch.qcStatus === "APPROVED" ? (batch.packagingStatus === "PACKAGED" ? "PACKAGED" : "READY TO PACK") : batch.qcStatus || "PENDING QC"}
                              </span>
                            </td>`
);

// 6. Update Available Qty column calculation in Registry
// The available quantity should be exactly (batch.quantity - batch.packagedQty)
content = content.replace(
  /\{batch\.availableQuantity \|\| batch\.quantity\}/,
  '{Math.max(0, batch.quantity - (batch.packagedQty || 0))}'
);

// Write to file
fs.writeFileSync(filePath, content, 'utf-8');
console.log("Updated basic components");
