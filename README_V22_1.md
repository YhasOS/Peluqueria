# V22.1 Ticket visual

```powershell
git checkout main
git pull
git checkout -b v22-1-ticket-visual
powershell -ExecutionPolicy Bypass -File "RUTA\V22_1_TICKET_VISUAL\install-v22-1.ps1"
npm run build
git add .
git commit -m "V22.1 ticket visual WhatsApp"
git push -u origin v22-1-ticket-visual
```

El ticket se muestra con diseño visual y puede compartirse como PNG desde móvil.
