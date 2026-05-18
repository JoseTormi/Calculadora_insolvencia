# Calculadora de Insolvencia - Alianza Juridica Avanzar

Aplicacion web MVP para captar prospectos calificados, calcular un diagnostico orientativo de insolvencia/RCH/reorganizacion, registrar leads en PostgreSQL, sincronizar Bitrix24 y enviar bienvenida por WhatsApp mediante Wasapi.

## Requisitos

- Node.js 20+
- PostgreSQL 14+ o Supabase
- Webhook entrante de Bitrix24
- Token/API URL de Wasapi y plantilla aprobada por Meta

## Configuracion local

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
- `DATABASE_URL`: conexion PostgreSQL/Supabase.
- `JWT_SECRET`: secreto largo para firmar JWT.
- `CORS_ORIGIN`: origen permitido, por ejemplo `https://tu-dominio.com`.
- `BITRIX_WEBHOOK_URL`: URL completa del webhook `crm.lead.add.json`.
- `BITRIX_FIELD_RESULTADO`, `BITRIX_FIELD_SERVICIO`, `BITRIX_FIELD_RANGO_DEUDA`: IDs de campos personalizados en Bitrix24.
- `WASAPI_API_URL`, `WASAPI_TOKEN`, `WASAPI_TEMPLATE_NAME`: configuracion de WhatsApp.
- `NODE_ENV`: `development`, `test` o `production`.

Si Bitrix24 o Wasapi no estan configurados, el lead se guarda localmente y la integracion se omite con un log de advertencia.

## Pruebas

```bash
npm test
```

Incluye pruebas unitarias de la calculadora e integracion de `/api/calcular`, `/api/leads` y `/api/auth/login` con base de datos mockeada.

## API

Todas las respuestas JSON siguen:

```json
{ "ok": true, "data": {} }
```

o:

```json
{ "ok": false, "error": "Mensaje" }
```

Ejemplos completos estan en `requests.http`.

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

## Despliegue en Render + Supabase

1. Crear proyecto en Supabase y copiar `DATABASE_URL` con SSL.
2. En Render, crear un Web Service conectado al repositorio.
3. Configurar:

```text
Build Command: npm install
Start Command: npm run migrate && npm start
```

4. Agregar variables de entorno de `.env.example`.
5. Ejecutar el seed una vez desde Render Shell:

```bash
SEED_ADMIN_EMAIL=admin@avanzar.com SEED_ADMIN_PASSWORD='cambie-esto' npm run seed
```

6. Configurar `CORS_ORIGIN` con el dominio final.

## Frontend en Express o Vercel

Por defecto Express sirve `/public`, suficiente para Render.

Para Vercel, subir `/public` como sitio estatico y definir en el JavaScript una URL base hacia el backend, o mantener frontend y API juntos en Render para simplificar el MVP.

## Decisiones tecnicas

- Se usa `pg` y migraciones SQL simples para compatibilidad directa con Supabase.
- Las integraciones externas corren de forma asincrona tras guardar el lead, para no bloquear al usuario.
- La calculadora esta parametrizada en `src/config/constants.js`; sus reglas son orientativas y no constituyen asesoria legal.
- No se registran datos personales en logs de nivel informativo; los errores de integracion registran identificador interno del lead.

## Pendiente para produccion

- Configurar campos personalizados reales de Bitrix24.
- Confirmar contrato exacto de Wasapi segun la cuenta/proveedor y plantilla aprobada.
- Agregar auditoria historica de comentarios/estados si el proceso comercial lo requiere.
- Activar monitoreo, backups y rotacion de secretos.
