# Backend Implementation Guide

## Module pattern

Each domain module contains a model, validator, service, controller, and route definition. Controllers contain no business decisions. Services receive validated input plus actor context, perform authorization-aware business checks, write audit logs, and return serializable results.

## Transaction pattern

Trip dispatch, completion, cancellation, and maintenance status changes use `session.withTransaction`. Conditional updates (`status: available`) protect against concurrent dispatches. On conflict, abort and return `409`; never partially update driver, vehicle, and trip state.

## Jobs and observability

Scheduled jobs flag expiring licenses/documents, upcoming maintenance, and unreconciled expenses. Health endpoints expose liveness and dependency readiness without secrets. Structured JSON logs include timestamp, level, request ID, actor ID, route, and duration. Metrics should track API latency, failed logins, dispatch conflicts, and job failures.

## Uploads and reports

Store upload metadata in `documents`; object storage holds bytes. Generate exports asynchronously for large date ranges, persist a short-lived export record, and authorize download ownership. CSV uses escaped values; PDF uses a server-side template with a generated-at timestamp and filters summary.
