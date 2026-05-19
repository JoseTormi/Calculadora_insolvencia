# Calculadora de Insolvencia - Alianza Jurídica Avanzar

Aplicación web MVP para captar prospectos calificados, calcular un diagnóstico orientativo de insolvencia/RCH/reorganización, registrar leads en PostgreSQL, sincronizar Bitrix24 y enviar bienvenida por WhatsApp mediante Wasapi.

## Requisitos

- Node.js 20+
- PostgreSQL 14+ o Supabase
- Webhook entrante de Bitrix24
- Token/API URL de Wasapi y plantilla aprobada por Meta

## Configuración local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` basado en `.env.example`.

3. Crear la base de datos y ejecutar migraciones:

```bash
npm run migrate
```

4. Crear el primer usuario admin:

```bash
SEED_ADMIN_EMAIL=admin@avanzar.local SEED_ADMIN_PASSWORD=Admin12345! npm run seed
```

En PowerShell:

```powershell
$env:SEED_ADMIN_EMAIL="admin@avanzar.local"; $env:SEED_ADMIN_PASSWORD="Admin12345!"; npm run seed
```

5. Arrancar en desarrollo:

```bash
npm run dev
```

La calculadora queda en `http://localhost:3000/` y el panel en `http://localhost:3000/panel`.

## Variables de entorno

- `PORT`: puerto HTTP.
- `DATABASE_URL`: conexión PostgreSQL/Supabase.
- `JWT_SECRET`: secreto largo para firmar JWT.
- `CORS_ORIGIN`: origen permitido, por ejemplo `https://tu-dominio.com`.
- `BITRIX_WEBHOOK_URL`: URL completa del webhook `crm.lead.add.json`.
- `BITRIX_FIELD_RESULTADO`, `BITRIX_FIELD_SERVICIO`, `BITRIX_FIELD_RANGO_DEUDA`: IDs de campos personalizados en Bitrix24.
- `WASAPI_API_URL`, `WASAPI_TOKEN`, `WASAPI_TEMPLATE_NAME`: configuración de WhatsApp.
- `NODE_ENV`: `development`, `test` o `production`.

Si Bitrix24 o Wasapi no están configurados, el lead se guarda localmente y la integración se omite con un log de advertencia.

## Pruebas

```bash
npm test
```

Incluye pruebas unitarias de la calculadora e integración de `/api/calcular`, `/api/leads` y `/api/auth/login` con base de datos mockeada.

## API

Todas las respuestas JSON siguen:

```json
{ "ok": true, "data": {} }
```

o:

```json
{ "ok": false, "error": "Mensaje" }
```

Ejemplos completos están en `requests.http`.

Endpoints principales:

- `POST /api/calcular`
- `POST /api/leads`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/leads`
- `GET /api/leads/:id`
- `PATCH /api/leads/:id`
- `GET /api/leads/export`
- `GET /api/health`

## Despliegue en Render

El repositorio incluye `render.yaml` para desplegar la app como Web Service de Node.js. Render ejecuta:

```text
Build Command: npm ci
Pre-Deploy Command: npm run migrate
Start Command: npm start
Health Check Path: /api/health
```

1. Subir el repositorio a GitHub o GitLab.
2. Crear una base PostgreSQL. Puede ser Render Postgres, Supabase u otro PostgreSQL accesible desde Render.
3. En Render, crear un Blueprint desde este repositorio o crear un Web Service manual usando los comandos anteriores.
4. Configurar las variables de entorno:

```text
DATABASE_URL=postgresql://...
JWT_SECRET=un-secreto-largo-de-producción
NODE_ENV=production
CORS_ORIGIN=https://tu-servicio.onrender.com
BITRIX_WEBHOOK_URL=
WASAPI_API_URL=
WASAPI_TOKEN=
```

Si usas el Blueprint, `JWT_SECRET` se genera automáticamente y Render pedirá `DATABASE_URL`, `CORS_ORIGIN` y las credenciales opcionales.

5. Ejecutar el seed una vez desde Render Shell:

```bash
SEED_ADMIN_EMAIL=admin@avanzar.com SEED_ADMIN_PASSWORD='cambie-esto' npm run seed
```

6. Abrir:

```text
https://tu-servicio.onrender.com/
https://tu-servicio.onrender.com/panel
https://tu-servicio.onrender.com/api/health
```

## Frontend en Express o Vercel

Por defecto Express sirve `/public`, suficiente para Render.

Para Vercel, subir `/public` como sitio estático y definir en el JavaScript una URL base hacia el backend, o mantener frontend y API juntos en Render para simplificar el MVP.

## Decisiones técnicas

- Se usa `pg` y migraciones SQL simples para compatibilidad directa con Supabase.
- Las integraciones externas corren de forma asíncrona tras guardar el lead, para no bloquear al usuario.
- La calculadora está parametrizada en `src/config/constants.js`; sus reglas son orientativas y no constituyen asesoría legal.
- No se registran datos personales en logs de nivel informativo; los errores de integración registran identificador interno del lead.

## Pendiente para producción

- Configurar campos personalizados reales de Bitrix24.
- Confirmar contrato exacto de Wasapi según la cuenta/proveedor y plantilla aprobada.
- Agregar auditoría histórica de comentarios/estados si el proceso comercial lo requiere.
- Activar monitoreo, backups y rotación de secretos.
