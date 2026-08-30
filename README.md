# Civil Connek Web Application & Administrative Portal

[![CI Pipeline](https://github.com/Sunnyday-Spring/civilconnek_web/actions/workflows/ci.yml/badge.svg)](https://github.com/Sunnyday-Spring/civilconnek_web/actions/workflows/ci.yml)

Civil Connek Web Application is an enterprise web solution and administrative management system developed for Civil Connek Co., Ltd. The system provides a public corporate web portal alongside a secure internal administration portal for managing project portfolios, tracking construction project queues, and processing client inquiries.

## System Overview

The system is structured into two primary components:

1. **Public Web Portal**: Provides corporate information, architectural and engineering services overview, interactive project portfolio showcase, real-time construction progress tracking, and client inquiry forms.
2. **Administrative Management Portal (Admin Hub)**: A password-protected administrative backend enabling authorized personnel to manage portfolio projects, adjust construction site queue status and completion percentages, review incoming client inquiries, and manage project images.

---

## Technical Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Storage**: Supabase (PostgreSQL Database & Public Object Storage)
- **Authentication**: Middleware-based Cookie Session Guard
- **Progressive Web App (PWA)**: Web App Manifest for mobile installation

---

## Key Features

### Public Portal
- Dynamic fetching of completed and ongoing construction projects.
- Single-project detail pages with multi-step construction photo galleries.
- Construction Site Queue Tracker showing real-time progress percentages.
- Client inquiry submission saving directly to PostgreSQL database.

### Administrative Portal
- **Dashboard Hub (`/admin`)**: Central portal for quick access to all administration modules.
- **Portfolio Management (`/admin/projects`)**: Create, inspect, and delete project items with multi-file photo uploads.
- **Queue Management (`/admin/queue`)**: Manage construction site queues, operational statuses, and progress completion percentages.
- **Client Inquiries Inbox (`/admin/messages`)**: Review client inquiries, contact numbers, and update resolution statuses.
- **PWA Installation**: Configured Web App Manifest (`/admin-manifest.json`) allowing standalone mobile application installation.

---

## Environment Variables Configuration

To run the application locally or deploy to production, create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
ADMIN_PASSWORD=<your-password>
```

---

## Database Setup Instructions

The database schema and storage policies are defined in `supabase/schema.sql`.

To initialize the database:
1. Open the Supabase Dashboard SQL Editor.
2. Execute the commands provided in `supabase/schema.sql` to create the required tables:
   - `public.projects`
   - `public.project_photos`
   - `public.contact_messages`
   - `public.construction_queue`
   - `storage.buckets` (`project-images`)
3. Verify that Row Level Security (RLS) policies and public storage access policies are applied correctly.

---

## Getting Started

### Installation

Install project dependencies using npm:

```bash
npm install
```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`. The administrative portal is accessible at `http://localhost:3000/admin`.

### Production Build

To construct an optimized production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

---

## License and Copyright

Copyright (c) 2026 Civil Connek Co., Ltd. All rights reserved.
