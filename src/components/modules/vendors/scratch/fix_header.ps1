
$path = "c:\Users\Admin\Desktop\erp-frontend\src\components\modules\vendors\VendorsClient.tsx"
$content = Get-Content $path -Raw

# Target block to remove (the redundant header)
$target = '             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    {linkEditing ? <Edit3 size={20} /> : <Plus size={20} />}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{linkEditing ? "Edit Material" : "Link Material"}</h2>
                </div>
                <button onClick={() => setLinkModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
             </div>
                <div>
                   <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase">{linkEditing ? "Update Link" : "Link Material"}</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{linkModal.name}</p>
                </div>
               </div>'

$replacement = '             <div className="flex items-center justify-between relative z-10 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    {linkEditing ? <Edit3 size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{linkEditing ? "Edit Material" : "Link Material"}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{linkModal.name}</p>
                  </div>
                </div>
                <button onClick={() => setLinkModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
             </div>'

# Note: The above string replacement might still fail if indentation doesn't match exactly.
# I will use a regex-based approach in PowerShell instead.

$pattern = '(?s)             <div className="flex items-center justify-between relative z-10">.*?               </div>'
$content = [regex]::Replace($content, $pattern, $replacement)

Set-Content $path $content
