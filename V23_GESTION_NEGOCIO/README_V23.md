# V23 - Gestión de clientas, multiservicio e histórico del negocio

## 1. Rama
```powershell
git checkout main
git pull
git checkout -b v23-gestion-negocio
```

## 2. Base de datos
Ejecuta **SUPABASE_V23.sql** en Supabase > SQL Editor **antes del build/despliegue**.

La migración:
- hace opcional `Customer.email`;
- hace opcional `Booking.clientEmail`;
- crea `BookingService`;
- migra todas las citas antiguas a esa tabla.

## 3. Instalar archivos
Descomprime el paquete fuera del proyecto y desde la raíz del proyecto:
```powershell
powershell -ExecutionPolicy Bypass -File "RUTA\V23_GESTION_NEGOCIO\install-v23.ps1"
npm run build
```

## 4. Subir
```powershell
git add .
git commit -m "V23 gestion negocio multiservicio"
git push -u origin v23-gestion-negocio
```

## Pruebas
1. Admin > Clientes: crear clienta sin email.
2. Staff > Nueva cita: seleccionar 2 o 3 servicios y crear cita.
3. Staff > Agenda: comprobar nombres combinados.
4. Caja: abrir la cita y comprobar que carga todos los servicios.
5. Admin > Clientes > Ver histórico.
6. Admin > Resumen negocio: probar filtros de fechas y profesional.
