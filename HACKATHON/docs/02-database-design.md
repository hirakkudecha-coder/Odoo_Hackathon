# Database Design

Every operational collection has `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `isDeleted`, and `deletedAt`. Standard queries exclude deleted documents. Use UTC dates, Decimal128 for money where precision matters, and ObjectId references.

## Collections

| Collection | Key fields | Indexes / constraints |
| --- | --- | --- |
| users | name, email, passwordHash, role, status, refreshTokens | unique normalized email; `{ role, status }` |
| vehicles | registrationNumber, name, type, capacityKg, odometerKm, status | unique normalized registration; `{ status, isDeleted }` |
| drivers | userId?, licenseNumber, category, expiryDate, safetyScore, status | unique license; `{ status, expiryDate }` |
| trips | tripNumber, vehicleId, driverId, source, destination, cargoWeightKg, status | unique trip number; `{ status, dispatchAt }`, `{ vehicleId, status }`, `{ driverId, status }` |
| maintenanceRequests | vehicleId, type, status, dueDate, cost | `{ vehicleId, status }`, `{ dueDate, status }` |
| fuelLogs | vehicleId, tripId?, filledAt, liters, cost, odometerKm | `{ vehicleId, filledAt: -1 }` |
| expenses | category, vehicleId?, tripId?, amount, incurredAt, status | `{ category, incurredAt }`, `{ vehicleId, incurredAt }` |
| documents | ownerType, ownerId, kind, storageKey, expiryDate | `{ ownerType, ownerId }`, `{ expiryDate }` |
| auditLogs | actorId, entityType, entityId, action, before, after | `{ entityType, entityId, createdAt: -1 }`, `{ actorId, createdAt: -1 }` |

## ER diagram

```text
User (1) ─────< AuditLog
User (0..1) ── (1) Driver
Vehicle (1) ──< Trip >── (1) Driver
Vehicle (1) ──< MaintenanceRequest
Vehicle (1) ──< FuelLog >── (0..1) Trip
Vehicle (0..1) ─< Expense >── (0..1) Trip
Vehicle / Driver / Trip (1) ──< Document
```

## Schema notes

`vehicles.status`: `available | on_trip | maintenance | retired`.

`drivers.status`: `available | on_trip | suspended | inactive`.

`trips.status`: `draft | scheduled | dispatched | in_progress | completed | cancelled`.

Do not calculate historical revenue or cost by overwriting source records. Store trip-level agreed revenue and derive dashboard aggregates from filtered data. Audit logs are append-only and never soft-deleted.
