Voice Scheduler

A voice-controlled scheduling assistant that books meetings via Cal.com using Vapi voice agents, with an optional Google Calendar fallback.

🚀 Live Demo

Deployed App:
https://voicescheduler-production.up.railway.app

Backend Health Check:
https://voicescheduler-production.up.railway.app/health

Vapi Webhook Endpoint:
https://voicescheduler-production.up.railway.app/vapi/webhook

✅ How to Test the Voice Agent (Deployed)
1️⃣ Set Up Vapi

In your Vapi Assistant settings:

Tool Name: create_calendar_event

Tool Server URL:

https://voicescheduler-production.up.railway.app/vapi/webhook


Tool Parameters (JSON Schema):

{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": {
      "type": "string",
      "description": "Required for Cal.com bookings"
    },
    "date": {
      "type": "string",
      "description": "ISO date format (YYYY-MM-DD)"
    },
    "time": {
      "type": "string",
      "description": "24-hour format (HH:MM)"
    },
    "title": { "type": "string" }
  },
  "required": ["name", "email", "date", "time"]
}

2️⃣ Use the Deployed Web App

Open:
👉 https://voicescheduler-production.up.railway.app

Enter your Vapi Public Key and Assistant ID in the Settings modal.

Start the voice conversation and say something like:

“My name is Akash. Schedule a meeting tomorrow at 2:30 PM.
My email is test@example.com
.
Title: Vikara Assignment Test.”

Confirm the details when the assistant repeats them.

Verify the booking in the Cal.com dashboard:
👉 https://app.cal.com/bookings

🧑‍💻 Optional: Run Locally
Prerequisites

Node.js v18+

1️⃣ Install Dependencies
npm install

2️⃣ Create .env.local (Cal.com Configuration)
CAL_API_KEY=cal_live_...
CAL_USERNAME=bull-toru-hvayh5
CAL_EVENT_TYPE_SLUG=my-space
CAL_ATTENDEE_TIMEZONE=Asia/Kolkata

3️⃣ Run Backend (Terminal 1)
npm start

4️⃣ Run Frontend (Terminal 2)
npm run dev

🌐 Local URLs

Frontend: http://localhost:5173

Backend Health Check: http://localhost:3000/health

📅 Calendar Integration (How It Works)

This project supports Cal.com (Primary) with an optional Google Calendar fallback.

✅ Cal.com (Primary)

If CAL_API_KEY is configured, the backend creates real bookings using Cal.com.

API Endpoint:

POST https://api.cal.com/v2/bookings


Authentication:

Authorization: Bearer <CAL_API_KEY>


Required Inputs:

name

email

date

time

After a successful booking:

The backend returns a booking UID

A Cal.com dashboard link is provided

📍 View bookings here:
👉 https://app.cal.com/bookings

🔄 Google Calendar (Fallback)

If Cal.com is not configured:

The backend can optionally create Google Calendar events

Uses Service Account credentials

Acts as a fallback scheduling mechanism

🛠️ Tech Stack

Frontend: Vite + React

Backend: Node.js + Express

Voice AI: Vapi

Scheduling: Cal.com API

Deployment: Railway
