# Next.js App Router and React Architecture Guidelines

## 1. Core Architecture
- We strictly use the **Next.js App Router** (`app/` directory). Do not use the `pages/` directory.
- Default to **React Server Components (RSC)**. 
- Only use the `"use client"` directive when strictly necessary (e.g., state management with `useState`, lifecycle hooks with `useEffect`, or browser APIs). Push the `"use client"` directive as far down the component tree as possible.

## 2. Data Fetching and Mutations
- For reading data, fetch directly inside Server Components using `async/await`.
- For mutating data (forms, buttons that change state), strictly use **Server Actions**.
- Always use `useTransition` to handle loading states when calling Server Actions from Client Components.
- After a successful mutation, always use `revalidatePath` to update the UI with fresh data.

## 3. UI and Styling
- We use Tailwind CSS for all styling.
- Ensure components are fully responsive (mobile-first approach).
- Keep components modular and reusable. Separate complex business logic from UI presentation.