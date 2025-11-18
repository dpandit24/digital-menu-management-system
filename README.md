## Digital Menu Management System (T3 + Prisma + PostgreSQL + Tailwind + tRPC)

This project lets restaurant owners manage multiple restaurants and digital menus, and share them via QR codes or links.

### Tech
- Next.js 14 (App Router) + TypeScript
- Prisma ORM
- PostgreSQL (use Neon)
- tRPC (minimal health route wired)
- Tailwind CSS
- shadcn/ui-style primitives (vendored minimal components)
- JWT cookie auth with email one-time-code (no NextAuth)

### Getting Started
1. Install deps:
   ```bash
   npm install
   ```
2. Create a PostgreSQL database (e.g., Neon) and set env vars in `.env`:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
   JWT_SECRET=replace-with-strong-secret
   # Optional: SMTP for sending codes (otherwise they log to server console)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=user
   SMTP_PASSWORD=pass
   EMAIL_FROM=\"Menu System <no-reply@example.com>\"
   ```
3. Generate Prisma Client & push schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

### Core URLs
- `/signin`: email OTP login
- `/admin`: list restaurants, create new
- `/admin/restaurants/:id`: manage categories and dishes, get QR and share link
- `/r/:slug`: public menu with sticky category header and floating menu

### Notes
- First sign-in creates a bare user; complete profile at `/admin/profile`.
- Email codes are sent via SMTP if configured, otherwise printed to server logs for development.
- For deployment to Vercel, set env vars, run `prisma generate`, and enable the default build command.

