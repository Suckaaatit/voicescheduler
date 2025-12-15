# Voice Scheduling Agent - Setup Guide

Follow these steps exactly to get the agent running locally.

## 1. Calendar Provider Setup (Pick one)

### Option A (Recommended): Cal.com (easiest)

1. Create a Cal.com account.
2. Create an Event Type (e.g. 30-min meeting).
3. Generate an API key in Cal.com settings.
4. Note the **Event Type ID**.

You will set these env vars:

```env
CAL_API_KEY=cal_live_...
CAL_EVENT_TYPE_ID=123
CAL_ATTENDEE_TIMEZONE=Asia/Kolkata
```

### Option B (Fallback): Google Cloud (Google Calendar)

1. **Create Project:** Go to [Google Cloud Console](https://console.cloud.google.com/).
2. **Enable API:** Search for **"Google Calendar API"** -> Click **Enable**.
3. **Service Account:**
   - Go to **IAM & Admin** -> **Service Accounts**.
   - Create New -> Name it `voice-bot`.
   - Click the new account -> **Keys** tab -> **Add Key** -> **JSON**.
   - **Download** the file.
4. **Share Calendar (Crucial):**
   - Open [Google Calendar](https://calendar.google.com/).
   - Go to **Settings and sharing** for your main calendar.
   - **Share with specific people** -> Add the `client_email` from your downloaded JSON file.
   - **Permission:** Select **"Make changes to events"**.

## 2. Project Configuration
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Create .env File:**
   - Create a file named `.env` in the root folder.
   - Add the following variables:
     ```env
     PORT=3000
     # Cal.com (recommended)
     CAL_API_KEY=cal_live_...
     CAL_EVENT_TYPE_ID=123
     CAL_ATTENDEE_TIMEZONE=Asia/Kolkata

     # Google Calendar (fallback)
     GOOGLE_CALENDAR_ID=your-email@gmail.com
     # Paste your entire service account JSON here (single line JSON)
     # GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
     ```
   - If using Google Calendar fallback, paste the content of your Google JSON key into `GOOGLE_CREDENTIALS_JSON`.
   - If using Cal.com, no Google setup is needed.

## 3. Expose Server (Ngrok)
Vapi needs to talk to your local computer. We use Ngrok for this.
1. Run the server:
   ```bash
   npm start
   ```
2. In a new terminal, run:
   ```bash
   npx ngrok http 3000
   ```
3. Copy the **Forwarding URL** (e.g., `https://xyz.ngrok-free.app`).

## 4. Vapi.ai Dashboard Setup
1. **Create Assistant:** Select `Mistral` or `GPT-4` model.
2. **First Message:** Set to: "Hi, I can help you schedule a meeting. What day works for you?" (Important so the bot talks first).
3. **Add Tool:**
   - Name: `create_calendar_event`
   - Description: `Schedules a meeting.`
   - **Server URL:** `<YOUR_NGROK_URL>/vapi/webhook`  (Don't forget `/vapi/webhook` at the end!)
   - **Parameters Schema:**
     ```json
     {
       "type": "object",
       "properties": {
         "name": { "type": "string" },
         "email": { "type": "string", "description": "Required for Cal.com bookings" },
         "title": { "type": "string" },
         "date": { "type": "string", "description": "YYYY-MM-DD" },
         "time": { "type": "string", "description": "HH:MM" }
       },
       "required": ["name", "email", "date", "time"]
     }
     ```

## 5. Run the Frontend
1. Open `http://localhost:5173` (or whatever your Vite/React port is).
2. Click the **Settings (Gear)** icon.
3. Paste your **Vapi Public Key** and **Assistant ID**.
4. Start talking!
