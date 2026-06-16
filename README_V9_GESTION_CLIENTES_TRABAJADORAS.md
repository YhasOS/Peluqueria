# Gema Estudio de Belleza - V9 Gestión avanzada

Esta versión añade:

- Área de clientas sin contraseña complicada.
- Acceso por teléfono/email + código sencillo.
- Ver próximas citas.
- Ver citas pasadas y servicios realizados.
- Cancelar cita.
- Cambiar cita a otro día/hora disponible.
- Panel de trabajadora.
- Cada trabajadora ve sus citas y también las de compañeras en modo consulta.
- Resumen económico por fechas y trabajadora.
- Preparado para coordinar servicios entre compañeras.

## Orden de instalación

1. Copia estos archivos encima del proyecto actual.
2. Ejecuta en Supabase el archivo:

```sql
prisma/SUPABASE_GEMA_V9_CLIENTES_TRABAJADORAS.sql
```

3. Añade o comprueba estas variables en Vercel:

```env
ADMIN_PASSWORD=tu_password_admin
STAFF_MASTER_PASSWORD=GemaStaff2026!
SMTP_HOST=smtp.dondominio.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@gemaestudiodebelleza.es
SMTP_PASSWORD=contraseña_correo
MAIL_FROM=info@gemaestudiodebelleza.es
```

4. En local:

```powershell
npm.cmd install nodemailer
npm.cmd run build
git add .
git commit -m "Gestion clientes trabajadoras y cambios de cita"
git push
```

## Acceso de clientas

Ruta:

```text
/cliente/acceso
```

La clienta solo introduce:

- Teléfono
- Email

Recibe un código de 6 cifras por email. No tiene que recordar contraseña.

## Acceso trabajadoras

Ruta:

```text
/staff/login
```

Primera trabajadora ejemplo:

```text
Usuario: gema
Contraseña: GemaStaff2026!
```

Segunda trabajadora ejemplo:

```text
Usuario: trabajadora
Contraseña: GemaStaff2026!
```

La contraseña común se puede cambiar en Vercel con `STAFF_MASTER_PASSWORD`.

## Importante

Esta versión no borra tus reservas actuales. Añade columnas y tablas nuevas.
