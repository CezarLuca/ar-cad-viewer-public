# AR CAD Viewer

## Overview

AR CAD Viewer is an application that combines augmented reality with CAD model viewing capabilities. It allows users to view and interact with 3D CAD models, with an admin dashboard for managing users and models.

## Features

-   **3D Model Rendering**: View and interact with 3D CAD models in the browser
-   **Augmented Reality Support**: Experience CAD models in AR environment
-   **User Management**: Admins can view, sort, and delete users
-   **Model Management**: Admins and users can view, sort, and delete models
-   **Responsive Design**: Adapts to different device sizes for optimal viewing experience
-   **Expandable UI Elements**: Interactive UI with expandable components for additional information

## Technologies

-   Next.js
-   Three.js/React Three Fiber (for 3D rendering)
-   GLTF
-   WebXR Image Tracking
-   TypeScript
-   Tailwind CSS

## Project Structure

The structure below is a typical layout for a Next.js (App Router) project with AR and 3D rendering. Adjust paths to match your repo.

```
ar-cad-viewer-public/
├─ app/                          # Next.js App Router
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ api/                       # Route handlers (server actions)
│  │  └─ ...
│  └─ (routes)/
│     ├─ dashboard/
│     ├─ admin/
│     └─ models/
├─ components/
│  ├─ ar/                        # AR-specific components
│  ├─ three/                     # R3F/Three.js viewers and helpers
│  └─ ui/                        # Reusable UI components
├─ lib/
│  ├─ auth/                      # Auth (e.g., NextAuth) config/helpers
│  ├─ db.ts                      # Database client
│  ├─ blob.ts                    # Vercel Blob helpers
│  └─ utils/                     # Utilities, hooks, validators
├─ public/
│  ├─ models/                    # GLTF/GLB assets
│  ├─ images/
│  └─ xr-markers/                # WebXR image tracking markers
├─ styles/
│  └─ globals.css
├─ types/
│  └─ index.d.ts
├─ scripts/
│  └─ seed.ts
├─ .env.local                    # Local env vars (not committed)
├─ next.config.mjs
├─ tailwind.config.ts
├─ postcss.config.js
├─ tsconfig.json
├─ package.json
└─ README.md
```

## Installation

1. Clone the repository:
    ```
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```
    cd ar-cad-viewer-public
    ```
3. Install the dependencies:
    ```
    npm install
    ```
4. Create a `.env.local` file with the required environment variables (see the example below).

## Environment Variables

Create a `.env.local` file in the project root:

```
# Database (PostgreSQL over SSL)
NEON_DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>/<DBNAME>?sslmode=require

# File storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_<your_token_here>

# Auth
NEXTAUTH_SECRET=<generate_a_strong_random_secret>

# Email (Nodemailer)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@example.com
EMAIL_SERVER_PASSWORD=<your_app_password>
EMAIL_FROM=your_email@example.com

# Public base URL (used in emails/links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Notes:

-   Use an app password for Gmail (not your regular account password).
-   Do not commit `.env.local`. Keep secrets out of version control.
-   Set these variables in your hosting provider for production.

## Usage

To start the development server, run:

```
npm run dev
```

Visit `http://localhost:3000` in your browser to access the application.

For AR features, ensure you're using a compatible device and browser with AR capabilities (WebXR).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
