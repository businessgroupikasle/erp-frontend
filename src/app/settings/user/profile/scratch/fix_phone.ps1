
$path = "c:\Users\Admin\Desktop\erp-frontend\src\app\settings\user\profile\page.tsx"
$content = Get-Content $path -Raw
$target = 'onChange={(e) => setFormData({ ...formData, phone: e.target.value })}'
$replacement = 'onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setFormData({ ...formData, phone: val }); }}'
$content = $content.Replace($target, $replacement)
$content = $content.Replace('placeholder="78451-32962"', 'placeholder="10 digits"')
$content = $content.Replace('text-[14px] font-medium', 'text-sm font-semibold')
Set-Content $path $content
