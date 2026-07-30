# V20 – Caja rápida Staff

Incluye `/staff/checkout`, suma de servicios, cantidades, conceptos manuales, billetes/monedas, efectivo recibido y cambio. No modifica la base de datos.

## Instalación

```powershell
git checkout main
git pull
git checkout -b v20-caja-rapida
```

Copia `src/pages/staff/checkout.tsx` en el proyecto y añade en `src/pages/staff/index.tsx` un enlace a `/staff/checkout`.

Después:

```powershell
npm run build
git add .
git commit -m "V20 caja rápida staff"
git push -u origin v20-caja-rapida
```
