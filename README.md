🎙️ Voice Scheduler

A voice-controlled scheduling assistant that uses Vapi to collect meeting details via conversation and creates bookings in Cal.com, with an optional Google Calendar fallback.

🚀 Live Demo

Deployed App
https://voicescheduler-production.up.railway.app

Backend Health Check
https://voicescheduler-production.up.railway.app/health

Vapi Webhook Endpoint
https://voicescheduler-production.up.railway.app/vapi/webhook

✅ How to Test the Voice Agent (Deployed)
1️⃣ Configure Vapi Assistant

In your Vapi Assistant settings:

Tool Name
create_calendar_event

Tool Server URL
https://voicescheduler-production.up.railway.app/vapi/webhook

Tool Parameters (JSON Schema)
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
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
    "title": {
      "type": "string"
    }
  },
  "required": ["name", "email", "date", "time"]
}

2️⃣ Use the Deployed Web App

Open the app
👉 https://voicescheduler-production.up.railway.app

Enter your Vapi Public Key and Assistant ID in the Settings modal.

Start the voice conversation and say:

“My name is Akash. Schedule a meeting tomorrow at 2:30 PM.
My email is test@example.com
.
Title: Vikara Assignment Test.”

Confirm the details when the assistant repeats them.

Verify the booking in Cal.com:
👉 https://app.cal.com/bookings

🧑‍💻 Run Locally (Optional)
Prerequisites

Node.js v18+

1️⃣ Install Dependencies
npm install

2️⃣ Create .env.local (Cal.com Configuration)
CAL_API_KEY=cal_live_...
CAL_USERNAME=bull-toru-hvayh5
CAL_EVENT_TYPE_SLUG=my-space
CAL_ATTENDEE_TIMEZONE=Asia/Kolkata

3️⃣ Start Backend (Terminal 1)
npm start

4️⃣ Start Frontend (Terminal 2)
npm run dev

🌐 Local URLs

Frontend
http://localhost:5173

Backend Health Check
http://localhost:3000/health

📅 Calendar Integration

This project supports Cal.com (Primary) and Google Calendar (Optional Fallback).

✅ Cal.com (Primary)

If CAL_API_KEY is configured, the backend creates real bookings via Cal.com.

Endpoint

POST https://api.cal.com/v2/bookings


Authentication

Authorization: Bearer <CAL_API_KEY>


Required Fields

name, email, date, time


After a successful booking:

A booking UID is returned

A Cal.com dashboard link is provided

View bookings at:
👉 https://app.cal.com/bookings

🔄 Google Calendar (Fallback)

If Cal.com is not configured:

The backend can create Google Calendar events

Uses Service Account credentials

Acts as a fallback scheduling mechanism

🛠️ Tech Stack

Frontend: React + Vite

Backend: Node.js + Express

Voice AI: Vapi

Scheduling: Cal.com API

Deployment: Railway

📄 License

MIT License

💡 Notes

Designed for voice-first scheduling

Optimized for Vapi tool calling

Production-ready webhook handling
