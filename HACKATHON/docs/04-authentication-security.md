# Authentication and Security

## Identity model

Passwords use bcrypt with a cost factor of at least 12. Login returns a short-lived access JWT (15 minutes) and stores a rotating refresh token (7–30 days) in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie. Store only a hashed refresh-token identifier in MongoDB; revoke it on logout, password reset, role change, and suspicious reuse.

## RBAC matrix

| Role | Primary permissions |
| --- | --- |
| Admin | Full configuration, users, all records, exports |
| Fleet Manager | Vehicles, maintenance, fuel, fleet dashboards |
| Dispatcher | Drivers (read), vehicles (read), trips (manage) |
| Driver | Own assigned trips, status, and documents |
| Safety Officer | Drivers, licenses, safety review, incidents |
| Financial Analyst | Expenses, fuel, financial dashboards, reports |

Authorization uses named permissions (for example `trip:dispatch`) rather than route-specific role conditionals.

## Controls

- Helmet with a reviewed CSP, strict CORS allowlist, request size limits, and rate limits for authentication and exports.
- Express Validator sanitizes and validates every request; Mongoose validates persistence boundaries.
- Multer accepts only allowlisted MIME types and size limits; files are virus-scanned and stored outside the application filesystem.
- Log request IDs and audit events, never passwords, tokens, or full sensitive documents.
- Enforce TLS, secret rotation, database least privilege, backups, and dependency scanning in CI.
