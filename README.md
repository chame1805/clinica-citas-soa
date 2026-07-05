# Clínica / Citas Médicas — Arquitectura de Servicios (OSIMM Nivel 4→5)

Arquitectura orientada a servicios para el dominio **Clínica / Citas Médicas**: 3 servicios
independientes, cada uno con su propia base de datos, comunicados por REST (síncrono) y Redis
(asíncrono), con orquestación de Saga y compensación ante fallas.

## Servicios

| Servicio | Puerto | Responsabilidad | Base de datos |
|---|---|---|---|
| `pacientes-service` | 3001 | Identidad y estado del paciente | `pacientes_db` (Postgres) |
| `medicos-agenda-service` | 3002 | Médicos, especialidades y disponibilidad de horarios | `agenda_db` (Postgres) |
| `citas-service` | 3003 | Orquestador: ciclo de vida de la cita (Saga), protegido con JWT | `citas_db` (Postgres) |

Swagger de cada servicio: `http://localhost:<puerto>/docs`

## Cómo levantar todo

```bash
docker compose up -d --build
```

Esto levanta los 3 servicios NestJS, sus 3 bases Postgres y Redis (bus de eventos).

## Flujo de la Saga (orquestación)

1. `POST /citas` en `citas-service` (requiere JWT).
2. Valida al paciente vía REST contra `pacientes-service` (`GET /pacientes/:id/estado`).
3. Reserva el horario vía REST contra `medicos-agenda-service` (`POST /slots/:id/reservar`).
4. Valida reglas de negocio locales (ej. el paciente no puede tener otra cita `CONFIRMADA` con el mismo médico).
5. Si todo es correcto: marca la cita `CONFIRMADA` y publica el evento `cita.confirmada` en Redis.
6. `medicos-agenda-service` y `pacientes-service` están suscritos a ese canal y reaccionan de forma asíncrona (marcan el slot `OCUPADO` y registran la notificación al paciente, respectivamente).

**Compensación**: si el slot ya fue reservado pero la validación de reglas de negocio falla después,
`citas-service` invoca `POST /slots/:id/liberar` sobre `medicos-agenda-service` (compensación) y
marca la cita como `FALLIDA` con el motivo.

## Probar el flujo completo (curl)

```bash
# 1. Crear paciente
curl -X POST http://localhost:3001/pacientes -H "Content-Type: application/json" -d '{
  "nombre": "Ana", "apellido": "García", "fechaNacimiento": "1998-04-12",
  "documentoIdentidad": "CC-123456789", "email": "ana.garcia@example.com", "telefono": "+50588887777"
}'

# 2. Crear médico
curl -X POST http://localhost:3002/medicos -H "Content-Type: application/json" -d '{
  "nombre": "Carlos", "apellido": "Pérez", "especialidad": "Cardiología", "cedulaProfesional": "MED-00123"
}'

# 3. Crear slot de disponibilidad (usar el id del médico)
curl -X POST http://localhost:3002/medicos/<MEDICO_ID>/slots -H "Content-Type: application/json" -d '{
  "fecha": "2026-07-10", "horaInicio": "09:00", "horaFin": "09:30"
}'

# 4. Login para obtener JWT (usuario de demostración)
curl -X POST http://localhost:3003/auth/login -H "Content-Type: application/json" -d '{
  "usuario": "recepcion", "password": "clinica123"
}'

# 5. Crear la cita (usar el JWT del paso anterior)
curl -X POST http://localhost:3003/citas -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" -d '{
  "pacienteId": "<PACIENTE_ID>", "medicoId": "<MEDICO_ID>", "slotId": "<SLOT_ID>",
  "motivoConsulta": "Control anual"
}'
```

Para ver la **compensación**: crea un segundo slot para el mismo médico y solicita otra cita con el
mismo `pacienteId` + `medicoId` — la Saga reservará el slot, detectará el conflicto de negocio,
liberará el slot automáticamente y la cita quedará `FALLIDA`.

> **Nota de seguridad simplificada**: `citas-service` expone `POST /auth/login` con un usuario de
> demostración (`recepcion` / `clinica123`, configurable por variables de entorno) solo para poder
> emitir un JWT y probar el orquestador — no es un cuarto servicio de autenticación, es una utilidad
> interna del orquestador.

## Estructura del repositorio

```
.
├── docker-compose.yml
├── pacientes-service/
├── medicos-agenda-service/
└── citas-service/
```

## Enlaces

- Repositorio: _pendiente_
- Sistema desplegado: _pendiente_

<!-- Integración final de Saga lista -->