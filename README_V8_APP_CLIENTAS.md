# Gema Estudio de Belleza V8 - App instalable de clientas

Incluye:

- PWA instalable desde móvil.
- Manifest + Service Worker + iconos GE.
- Nueva página `/mi-cuenta`.
- Consulta de próximas citas por email o teléfono.
- Historial de citas pasadas y servicios realizados.
- Ficha de clienta con notas, color/fórmula y alergias cuando el salón la complete.
- Botón de instalación de app cuando el navegador lo permita.
- Enlace “Mi cuenta” en la navegación.
- Email corporativo actualizado: `info@gemaestudiodebelleza.es`.

## Pasos

1. Descomprime encima del proyecto actual.
2. No borres `.env`.
3. Ejecuta en Supabase `SUPABASE_GEMA_V8_APP_CLIENTES.sql`.
4. Prueba local:

```powershell
npm.cmd run build
npm.cmd run dev
```

5. Sube a GitHub:

```powershell
git add .
git commit -m "App instalable para clientas"
git push
```

Vercel desplegará automáticamente.

## Cómo se instala en móvil

- Android/Chrome: abrir web > menú del navegador > “Instalar aplicación” o botón “Instalar app”.
- iPhone/Safari: compartir > “Añadir a pantalla de inicio”.

