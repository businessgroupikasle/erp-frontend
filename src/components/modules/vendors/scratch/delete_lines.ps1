
$path = "c:\Users\Admin\Desktop\erp-frontend\src\components\modules\vendors\VendorsClient.tsx"
$lines = Get-Content $path
$newLines = $lines[0..460] + $lines[472..($lines.Count - 1)]
Set-Content $path $newLines
