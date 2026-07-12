# TransitOps

Enterprise SaaS platform for fleet, driver, trip, maintenance, fuel, expense, and reporting operations. TransitOps is designed as a multi-role MERN application with operational safeguards built into every workflow.

## Documentation

| Document | Purpose |
| --- | --- |
| [Four-friend team plan](docs/00-team-work-plan.md) | Ownership, phases, handoffs, and first sprint |
| [Architecture](docs/01-architecture.md) | System design, folder layout, and core flows |
| [Database](docs/02-database-design.md) | Collections, indexes, references, and ER diagram |
| [API](docs/03-api-reference.md) | REST endpoint contract |
| [Authentication & security](docs/04-authentication-security.md) | JWT, RBAC, and security controls |
| [Business rules](docs/05-business-rules-validation.md) | Domain constraints and validation ownership |
| [Frontend UX](docs/06-frontend-ui-ux.md) | Screens, component system, responsive behavior |
| [Backend implementation](docs/07-backend-implementation.md) | Layering and transaction patterns |
| [Testing](docs/08-testing-strategy.md) | Test plan and acceptance criteria |
| [Installation](docs/09-installation-guide.md) | Local development setup |
| [Environment variables](docs/10-environment-variables.md) | Required configuration |
| [Deployment](docs/11-deployment-guide.md) | Production rollout and operations |

## Roles

Admin, Fleet Manager, Dispatcher, Driver, Safety Officer, and Financial Analyst. Permissions are enforced by the API; hiding a UI action never substitutes for authorization.

## Core stack

React 19 + Vite, Tailwind CSS, Redux Toolkit, React Router, React Hook Form, Chart.js, Node.js, Express, MongoDB, Mongoose, JWT, and Multer.

## Quick start

Follow [the installation guide](docs/09-installation-guide.md), copy the environment templates described in [environment variables](docs/10-environment-variables.md), then run the client and API in separate terminals.

## Product principles

- Prevent invalid dispatches instead of repairing them later.
- Keep operational history auditable and soft-delete business records.
- Make current fleet status obvious at a glance.
- Design for desktop operations first while retaining strong mobile usability.
