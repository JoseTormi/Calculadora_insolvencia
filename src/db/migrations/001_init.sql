CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE lead_resultado AS ENUM ('apto', 'no_apto', 'requiere_asesoria');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE servicio_recomendado AS ENUM ('insolvencia', 'rch', 'reorganizacion');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_estado AS ENUM ('nuevo', 'contactado', 'no_contactado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE usuario_rol AS ENUM ('admin', 'asesor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text NOT NULL,
  correo text NOT NULL,
  ciudad text NOT NULL,
  ingresos_mensuales numeric(14,2) NOT NULL,
  gastos_mensuales numeric(14,2) NOT NULL,
  deuda_total numeric(14,2) NOT NULL,
  numero_acreedores integer NOT NULL,
  tiene_mora boolean NOT NULL,
  resultado lead_resultado NOT NULL,
  servicio_recomendado servicio_recomendado NOT NULL,
  rango_deuda text NOT NULL,
  bitrix_lead_id text,
  whatsapp_enviado boolean NOT NULL DEFAULT false,
  estado lead_estado NOT NULL DEFAULT 'nuevo',
  comentario text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correo text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  nombre text NOT NULL,
  rol usuario_rol NOT NULL DEFAULT 'asesor',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_ciudad_idx ON leads (ciudad);
CREATE INDEX IF NOT EXISTS leads_estado_idx ON leads (estado);
CREATE INDEX IF NOT EXISTS leads_servicio_idx ON leads (servicio_recomendado);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
