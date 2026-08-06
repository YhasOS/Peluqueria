# V22 Ticket digital por WhatsApp

Desde la raíz del proyecto:

```powershell
git checkout main
git pull
git checkout -b v22-ticket-digital
powershell -ExecutionPolicy Bypass -File "RUTA\V22_TICKET_DIGITAL_WHATSAPP\install-v22.ps1"
npm run build
git add .
git commit -m "V22 ticket digital WhatsApp"
git push -u origin v22-ticket-digital
```

Tras finalizar una venta aparecerá el ticket, el teléfono de la clienta y los botones para enviarlo por WhatsApp, compartirlo o copiarlo.
