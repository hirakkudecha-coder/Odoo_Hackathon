# Testing Strategy

## Test layers

| Layer | Scope |
| --- | --- |
| Unit | Validators, permission checks, calculations, state transitions |
| Integration | Express routes with MongoDB test database, auth, indexes, service transactions |
| Component | Forms, table states, status chips, role visibility |
| E2E | Login, create assets, dispatch, complete trip, maintenance, export report |

## Required acceptance scenarios

1. Duplicate registration returns a clear `409` and does not create a vehicle.
2. Dispatch rejects every invalid driver/vehicle/capacity combination.
3. Successful dispatch atomically marks trip, driver, and vehicle as on-trip and records an audit event.
4. Completing a trip restores availability and preserves actual metrics.
5. Maintenance blocks dispatch until it is closed.
6. Role restrictions work when calling APIs directly, not just through the UI.
7. Pagination, sorting, filters, exports, dark mode, and mobile navigation are verified.

Run linting, unit tests, integration tests, build, dependency audit, and E2E smoke tests in CI. Seed deterministic fixtures; do not test against production data.
