# Architecture

## System overview

```text
React SPA ──HTTPS──> Express REST API ──> Services ──> MongoDB
    │                     │                  │
 Redux store           RBAC/JWT          Audit + domain events
    │                     │
 Charts, forms       Upload storage
```

The frontend is a role-aware single-page application. The API is stateless and uses short-lived access tokens plus rotated refresh tokens. MongoDB is the system of record; all state-changing workflows are coordinated in service-layer transactions.

## Repository layout

```text
transitops/
├── client/
│   └── src/
│       ├── api/ components/ features/ hooks/ layouts/
│       ├── pages/ routes/ store/ utils/ assets/
│       └── styles/
├── server/
│   └── src/
│       ├── config/ controllers/ middlewares/ models/
│       ├── routes/ services/ validators/ utils/ jobs/
│       └── app.js server.js
├── docs/
├── docker-compose.yml
└── README.md
```

## Backend request path

`route → authenticate → authorize → validate → controller → service → model → response/error middleware`.

Controllers translate HTTP to application calls; services own business rules and transactions; models contain persistence validation and indexes. A centralized error middleware returns `{ success, message, errors?, requestId }` without leaking internals.

## State and data strategy

Redux Toolkit stores identity, theme, global filters, and cached module lists. React Hook Form owns transient form state. Axios injects access tokens and performs a single refresh retry. List endpoints use server pagination, sorting, and filtering. Route-level lazy loading keeps the initial bundle small.

## Critical dispatch flow

1. Dispatcher submits a validated trip draft.
2. Service re-checks vehicle, driver, license, availability, capacity, and soft-delete state inside a MongoDB transaction.
3. Trip becomes `dispatched`; vehicle and driver become `on_trip`.
4. An immutable audit event records actor, before/after state, and correlation ID.
5. Completion records actual metrics and restores vehicle/driver availability unless another blocking status applies.
