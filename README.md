# Gema Estudio de Belleza - App de reservas

Aplicación Next.js + Supabase para reservas online, agenda y panel de administración de Gema Estudio de Belleza.

## Datos configurados

- Nombre: Gema Estudio de Belleza
- Email: info@gemaestudiodebelleza.es
- WhatsApp: 647 067 368
- Dirección: Calle Velero, 29750 Mezquitilla (Algarrobo Costa), Málaga
- Estilo: elegante, femenino, tonos beige, rosa empolvado, dorado/cobre y marrón cálido.

## Instalación local

No borres tu archivo `.env`.

```powershell
npm.cmd install --legacy-peer-deps
npx prisma generate
npm.cmd run dev
```

Abrir:

```text
http://localhost:3000
```

Panel administrador:

```text
http://localhost:3000/admin/login
```

La contraseña está en `.env`:

```env
ADMIN_PASSWORD="tu_contraseña"
```

## Supabase

Ejecuta en Supabase > SQL Editor:

```text
SUPABASE_GEMA_FINAL.sql
```

Este script deja la web con la carta definitiva de servicios, precios con rangos, profesionales, recursos y configuración de horario.

Aviso: limpia citas de prueba antes de cargar los servicios definitivos.

## Publicación

Antes de publicar en Vercel, configurar variables de entorno:

```env
DATABASE_URL="...pooler supabase..."
ADMIN_PASSWORD="..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://tu-dominio"
```
