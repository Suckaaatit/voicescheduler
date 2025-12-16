README (paste this section)
🚀 Live Demo
Deployed App URL: https://voicescheduler-production.up.railway.app
Backend Health Check: https://voicescheduler-production.up.railway.app/health
Vapi Webhook Endpoint: https://voicescheduler-production.up.railway.app/vapi/webhook
✅ How to Test the Voice Agent (Deployed)
1) Set up Vapi
In your Vapi Assistant settings:

Tool name: create_calendar_event
Tool Server URL:
https://voicescheduler-production.up.railway.app/vapi/webhook
Tool parameters (JSON schema example):

json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string", "description": "Required for Cal.com bookings" },
    "date": { "type": "string", "description": "ISO date YYYY-MM-DD" },
    "time": { "type": "string", "description": "24hr format HH:MM" },
    "title": { "type": "string" }
  },
  "required": ["name", "email", "date", "time"]
}
2) Use the deployed web app
Open: https://voicescheduler-production.up.railway.app
Enter your Vapi Public Key + Assistant ID in the settings modal.
Start the voice conversation and say something like: “My name is Akash. Schedule a meeting tomorrow at 2:30pm. My email is test@example.com. Title: Vikara Assignment Test.”
Confirm when the assistant repeats the details.
Verify booking created in Cal.com dashboard:
https://app.cal.com/bookings
🧑‍💻 Optional: Run Locally
Prerequisites
Node.js v18+
1) Install
bash
npm install
2) Create .env.local (Cal.com)
env
CAL_API_KEY=cal_live_...
CAL_USERNAME=bull-toru-hvayh5
CAL_EVENT_TYPE_SLUG=my-space
CAL_ATTENDEE_TIMEZONE=Asia/Kolkata
3) Run backend (Terminal 1)
bash
npm start
4) Run frontend (Terminal 2)
bash
npm run dev
Open:

Frontend: http://localhost:5173
Backend health: http://localhost:3000/health
📅 Calendar Integration (How it works)
This project supports Cal.com (primary) and Google Calendar (optional fallback).

Cal.com (Primary)
If CAL_API_KEY is set, the backend uses Cal.com to create a real booking:

Endpoint used: POST https://api.cal.com/v2/bookings
Auth: Authorization: Bearer <CAL_API_KEY>
Required inputs:
name, email, date, time
After success, the backend returns a booking UID and a dashboard link.
Confirm bookings in: https://app.cal.com/bookings
Google Calendar (Fallback)
If Cal.com is not configured, the backend can create Google Calendar events using service account credentials (optional path).
