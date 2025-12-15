# Voice Scheduling Agent

A real-time voice assistant capable of scheduling Google Calendar events via natural conversation. Built with **Vapi**, **Mistral AI** (via Vapi), **Node.js**, and **React**.

## 🚀 Live Demo

**Deployed App URL**: [INSERT_YOUR_RAILWAY_URL_HERE]  
**Agent Public Link**: [INSERT_VAPI_PUBLIC_LINK_IF_AVAILABLE]

## 🛠 Tech Stack

- **Voice Engine**: Vapi.ai
- **LLM**: Mistral (configured in Vapi)
- **Frontend**: React + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express
- **Integrations**: Cal.com API (primary) / Google Calendar API (fallback)

## ✨ Features

- **Conversational Intake**: Asks for Name, Date, Time, and Meeting Title.
- **Real-time Confirmation**: Repeats details back to the user for verification.
- **Calendar Integration**: Automatically creates events in a real Google Calendar.
- **Modern UI**: Visualizes voice activity and connection status.

## 📅 Calendar Integration (How it works)

This project supports **two providers**:

- **Cal.com (recommended / easiest)**: API-key based booking creation.
- **Google Calendar (fallback)**: Service account based event creation.

If `CAL_API_KEY` is set, the backend will use **Cal.com**. Otherwise it falls back to **Google Calendar**.

### Cal.com (recommended)

#### Required env vars

```env
CAL_API_KEY=cal_live_...
CAL_EVENT_TYPE_ID=123
CAL_ATTENDEE_TIMEZONE=Asia/Kolkata
```

#### Notes

- Cal.com booking creation requires an attendee **email**.
- The backend creates a booking via `POST https://api.cal.com/v2/bookings` and returns a booking link.

### Google Calendar (fallback)

This project uses the **Google Calendar API** from the backend (`server.js`) to create events when Vapi triggers the tool call `create_calendar_event`.

### Authentication model

- **Auth type**: Google **Service Account** (JWT / server-to-server).
- **Where auth runs**: Only on the backend. The frontend never talks to Google directly.

The backend supports 3 credential strategies (in this order):

1. **`GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY`**
   - Recommended for hosted deployments.
   - `GOOGLE_PRIVATE_KEY` must preserve newlines (common fix: store with `\n` and backend converts it).
2. **`GOOGLE_CREDENTIALS_JSON`**
   - Paste your full downloaded service-account JSON as a string.
3. **Application Default Credentials (ADC)**
   - Useful if you set `GOOGLE_APPLICATION_CREDENTIALS` to a JSON file path locally.

### Required Calendar sharing (most common failure)

Even if auth is correct, Google will return **403** unless you share the target calendar with the service account.

- Go to Google Calendar -> **Settings and sharing** for the calendar you want to write to.
- Share it with the **service account email** (`client_email`) and grant **“Make changes to events”**.

### Scopes

The backend requests:

- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

### Event creation behavior

- Tool arguments expected: `name`, `date` (`YYYY-MM-DD`), `time` (`HH:MM` 24h), optional `title`.
- If using **Cal.com**, `email` is required.
- Events default to **30 minutes**.
- Optional: You can pass `email` to create an attendee invite.
  - If you don’t provide `email`, an event is still created, but no attendee invite is added.

### Common errors & fixes

- **403 Forbidden**: Calendar not shared with the service account email (most common).
- **404 Not Found**: Wrong `GOOGLE_CALENDAR_ID` (or the calendar doesn’t exist / isn’t accessible).
- **Invalid date/time format**: Ensure the assistant/tool outputs `YYYY-MM-DD` and `HH:MM`.

## 📦 Installation & Local Setup

### 1. Prerequisites
- Node.js (v18+)
- A Google Cloud Service Account with Calendar API enabled.
- Vapi.ai Account.

### 2. Backend Setup
1. Clone the repo.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables in `.env`:
   ```env
   PORT=3000
   
   # Option A: JSON String (Copy full content of service-account.json)
   # GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}

   # Option B: Individual Vars (Easier for some hosting providers)
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   
   # Target Calendar (Default is 'primary' which is the bot's calendar)
   # Set this to your personal email to see events on your calendar
   GOOGLE_CALENDAR_ID=your-personal-email@gmail.com
   ```
4. **CRITICAL STEP**: Go to Google Calendar (web), find the calendar matching `GOOGLE_CALENDAR_ID`, go to **Settings and sharing**, and **Share with specific people**. Add the `GOOGLE_CLIENT_EMAIL` address and give it **Make changes to events** permission.

5. Start the server:
   ```bash
   npm start
   ```

### 3. Vapi Agent Configuration
1. Go to [Vapi Dashboard](https://dashboard.vapi.ai).
2. Create a new Assistant.
3. **Model**: Select **Mistral**.
   - If you are using your **own Mistral API key**, configure it in the Vapi dashboard/provider settings.
   - This repo’s backend does **not** call Mistral directly, so you should **not** put a Mistral key in the Node.js `.env` for this project.
4. **System Prompt**:
   ```text
   You are a professional scheduling assistant.
   Start the conversation immediately.
   Your job:
   1. Ask for the user's name.
   2. Ask for their preferred meeting date.
   3. Ask for their preferred meeting time.
   4. Ask optionally for a meeting title.
   5. Confirm all details clearly.
   6. Once confirmed, call the tool 'create_calendar_event'.
   Be concise, friendly, and confident.
   ```
5. **Tools**: Add a Function Tool.
   - **Name**: `create_calendar_event`
   - **Description**: Schedules a meeting on the calendar.
   - **Parameters**:
     ```json
     {
       "type": "object",
       "properties": {
         "name": { "type": "string" },
         "email": { "type": "string", "description": "Required for Cal.com bookings" },
         "date": { "type": "string", "description": "ISO date YYYY-MM-DD" },
         "time": { "type": "string", "description": "24hr format HH:MM" },
         "title": { "type": "string" }
       },
       "required": ["name", "date", "time", "email"]
     }
     ```
   - **Server URL**: Set to your deployed backend URL + `/vapi/webhook`.

### 4. Frontend Setup
1. Open `App.tsx` or run the development server.
2. Click the **Settings (Gear Icon)**.
3. Enter your **Vapi Public Key** and **Assistant ID**.

## 🧪 Testing

1. Open the web interface.
2. Click "Start Conversation".
3. Say: *"Hi, I'd like to book a meeting."*
4. Provide the requested details.
5. Say: *"Yes, that sounds correct."*
6. Check the Google Calendar associated with the Service Account to see the new event.

