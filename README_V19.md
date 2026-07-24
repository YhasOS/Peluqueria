# V19 – Crear citas desde Staff

## Instalación

1. Actualiza `main`:

```powershell
git checkout main
git pull
git checkout -b v19-crear-citas-staff
```

2. Descomprime este ZIP fuera del proyecto.

3. Desde la carpeta raíz del proyecto ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File "RUTA_DEL_PAQUETE\install-v19.ps1"
```

Ejemplo:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\OFICINA-OTROS\Downloads\V19_CREAR_CITAS_STAFF\install-v19.ps1"
```

4. Compila:

```powershell
npm run build
```

5. Si compila correctamente:

```powershell
git status
git add .
git commit -m "V19 crear citas desde staff"
git push -u origin v19-crear-citas-staff
```

## Funcionalidad

- Página `/staff/new-booking`.
- Buscar clientas existentes.
- Crear clientas nuevas con nombre y teléfono.
- Email opcional.
- Seleccionar servicio y profesional.
- Consultar horas disponibles reales.
- Crear la cita sin solapamientos.
- Añadirla inmediatamente a la agenda.
- Confirmación por WhatsApp a la clienta.
- Acceso protegido por sesión de trabajadora.
