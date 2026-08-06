$ErrorActionPreference = "Stop"
$project = Get-Location
$package = Split-Path -Parent $MyInvocation.MyCommand.Path

Copy-Item -Force `
  (Join-Path $package "src\pages\staff\checkout.tsx") `
  (Join-Path $project "src\pages\staff\checkout.tsx")

npm install html2canvas@^1.4.1

Write-Host "V22.1 instalada. Ejecuta npm run build." -ForegroundColor Green
