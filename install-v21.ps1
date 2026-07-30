$ErrorActionPreference = "Stop"
$project = Get-Location
$package = Split-Path -Parent $MyInvocation.MyCommand.Path

$targets = @(
  "src\pages\staff\checkout.tsx",
  "src\pages\api\staff\checkout-booking.ts",
  "src\pages\api\staff\finalize-checkout.ts"
)

foreach ($target in $targets) {
  $source = Join-Path $package $target
  $destination = Join-Path $project $target
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
  Copy-Item -Force $source $destination
}

$staffIndex = Join-Path $project "src\pages\staff\index.tsx"
$content = Get-Content $staffIndex -Raw

if ($content -notmatch 'Cobrar') {
  $needle = '<button onClick={() => completeBooking(b.id)}'
  $position = $content.IndexOf($needle)

  if ($position -ge 0) {
    $buttonEnd = $content.IndexOf('</button>', $position) + 9
    $cashButton = @'

<a
  href={`/staff/checkout?bookingId=${b.id}`}
  className="rounded-xl bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white"
>
  Cobrar
</a>
'@
    $content = $content.Insert($buttonEnd, $cashButton)
  }
}

Set-Content -Path $staffIndex -Value $content -Encoding UTF8
Write-Host "V21 instalada. Ejecuta npm run build." -ForegroundColor Green
