# V10 Panel trabajadoras limpio

Incluye:

- Login de trabajadoras con cookie compatible.
- `/staff` con menú lateral estilo admin.
- Dashboard de trabajadora.
- Agenda propia.
- Agenda de compañeras.
- Agenda completa del equipo.
- Resumen económico por fechas.
- Corrección de `/admin/professionals` para que no rompa.
- API `/api/professionals` compatible con la tabla `Professional` actual.
- SQL de limpieza para dejar solo Gema y Nadia.

## Pasos

1. Descomprimir encima de la carpeta del proyecto.
2. Ejecutar en Supabase:

```sql
prisma/SUPABASE_GEMA_V10_CLEAN.sql
```

3. Probar build:

```powershell
npm run build
```

4. Subir:

```powershell
git add .
git commit -m "V10 panel trabajadoras limpio"
git push
```

Usuarios:

- gema / gema123
- nadia / nadia123
