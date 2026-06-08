# Gema Estudio de Belleza - Versión premium

Incluye:
- Diseño público premium basado en la identidad visual de Gema.
- Logo, fachada real, cartel, tarifas e imágenes de marca.
- WhatsApp flotante y contacto directo.
- Mapa de ubicación en Calle Velero, 29750 Mezquitilla, Algarrobo Costa, Málaga.
- Servicios reales con precios/rangos orientativos.
- Panel admin, agenda, clientes, configuración y reservas.
- Correcciones para Vercel: `prisma generate && next build`, tsconfig sin Jest y cookie admin corregida.

## Instalación local

No borres tu `.env`.

```powershell
npm.cmd install --legacy-peer-deps
npx prisma generate
npm.cmd run dev
```

## Actualizar servicios en Supabase

En Supabase > SQL Editor ejecuta:

```text
SUPABASE_GEMA_FINAL.sql
```

## Subir a GitHub y Vercel

```powershell
git add .
git commit -m "Version premium Gema Estudio Belleza"
git push
```

Variables necesarias en Vercel:

```text
DATABASE_URL=postgresql://postgres.xxxxx:TU_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
ADMIN_PASSWORD=tu_contraseña_admin
NEXTAUTH_SECRET=una_clave_larga
NEXTAUTH_URL=https://peluqueria-azure.vercel.app
```

