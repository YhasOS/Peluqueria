$ErrorActionPreference = "Stop"
$project = Get-Location
$package = Split-Path -Parent $MyInvocation.MyCommand.Path
$targets = @(
  "prisma\schema.prisma",
  "src\pages\api\customers.ts",
  "src\pages\api\customers\history.ts",
  "src\pages\admin\customers.tsx",
  "src\pages\admin\customer-history.tsx",
  "src\pages\api\staff\multi-slots.ts",
  "src\pages\api\staff\create-booking.ts",
  "src\pages\staff\new-booking.tsx",
  "src\pages\api\bookings.ts",
  "src\pages\admin\bookings.tsx",
  "src\pages\api\staff\bookings.ts",
  "src\pages\api\staff\checkout-booking.ts",
  "src\pages\staff\checkout.tsx",
  "src\pages\api\admin\service-summary.ts",
  "src\pages\admin\reports.tsx",
  "src\pages\admin\index.tsx"
)
foreach ($t in $targets) { $s=Join-Path $package $t; $d=Join-Path $project $t; New-Item -ItemType Directory -Force -Path (Split-Path -Parent $d) | Out-Null; Copy-Item -Force $s $d; Write-Host "Copiado $t" -ForegroundColor Green }
Write-Host "Archivos V23 copiados. Ejecuta primero SUPABASE_V23.sql en Supabase y después npm run build." -ForegroundColor Cyan
