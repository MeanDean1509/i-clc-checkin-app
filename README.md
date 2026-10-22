# I-CLC CheckIn PWA

Next.js PWA cho luồng chấm công I-CLC. Ứng dụng dùng Next.js làm lớp proxy cùng-domain tới CheckIn API và lưu access token trong cookie `HttpOnly`.

## Requirements

- Node.js 22+ and npm
- Docker Desktop (optional, for container use)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API configuration

Mặc định proxy gọi `https://checkin.ib.edu.vn/api`. Để dùng API khác, tạo file `.env.local`:

```bash
CHECKIN_API_URL=https://your-api.example.com/api
CHECKIN_SESSION_SECRET=replace-with-a-long-random-production-secret
```

Trình duyệt chỉ gọi các endpoint nội bộ như `/api/auth/login`; Next.js mới gọi tiếp tới API bên ngoài. Vì vậy API không cần mở CORS cho domain PWA.

## Production build

```bash
npm run build
npm run start
```

The app listens on port `3000`. `next.config.ts` enables `output: "standalone"` for the production container.

## Run with Docker Compose

```bash
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000). Stop it with `docker compose down`.

## Install as a PWA

- **Android:** open the site in Chrome, then choose **Install app** or **Add to Home screen**.
- **iOS:** open the site in Safari, select **Share**, then **Add to Home Screen**.

PWA installation requires a secure context: HTTPS in production or `localhost` during local development. The service worker caches the application shell after its first load.
