# Health Tracker Client

## Setup

1. Install dependencies: `npm install`
2. Create a `.env` (or `.env.local`) file with the API base URL if it differs from the default:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
3. Start the dev server: `npm run dev`

Login and registration rely on the Node server responding with both a JWT and the serialized user. The client stores both in `localStorage` so dashboard/profile pages can render immediately without an additional fetch. Use the sidebar links after authentication to navigate between patient and doctor experiences.
