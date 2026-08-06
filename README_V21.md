# V21 Caja inteligente

```powershell
git checkout main
git pull
git checkout -b v21-caja-inteligente
powershell -ExecutionPolicy Bypass -File "RUTA\V21_CAJA_INTELIGENTE\install-v21.ps1"
npm run build
git add .
git commit -m "V21 caja inteligente"
git push -u origin v21-caja-inteligente
```

Incluye:

- Cobrar desde una cita.
- Servicio de la cita cargado automáticamente.
- Servicios más usados primero.
- Cambio grande y visible.
- Finalizar venta.
- Marcar cita como pagada y realizada.
