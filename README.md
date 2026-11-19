# Digital AI Bot

MERN chat application with a React/Vite frontend and Express/MongoDB backend.

## Requirements

- Node.js 20.19+ or 22.12+ and npm
- MongoDB (local or Atlas)
- A Groq API key for AI responses
- SMTP credentials if you want registration welcome emails

## Install and configure

From the repository root, install the root launcher and app dependencies:

```sh
npm install
npm --prefix BotBackend install
npm --prefix BotFrontend install
```

Copy `.env.example` to `.env` in the repository root and fill in `MONGODB_URL`, `JWT_SECRET`, and `GROQ_API_KEY`. Set SMTP values to enable welcome emails; with SMTP unset, registration still works and mail is skipped. Never commit `.env` or put backend secrets in `VITE_*` variables.

## Run locally

```sh
npm run dev
```

This starts the API on port 8000 (or the `PORT` value in `.env`) and Vite on port 5173. The development proxy reads `PORT` from the root `.env` or `BotBackend/.env`; set `VITE_DEV_API_PROXY` only if the backend is at a different address. Open <http://localhost:5173>. For a production frontend hosted on a different origin, set `VITE_API_URL` to the API origin and set the backend `FRONTEND_URL` to the frontend origin. Multiple allowed origins can be comma-separated.

## Build and production start

```sh
npm run build
npm start
```

The frontend output is `BotFrontend/dist`. Deploy that directory to a static host and deploy `BotBackend` as a Node service. The API exposes `/health` for health checks. Configure the backend service to run `npm start` with `BotBackend` as its root directory (or run `npm start` from this repository root). Configure static host rewrites so `/api/*` reaches the backend, or build the frontend with `VITE_API_URL` set to the deployed backend URL.

## Deploy the backend (Render example)

1. Push this repository to GitHub.
2. In Render, create a **Web Service** from the repository.
3. Set the root directory to `BotBackend`, build command to `npm install`, and start command to `npm start`.
4. Add `PORT` if required by the platform, `MONGODB_URL`, a strong unique `JWT_SECRET`, `GROQ_API_KEY`, and `FRONTEND_URL` (the deployed frontend origin).
5. Add SMTP variables if email is enabled. Confirm the service is healthy at `/health`.

## Deploy the frontend (Vercel example)

1. Import the same GitHub repository into Vercel.
2. Set the project root directory to `BotFrontend`.
3. Use `npm install` as the install command and `npm run build` as the build command; Vercel detects `dist` as the output directory.
4. Set `VITE_API_URL` to the backend origin, without a trailing slash, then redeploy. `VITE_*` values are public and must not contain secrets.
5. Set the backend `FRONTEND_URL` to the deployed frontend origin. If the frontend uses a custom domain, update it there too.

Other hosts can use the same settings: backend Node service from `BotBackend`, frontend static build from `BotFrontend` with output directory `dist`. Ensure the host forwards API requests or set `VITE_API_URL` before building.

## Push to GitHub

Create an empty GitHub repository, then from the project root run:

```sh
git init
git add .
git commit -m "Prepare MERN app for production"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repository>.git
git push -u origin main
```

If this folder is already connected to Git, keep its existing remote and push the appropriate branch instead of running `git init` or adding another remote.

## Required manual configuration

- MongoDB connection string and Atlas network access/database user (if using Atlas).
- Groq API key and a strong random JWT secret.
- SMTP host, port, username, password, and verified sender if welcome email is needed.
- GitHub repository and hosting accounts, deployed frontend/backend URLs, and matching `FRONTEND_URL` / `VITE_API_URL` values.
