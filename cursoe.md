# Backend — context for Cursor / AI assistants

This folder is a **Node.js (ES modules)** API for the AI video app: users, template videos, image-to-video generation via **Kie.ai**, storage on **Backblaze B2**, and persistence in **MongoDB** (Mongoose).

## Stack

- **Runtime:** Node, `"type": "module"` in `package.json`
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose (`db.js`, `models.js`)
- **Uploads:** Multer (memory storage, 200 MB limit) — `utils/upload.js`
- **Object storage:** Backblaze B2 — `utils/backblaze.js`, used from `utils/helper.js` and `controllers/video.js`
- **Video generation:** Kie.ai jobs API — `utils/kie.js`; callbacks hit `POST /webhook-callback` — `utils/webhook.js`
- **Docs:** Swagger UI at `/api-docs` (OpenAPI spec built from `index.js` via swagger-jsdoc)
- **Deploy:** `vercel.json` builds `index.js` with `@vercel/node`

## Entry and layout

| Path | Role |
|------|------|
| `index.js` | Express app, routes, static `public/`, Swagger, server listen |
| `db.js` | `connectDB()` — MongoDB connection |
| `models.js` | Schemas: `User`, `Video`, `VideoRequest` |
| `controllers/user.js` | User CRUD-ish + credits |
| `controllers/video.js` | List videos (grouped by heading), upload template video to B2 + DB |
| `controllers/videoRequest.js` | User’s generation requests; start Kie job from image + template video |
| `utils/upload.js` | Multer instance |
| `utils/backblaze.js` | B2 client + `initB2()` |
| `utils/helper.js` | `convertUrl`, `uploadImageToB2`, `targetVideoDetails` (loads `Video` by id) |
| `utils/kie.js` | `kieGenerator`, `videoByTaskId` |
| `utils/webhook.js` | `updateDataByHook` — updates `VideoRequest` when Kie calls back |

## HTTP routes (summary)

- `GET /` — health text: “API Running”
- `POST /api/users` — create user (body); returns existing user if email already exists
- `POST /api/users/get` — intended “get user by email”; **note:** handler reads `email` from `req.params`, but the route has no `:email` segment — callers may need to align with `req.body` or change the route
- `POST /api/users/add-credits` — body: `userId`, `amount`
- `POST /api/users/remove-credits` — body: `userId`, `amount`
- `GET /api/videos` — all videos, grouped into `sections` by `heading`
- `GET /api/users/:userId/video-requests` — `userId` is the **user’s email** (stored as `user_id` on `VideoRequest`)
- `POST /api/generate-video` — multipart: field `image` (file); body fields `id` (template `Video` `_id`), `email`; uploads image to B2, calls Kie, creates `VideoRequest` with `status: "processing"`
- `POST /api/upload-video` — multipart: field `video` (file); body: `heading`, `title`, `description`, `prompt`, `duration_seconds`; uploads to B2 under `template-videos/`, saves `Video`
- `POST /webhook-callback` — Kie callback; body shape includes `code`, `msg`, `data` with `taskId` / `resultJson`; updates matching `VideoRequest` by `kie_task_id`

## Data models (high level)

- **User:** `name`, `email` (unique), `photo`, `idToken`, `credits` (≥ 0)
- **Video:** template catalog — `heading`, `title`, `video_url`, `video_gif`, `description`, `prompt`, `duration_seconds`
- **VideoRequest:** per-generation job — `user_id` (email string), `target_video_id`, `image_url`, `kie_task_id`, `status` (`pending` \| `processing` \| `completed` \| `failed`), `output_video_url`

## Environment and secrets

- **Port:** `process.env.PORT` or **5000** (local); Swagger server URL in code is `http://localhost:5000`.
- **dotenv** is loaded in `index.js`, but **MongoDB URI, B2 credentials, and Kie bearer token are currently hardcoded** in `db.js`, `utils/backblaze.js`, and `utils/kie.js`. For production and for this repo’s safety, they should be moved to environment variables and rotated if ever exposed.

## Run locally

```bash
cd backend
npm install
node index.js
```

There are no `npm` scripts defined in `package.json`; the process is started with `node index.js`.

## Related app

The React Native client lives under `../dk_video_ai` in this monorepo; it should point its API base URL at wherever this backend is hosted (e.g. local `http://<host>:5000` or the Vercel deployment).
