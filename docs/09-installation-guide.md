# Installation Guide

## Prerequisites

Node.js 20 LTS or later, npm 10+, MongoDB 7+ (or MongoDB Atlas), and an S3-compatible object-storage provider for production uploads.

## Setup

1. Create `client` with Vite React and `server` with Express according to [the architecture](01-architecture.md).
2. Install the frontend packages: React Router, Redux Toolkit, Axios, React Hook Form, Framer Motion, React Icons/Lucide, Chart.js, react-chartjs-2, react-hot-toast, Tailwind, and a table/date-picker library.
3. Install API packages: Express, Mongoose, jsonwebtoken, bcrypt, multer, express-validator, dotenv, helmet, cors, and an Express rate limiter.
4. Create `server/.env` and `client/.env` from the values in [environment variables](10-environment-variables.md).
5. Start MongoDB, then run the API and client development commands from their respective folders.
6. Visit the Vite URL, create or seed an admin user, and confirm `/api/v1/health` is ready.

## Development conventions

Use ESLint and Prettier, conventional commits, feature branches, and environment-specific configuration. Never commit `.env`, access tokens, uploads, or production database exports.
