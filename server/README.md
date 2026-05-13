## Server Setup

1. Create a `.env` file with:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/health-tracker
   JWT_SECRET=replace-with-strong-secret
   AI_SERVICE_URL=http://localhost:5001
   ```
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

