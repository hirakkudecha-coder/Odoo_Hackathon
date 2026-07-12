# API Reference

Base path: `/api/v1`. All protected endpoints require `Authorization: Bearer <accessToken>`. List responses accept `page`, `limit`, `sort`, `order`, `search`, and module-specific filters and return `{ data, meta: { page, limit, total, totalPages } }`.

## Authentication

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | Issue access and refresh tokens |
| POST | `/auth/refresh` | Refresh cookie | Rotate refresh token |
| POST | `/auth/logout` | Signed in | Revoke current refresh token |
| POST | `/auth/forgot-password` | Public | Send reset link |
| POST | `/auth/reset-password` | Public | Reset with one-time token |
| GET | `/auth/me` | Signed in | Current profile and permissions |

## Resources

| Resource | Endpoints |
| --- | --- |
| Dashboard | `GET /dashboard/summary`, `GET /dashboard/charts` |
| Vehicles | `GET, POST /vehicles`; `GET, PATCH, DELETE /vehicles/:id`; `POST /vehicles/:id/documents` |
| Drivers | `GET, POST /drivers`; `GET, PATCH, DELETE /drivers/:id`; `POST /drivers/:id/license` |
| Trips | `GET, POST /trips`; `GET, PATCH /trips/:id`; `POST /trips/:id/dispatch`, `/cancel`, `/complete` |
| Maintenance | `GET, POST /maintenance`; `GET, PATCH /maintenance/:id`; `POST /maintenance/:id/close` |
| Fuel | `GET, POST /fuel-logs`; `GET, PATCH, DELETE /fuel-logs/:id` |
| Expenses | `GET, POST /expenses`; `GET, PATCH, DELETE /expenses/:id` |
| Reports | `GET /reports/{vehicles,drivers,trips,fuel,expenses,maintenance}`; `GET /reports/:type/export?format=csv|pdf` |
| Settings | `GET, PATCH /settings/profile`; `PATCH /settings/password`; `GET, PATCH /settings/notifications` |

## Status semantics

`POST /trips/:id/dispatch` is idempotency-key aware. It rejects expired/suspended/on-trip drivers, maintenance/retired/on-trip vehicles, or cargo above vehicle capacity. `POST /trips/:id/complete` accepts actual end time, ending odometer, delivered cargo, and optional notes.

Use `422` for semantic validation, `409` for availability/conflict, `401` for unauthenticated, `403` for unauthorized, and `404` for missing or deleted records.
