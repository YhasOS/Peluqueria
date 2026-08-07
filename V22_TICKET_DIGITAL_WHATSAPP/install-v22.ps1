$ErrorActionPreference = "Stop"

$file = Join-Path (Get-Location) "src\pages\staff\checkout.tsx"
if (-not (Test-Path $file)) { throw "No se encuentra src\pages\staff\checkout.tsx" }

$content = Get-Content $file -Raw

if ($content -match 'Enviar ticket por WhatsApp') {
  Write-Host "V22 ya está instalada." -ForegroundColor Yellow
  exit 0
}

$content = $content.Replace(
"  const [error, setError] = useState('');",
"  const [error, setError] = useState('');`r`n  const [ticketPhone, setTicketPhone] = useState('');"
)

$content = $content.Replace(
"        setBooking(data);",
"        setBooking(data);`r`n        setTicketPhone(data.clientPhone || '');"
)

$needle = "  const change = received - total;"
$insert = @'
  const change = received - total;

  const ticketText = useMemo(() => {
    const now = new Date();
    const detail = items.map(item =>
      `• ${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}: ${money(item.unitPriceCents * item.quantity)}`
    );

    return [
      'GEMA ESTUDIO DE BELLEZA',
      'Ticket digital',
      '',
      `Fecha: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      booking?.clientName ? `Clienta: ${booking.clientName}` : '',
      booking?.professional?.name ? `Profesional: ${booking.professional.name}` : '',
      '',
      ...detail,
      '',
      `TOTAL: ${money(total)}`,
      `Recibido: ${money(received)}`,
      `Cambio: ${money(Math.max(change, 0))}`,
      '',
      'Gracias por confiar en Gema Estudio de Belleza.',
      'gemaestudiodebelleza.es',
    ].filter(Boolean).join('\n');
  }, [items, total, received, change, booking]);

  const whatsappUrl = useMemo(() => {
    const digits = ticketPhone.replace(/\D/g, '');
    if (!digits) return '';
    const phone = digits.startsWith('34') ? digits : digits.length === 9 ? `34${digits}` : digits;
    return `https://wa.me/${phone}?text=${encodeURIComponent(ticketText)}`;
  }, [ticketPhone, ticketText]);
'@
$content = $content.Replace($needle, $insert)

$start = $content.IndexOf("  if (done) {")
$endMarker = "  return (`r`n    <main className=\"min-h-screen bg-[#f8eee8] p-3 text-[#3b2b25] md:p-6\">"
$end = $content.IndexOf($endMarker, $start)
if ($start -lt 0 -or $end -lt 0) { throw "No se encontró el bloque de venta finalizada." }

$newDone = @'
  if (done) {
    return (
      <main className="min-h-screen bg-[#f8eee8] p-4 text-[#3b2b25] md:p-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow md:p-8">
          <div className="text-center">
            <div className="text-6xl">✓</div>
            <h1 className="mt-3 text-3xl font-extrabold text-green-700">Venta finalizada</h1>
            <p className="mt-3 text-xl">Total cobrado: <strong>{money(total)}</strong></p>
            <p className="mt-2 text-3xl font-extrabold text-[#8a5a42]">Cambio: {money(Math.max(change, 0))}</p>
          </div>

          <div className="mt-6 rounded-2xl bg-[#f8eee8] p-5">
            <h2 className="text-xl font-bold text-[#8a5a42]">Ticket digital</h2>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6">{ticketText}</pre>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold">Teléfono de la clienta</label>
            <input
              value={ticketPhone}
              onChange={e => setTicketPhone(e.target.value)}
              inputMode="tel"
              placeholder="Ej. 647067368"
              className="mt-1 w-full rounded-xl border p-3"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {whatsappUrl ? (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-green-500 px-5 py-4 text-center font-bold text-white">
                Enviar ticket por WhatsApp
              </a>
            ) : (
              <button onClick={() => alert('Introduce el teléfono de la clienta.')} className="rounded-xl bg-green-200 px-5 py-4 font-bold text-green-800">
                Enviar ticket por WhatsApp
              </button>
            )}

            <button
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({ title: 'Ticket Gema Estudio de Belleza', text: ticketText });
                    return;
                  } catch {}
                }
                await navigator.clipboard.writeText(ticketText);
                alert('Ticket copiado. Ya puedes pegarlo en WhatsApp.');
              }}
              className="rounded-xl bg-[#3b2b25] px-5 py-4 font-bold text-white"
            >
              Compartir o copiar ticket
            </button>

            <button onClick={reset} className="rounded-xl bg-[#a66f54] px-5 py-4 font-bold text-white">Nueva venta</button>
            <Link href="/staff" className="rounded-xl bg-[#f4e4dc] px-5 py-4 text-center font-bold text-[#8a5a42]">Volver a agenda</Link>
          </div>
        </div>
      </main>
    );
  }

'@

$content = $content.Substring(0, $start) + $newDone + $content.Substring($end)
Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "V22 instalada. Ejecuta npm run build." -ForegroundColor Green
