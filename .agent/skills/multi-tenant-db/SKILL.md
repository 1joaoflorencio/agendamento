# Database and Multi-Tenant Architecture Guidelines

## 1. Context and Stack
This is a multi-tenant SaaS focused on scheduling.
Mandatory tech stack: Next.js (App Router), Prisma ORM, and Supabase (PostgreSQL).

## 2. Golden Rule: Tenant Isolation (Multi-tenant)
- The system serves multiple businesses. Data MUST NEVER mix.
- EVERY database query (findMany, findUnique, update, delete) made via Prisma MUST strictly include the `tenantId` clause within the `where` object.
- Mandatory query example: `where: { tenantId: user.tenantId, ...otherFilters }`.
- If you generate query code that does not filter by `tenantId`, consider it a critical security flaw.

## 3. Next.js and Supabase Patterns
- For data mutations (creating appointments, registering services), strictly use **Server Actions** (`"use server"`).
- The Supabase client must be instantiated using `@supabase/ssr` to ensure proper cookie and session management on the server.
- Error handling: Always wrap Prisma calls in `try/catch` blocks and return a standardized object to the frontend: `{ success: boolean, data?: any, error?: string }`.

## 4. Core Logic: Scheduling System
- Before inserting a new appointment (`prisma.appointment.create`), you MUST generate code to check for time collisions.
- A collision occurs if there is already an appointment with `status !== 'CANCELLED'` in the exact or overlapping `startTime` and `endTime` interval for the same `professionalId` and `tenantId`.

## 5. Available Tools
Whenever you need to understand the current database structure before writing code, execute the local script `check-schema.sh` to read the Prisma models.