# Atak Gaye Backend — Setup Guide (Beginner Friendly)

## What you need first
1. **Node.js** installed → check with `node -v` in terminal
2. **MongoDB** installed locally, OR a free MongoDB Atlas cloud account (easier — no install)
   - Free cloud option: https://www.mongodb.com/cloud/atlas/register
   - If using Atlas, copy your connection string into `.env` as `MONGO_URI`

## Step-by-step

### 1. Install dependencies
Open terminal inside the `backend` folder and run:
```
npm install
```
This downloads express, mongoose, etc. into `node_modules/`.

### 2. Set up your `.env`
Already created for you with defaults. If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### 3. Add sample helper data
```
npm run seed
```
This adds 4 test helpers (Ravi, Imran, Sanjay, Deepak) to your database — same ones from your screenshots.

### 4. Start the server
```
npm run dev
```
You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

### 5. Test it
Open browser: http://localhost:5000 → should show a "chal raha hai" message.

Test the matching API using Postman, or curl in terminal:
```bash
curl -X POST http://localhost:5000/api/match \
  -H "Content-Type: application/json" \
  -d '{"lat": 26.8550, "lng": 80.9950, "serviceType": "fuel"}'
```
`serviceType` can be: `fuel`, `mechanic`, `puncture`, or `towing`.

You'll get back a ranked list of helpers with `matchPercent` — exactly what your frontend's "AI Choice" card needs.

## Connecting your frontend
In your `index.html` (or its JS file), replace any dummy/hardcoded helper data with a `fetch` call:
```javascript
const response = await fetch('http://localhost:5000/api/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ lat: userLat, lng: userLng, serviceType: 'fuel' })
});
const data = await response.json();
console.log(data.bestMatch); // this is your "AI Choice" helper
```

## What's next (once this works)
- Add a `User` model + login/signup (JWT auth)
- Add a `Request` model to track each SOS/help request's status (pending → accepted → completed)
- Add real-time updates with Socket.io for the "Ravi aapki taraf aa raha hai" live tracking screen
- Deploy backend for free on Render.com, and use MongoDB Atlas for the database

Ask me when you're ready for any of these — we'll do them one at a time, same as this.
