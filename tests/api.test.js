import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/test';
process.env.JWT_SECRET = 'secreto-de-pruebas-con-longitud-suficiente';
process.env.CORS_ORIGIN = '*';

const queryMock = vi.fn();

vi.mock('../src/db/pool.js', () => ({
  query: queryMock,
  pool: { end: vi.fn() }
}));

const { createApp } = await import('../src/app.js');
const app = createApp();

describe('API', () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it('POST /api/calcular devuelve diagnostico', async () => {
    const response = await request(app)
      .post('/api/calcular')
      .send({
        ingresos_mensuales: 2_000_000,
        gastos_mensuales: 2_200_000,
        deuda_total: 40_000_000,
        numero_acreedores: 2,
        tiene_mora: true
      })
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.data.resultado).toBe('apto');
  });

  it('POST /api/leads guarda lead y responde 201', async () => {
    queryMock.mockResolvedValueOnce({
      rows: [{
        id: '3e764dec-791c-4d5d-9a53-b9391eb5780d',
        nombre: 'Ana Perez',
        telefono: '+573001112233',
        correo: 'ana@example.com',
        ciudad: 'Bogota',
        resultado: 'apto',
        servicio_recomendado: 'insolvencia',
        rango_deuda: '10-50M'
      }]
    });

    const response = await request(app)
      .post('/api/leads')
      .send({
        nombre: 'Ana Perez',
        telefono: '3001112233',
        correo: 'ANA@example.com',
        ciudad: 'Bogota',
        calculo: {
          ingresos_mensuales: 2_000_000,
          gastos_mensuales: 2_500_000,
          deuda_total: 30_000_000,
          numero_acreedores: 2,
          tiene_mora: true
        }
      })
      .expect(201);

    expect(response.body.ok).toBe(true);
    expect(response.body.data.id).toBe('3e764dec-791c-4d5d-9a53-b9391eb5780d');
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO leads'), expect.any(Array));
  });

  it('POST /api/auth/login devuelve JWT con credenciales validas', async () => {
    const hash = await bcrypt.hash('Admin12345!', 4);
    queryMock.mockResolvedValueOnce({
      rows: [{
        id: '3522a5a1-0c7a-4a83-b58f-246890bbd082',
        correo: 'admin@avanzar.local',
        password_hash: hash,
        nombre: 'Admin',
        rol: 'admin'
      }]
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'admin@avanzar.local', password: 'Admin12345!' })
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
  });
});
