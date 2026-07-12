# TransitOps — Four-Friend Team Plan

This plan distributes the existing documentation and the implementation work across four teammates. Each person owns a coherent area, reviews connected work, and keeps their assigned documents current.

## Team ownership

| Friend | Role | Documentation ownership | Primary implementation ownership |
| --- | --- | --- | --- |
| 1 — Platform Lead | Backend, database, DevOps | [Architecture](01-architecture.md), [Database](02-database-design.md), [Backend](07-backend-implementation.md), [Environment](10-environment-variables.md), [Deployment](11-deployment-guide.md) | API foundation, MongoDB models, services, middleware, uploads, CI/CD |
| 2 — Product Frontend Lead | UI/UX, client platform | [Frontend UI/UX](06-frontend-ui-ux.md) | Vite app, Tailwind system, layouts, routes, Redux, shared components, responsive and dark mode |
| 3 — Operations Module Lead | Fleet workflows, integrations | [API Reference](03-api-reference.md), [Business Rules](05-business-rules-validation.md) | Vehicle, driver, trip, maintenance, and fuel modules; dispatch transaction rules |
| 4 — Quality & Analytics Lead | Security, finance, release quality | [Authentication & Security](04-authentication-security.md), [Testing Strategy](08-testing-strategy.md), [Installation](09-installation-guide.md), [README](../README.md) | Authentication/RBAC, expenses, reports, dashboards/charts, test automation, release verification |

## Working agreement

- Friend 1 defines API conventions, error contracts, model patterns, and shared environment configuration before feature work starts.
- Friends 2–4 use feature branches and do not modify another friend’s owned area without coordination.
- The owner of a changed feature updates the relevant documentation in the same pull request.
- Every pull request receives one review from the dependent teammate listed below.
- Run linting, relevant tests, and the production build before merging.

## Implementation phases

### Phase 1 — Foundation

| Owner | Deliverable | Dependency / reviewer |
| --- | --- | --- |
| Friend 1 | Monorepo structure, Express bootstrap, Mongo connection, error handling, logging, `.env` template | Review: Friend 4 |
| Friend 2 | Vite app, Tailwind tokens, app shell, router, API client, theme support | Review: Friend 4 |
| Friend 4 | Auth contract, RBAC permission map, test setup, CI quality gate | Depends on Friend 1; review: Friend 3 |
| Friend 3 | Data fixtures and workflow acceptance cases for fleet dispatch | Depends on Friends 1 and 4; review: Friend 2 |

**Phase exit:** a user can sign in, view the protected app shell, and receive standardized API errors.

### Phase 2 — Core operations

| Owner | Deliverable | Dependency / reviewer |
| --- | --- | --- |
| Friend 1 | User, vehicle, driver, trip schemas; audit-log service; transaction helpers | Review: Friend 3 |
| Friend 2 | DataTable, forms, drawers, status badges, vehicle/driver/trip screens | Review: Friend 3 |
| Friend 3 | Vehicle, driver, and trip APIs; create, dispatch, cancel, complete workflows | Depends on Friend 1; review: Friend 4 |
| Friend 4 | Unit/integration coverage for validation, RBAC, and dispatch conflicts | Depends on Friend 3; review: Friend 1 |

**Phase exit:** the team can create assets and safely dispatch/complete a trip with all business rules enforced.

### Phase 3 — Cost and maintenance

| Owner | Deliverable | Dependency / reviewer |
| --- | --- | --- |
| Friend 1 | Maintenance, fuel, expense persistence, indexes, uploads, scheduled alert scaffolding | Review: Friend 3 |
| Friend 2 | Maintenance, fuel, and expense UI flows with mobile behavior | Review: Friend 4 |
| Friend 3 | Maintenance closing rules, fuel calculations, operational API filtering | Depends on Friend 1; review: Friend 2 |
| Friend 4 | Expense controls, cost calculations, document/license expiry test cases | Review: Friend 1 |

**Phase exit:** maintenance blocks dispatch; all fuel and expense records are traceable and filtered.

### Phase 4 — Dashboard, reports, and release

| Owner | Deliverable | Dependency / reviewer |
| --- | --- | --- |
| Friend 1 | Aggregation endpoints, export jobs, health/readiness endpoints, deployment config | Review: Friend 4 |
| Friend 2 | Premium dashboard, charts, report filters/export UX, performance polish | Review: Friend 4 |
| Friend 3 | Data correctness review for fleet metrics and report filters | Review: Friend 1 |
| Friend 4 | CSV/PDF report coverage, E2E smoke suite, accessibility/security review, release checklist | Review: Friend 2 |

**Phase exit:** dashboards agree with source records, reports export correctly, and all release checks pass.

## Daily coordination

1. Each friend posts: completed work, current task, blocker, and API/UI contract changes.
2. Discuss contract changes before changing shared schemas, API response formats, or permissions.
3. Keep a small shared seed dataset so frontend and backend are testable together.
4. Demo one complete user flow at the end of each phase, rather than isolated screens or endpoints.

## First sprint backlog

- Friend 1: scaffold `server`, configuration, error middleware, database connection, and health endpoints.
- Friend 2: scaffold `client`, Tailwind design tokens, sidebar/topbar, routing, and login screen.
- Friend 3: define vehicle/driver/trip request and response examples; prepare dispatch workflow fixtures.
- Friend 4: define permissions, auth test cases, CI commands, and the project setup checklist.

The next integration checkpoint is when the login UI calls the API and a protected dashboard route renders for each role.
