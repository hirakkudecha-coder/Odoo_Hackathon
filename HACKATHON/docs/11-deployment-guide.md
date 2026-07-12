# Deployment Guide

## Production topology

Deploy the React build to a CDN/static host and the Express API as stateless containers behind a TLS reverse proxy or load balancer. Use MongoDB Atlas or a replica set with private networking. Store documents in private object storage and expose time-limited signed URLs.

## Release checklist

1. Provision production secrets, CORS origins, database user, backups, and storage lifecycle rules.
2. Run migrations/index creation safely and seed only required administrative configuration.
3. Build immutable client and server artifacts; run the full CI quality gate.
4. Deploy API with health checks, then client with the matching API configuration.
5. Verify login, role restrictions, dispatch transaction, upload, report export, and rollback procedure.

## Operations

Enable database point-in-time recovery, daily backup verification, uptime checks, error tracking, centralized logs, and alerts for elevated 5xx rate, job failures, storage errors, and database capacity. Roll back by redeploying the prior immutable artifact; avoid database-destructive rollback scripts.

Review access, refresh-token sessions, secrets, dependency vulnerabilities, and document retention on a scheduled cadence.
