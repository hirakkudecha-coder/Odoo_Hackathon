# Environment Variables

## Server (`server/.env`)

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/transitops
JWT_ACCESS_SECRET=replace_with_64_plus_random_characters
JWT_REFRESH_SECRET=replace_with_a_different_64_plus_random_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
UPLOAD_MAX_BYTES=5242880
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
LOG_LEVEL=info
```

## Client (`client/.env`)

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=TransitOps
```

Use a secret manager in hosted environments. Rotate JWT and storage credentials without committing values. `COOKIE_SECURE` must be `true` in production.
