$ErrorActionPreference = "Stop"

$project = Get-Location
$package = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Instalando V19 - Crear citas desde Staff..." -ForegroundColor Cyan

$targets = @(
  "src\pages\staff\new-booking.tsx",
  "src\pages\api\staff\create-booking.ts"
)

foreach ($target in $targets) {
  $source = Join-Path $package $target
  $destination = Join-Path $project $target
  $destinationDirectory = Split-Path -Parent $destination

  New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
  Copy-Item -Force $source $destination
  Write-Host "Copiado: $target" -ForegroundColor Green
}

$staffIndex = Join-Path $project "src\pages\staff\index.tsx"

if (-not (Test-Path $staffIndex)) {
  throw "No se encuentra src\pages\staff\index.tsx"
}

$content = Get-Content $staffIndex -Raw

if ($content -notmatch 'href="/staff/new-booking"') {
  $needle = '<div className="flex flex-wrap gap-2">'
  $replacement = @'
<div className="flex flex-wrap gap-2">
  <a
    href="/staff/new-booking"
    className="rounded-xl bg-[#a66f54] px-5 py-3 font-semibold text-white shadow"
  >
    + Nueva cita
  </a>
'@

  if ($content.Contains($needle)) {
    $content = $content.Replace($needle, $replacement)
  } else {
    $needle = '<a href="/admin"'
    $replacement = @'
<a
  href="/staff/new-booking"
  className="rounded-xl bg-[#a66f54] px-5 py-3 font-semibold text-white shadow"
>
  + Nueva cita
</a>
<a href="/admin"
'@

    if ($content.Contains($needle)) {
      $content = $content.Replace($needle, $replacement)
    } else {
      throw "No se ha encontrado el encabezado del panel staff para insertar el botón."
    }
  }

  Set-Content -Path $staffIndex -Value $content -Encoding UTF8
  Write-Host "Botón + Nueva cita añadido a /staff" -ForegroundColor Green
} else {
  Write-Host "El botón + Nueva cita ya existe." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Instalación terminada. Ejecuta ahora: npm run build" -ForegroundColor Cyan
