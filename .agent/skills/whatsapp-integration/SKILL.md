# WhatsApp API Integration Guidelines

## 1. Context and Rules
- This module is responsible for sending automated appointment confirmations, reminders, and cancellations to clients via WhatsApp.
- The primary use case is scheduling for beauty and aesthetics services (salons, clinics).
- **Security Rule:** NEVER hardcode API tokens or endpoint URLs. Always use environment variables (e.g., `process.env.WHATSAPP_API_URL` and `process.env.WHATSAPP_API_TOKEN`).

## 2. Message Formatting
- Format messages professionally, keeping the aesthetics and beauty context in mind.
- Use standard WhatsApp markdown: `*bold*` for emphasis (like Date and Time), `_italic_` for subtle notes.
- Always include the Service Name, Professional Name, Date, Time, and a polite greeting.
- Example structure: "Hello [Name], your appointment for [Service] with [Professional] is confirmed for *[Date]* at *[Time]*. We look forward to seeing you!"

## 3. Integration Flow
- The WhatsApp trigger must be completely decoupled from the main Prisma database transaction to prevent blocking the UI.
- Wrap the API call in a `try/catch` block. If the WhatsApp message fails, log the error but DO NOT crash the appointment creation process.

## 4. Available Tools
- To test the API connection locally, use the provided `test-message.sh` script.