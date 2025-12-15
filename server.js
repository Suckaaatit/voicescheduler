import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
// Default to 'primary' (the service account's own calendar) if not specified.
// Users usually want to set this to their own email address (e.g. user@gmail.com).
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

const CAL_API_KEY = process.env.CAL_API_KEY;
const CAL_EVENT_TYPE_ID = process.env.CAL_EVENT_TYPE_ID ? Number(process.env.CAL_EVENT_TYPE_ID) : undefined;
const CAL_USERNAME = process.env.CAL_USERNAME;
const CAL_EVENT_TYPE_SLUG = process.env.CAL_EVENT_TYPE_SLUG;
const CAL_ATTENDEE_TIMEZONE = process.env.CAL_ATTENDEE_TIMEZONE || 'Asia/Kolkata';
const CAL_API_VERSION = '2024-08-13';

const hasGoogleEnvCreds = Boolean(
  process.env.GOOGLE_CREDENTIALS_JSON ||
  (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)
);

const hasCalEventTypeConfig = () => {
  const hasEventTypeId = !!CAL_EVENT_TYPE_ID && !Number.isNaN(CAL_EVENT_TYPE_ID);
  const hasSlugBooking = !!CAL_USERNAME && !!CAL_EVENT_TYPE_SLUG;
  return hasEventTypeId || hasSlugBooking;
};

// -- Google Calendar Setup --
const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

// Helper to get Auth Client
const getAuthClient = async () => {
  try {
    // Strategy 1: Individual Environment Variables (Best for Render/Railway/Vercel)
    // This handles the common issue where private keys have escaped newlines (\n)
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      console.log(`Loading credentials for: ${process.env.GOOGLE_CLIENT_EMAIL}`);
      const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      const jwtClient = new google.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        null,
        privateKey,
        SCOPES
      );
      return jwtClient;
    }

    // Strategy 2: JSON String in Environment Variable
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      console.log('Loading credentials from GOOGLE_CREDENTIALS_JSON...');
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      return google.auth.fromJSON(credentials);
    }

    // Strategy 3: Standard Google Application Default Credentials (local development with key file)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Attempting to use Application Default Credentials (local key file)...');
      const auth = new google.auth.GoogleAuth({
        scopes: SCOPES,
      });
      return await auth.getClient();
    }

    throw new Error('Google credentials not configured. Set GOOGLE_CREDENTIALS_JSON or (GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY).');

  } catch (error) {
    console.error("CRITICAL: Failed to initialize Google Auth client.", error.message);
    throw error;
  }
};

// -- Routes --

// 1. Health Check & Config Validation
app.get('/health', async (req, res) => {
  try {
    if (CAL_API_KEY) {
      if (!hasCalEventTypeConfig()) {
        return res.status(500).json({
          status: 'error',
          provider: 'cal.com',
          message: 'Missing Cal.com event type config. Set CAL_EVENT_TYPE_ID or (CAL_USERNAME + CAL_EVENT_TYPE_SLUG).',
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(200).json({
        status: 'ok',
        provider: 'cal.com',
        eventTypeId: (CAL_EVENT_TYPE_ID && !Number.isNaN(CAL_EVENT_TYPE_ID)) ? CAL_EVENT_TYPE_ID : undefined,
        username: CAL_USERNAME || undefined,
        eventTypeSlug: CAL_EVENT_TYPE_SLUG || undefined,
        attendeeTimeZone: CAL_ATTENDEE_TIMEZONE,
        timestamp: new Date().toISOString(),
      });
    }

    if (!hasGoogleEnvCreds && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return res.status(500).json({
        status: 'error',
        provider: 'none',
        message: 'No calendar provider configured. Set CAL_API_KEY (+ CAL_USERNAME/CAL_EVENT_TYPE_SLUG) for Cal.com, or set Google credentials env vars for Google Calendar.',
        timestamp: new Date().toISOString(),
      });
    }

    const auth = await getAuthClient();
    // Try to get credentials email to verify auth is working
    // @ts-ignore
    const email = auth.email || (auth.credentials && auth.credentials.client_email) || 'Unknown Service Account';
    
    res.status(200).json({ 
      status: 'ok', 
      serviceAccount: email,
      targetCalendarId: CALENDAR_ID,
      timestamp: new Date().toISOString() 
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'Auth configuration invalid', error: e.message });
  }
});

app.get('/debug/env', (req, res) => {
  res.status(200).json({
    cal: {
      CAL_API_KEY: Boolean(CAL_API_KEY),
      CAL_EVENT_TYPE_ID: Boolean(CAL_EVENT_TYPE_ID && !Number.isNaN(CAL_EVENT_TYPE_ID)),
      CAL_USERNAME: Boolean(CAL_USERNAME),
      CAL_EVENT_TYPE_SLUG: Boolean(CAL_EVENT_TYPE_SLUG),
      CAL_ATTENDEE_TIMEZONE: Boolean(CAL_ATTENDEE_TIMEZONE),
    },
    google: {
      GOOGLE_CREDENTIALS_JSON: Boolean(process.env.GOOGLE_CREDENTIALS_JSON),
      GOOGLE_CLIENT_EMAIL: Boolean(process.env.GOOGLE_CLIENT_EMAIL),
      GOOGLE_PRIVATE_KEY: Boolean(process.env.GOOGLE_PRIVATE_KEY),
      GOOGLE_CALENDAR_ID: Boolean(process.env.GOOGLE_CALENDAR_ID),
    },
  });
});

// 2. Vapi Webhook
app.post('/vapi/webhook', async (req, res) => {
  try {
    const { message } = req.body;

    // Log for debugging
    if (message?.type === 'tool-calls') {
      console.log('Received Tool Call:', JSON.stringify(message.toolCalls.map(t => t.function.name)));
    } else {
      console.log('Received Vapi Message:', message?.type);
    }

    // Handle Function Calls (Tool Calls)
    if (message.type === 'tool-calls') {
      const toolCalls = message.toolCalls;
      const results = [];

      for (const call of toolCalls) {
        if (call.function.name === 'create_calendar_event') {
          console.log('Processing create_calendar_event with args:', call.function.arguments);
          try {
            const args = typeof call.function.arguments === 'string' 
              ? JSON.parse(call.function.arguments) 
              : call.function.arguments;

            if (!CAL_API_KEY && !hasGoogleEnvCreds && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
              throw new Error('No calendar provider configured. Configure Cal.com env vars or Google Calendar env vars on the backend.');
            }

            const eventLink = CAL_API_KEY
              ? await createCalBooking(args)
              : await createGoogleCalendarEvent(args);
            
            results.push({
              toolCallId: call.id,
              result: `Success! The meeting has been scheduled on the calendar. Event link: ${eventLink}`,
            });
          } catch (error) {
            console.error('Calendar Operation Failed:', error);
            
            let userErrorMessage = "I had trouble accessing the calendar. Please check the backend logs.";

            // If this was a Cal.com error, surface it directly so the agent/user can fix config.
            // (The thrown error message does not include the API key itself.)
            if (typeof error?.message === 'string' && error.message.startsWith('Cal.com booking failed')) {
              if (error.message.includes('(401)') || error.message.toLowerCase().includes('invalid api key')) {
                userErrorMessage = 'Cal.com API key rejected (401 Unauthorized). Generate a new Cal.com API key and set CAL_API_KEY.';
              } else {
                userErrorMessage = error.message;
              }
            }
            
            // Provide more specific error messages to the Voice Agent so it can tell the user
            if (error.code === 404) {
              userErrorMessage = "I couldn't find the calendar. Please ensure the Calendar ID is correct and shared with the service account.";
            } else if (error.code === 403) {
              userErrorMessage = "I don't have permission to edit this calendar. Please check the sharing settings.";
            } else if (error.message.includes("Invalid date")) {
              userErrorMessage = "I couldn't understand the date or time format provided.";
            }

            results.push({
              toolCallId: call.id,
              result: `Error: ${userErrorMessage}`,
            });
          }
        } else {
          console.log('Unknown function:', call.function.name);
          results.push({
            toolCallId: call.id,
            result: `Function ${call.function.name} not found.`,
          });
        }
      }

      // Return the results to Vapi
      return res.status(200).json({ results });
    }

    // Handle other Vapi message types
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// -- Calendar Logic --
async function createGoogleCalendarEvent({ name, date, time, title, email }) {
  const auth = await getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  // 1. Robust Date Parsing
  // Combine date and time. Assume ISO format YYYY-MM-DD and HH:MM or HH:MM:SS
  const dateTimeString = `${date}T${time}`;
  const startDateTime = new Date(dateTimeString);
  
  if (isNaN(startDateTime.getTime())) {
    console.error(`Invalid Date: ${date} ${time} parsed as ${dateTimeString}`);
    throw new Error(`Invalid date/time format: ${date} ${time}`);
  }

  // Event is 30 mins by default
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

  const event = {
    summary: title || `Meeting with ${name}`,
    description: `Scheduled via Voice Agent for ${name}.`,
    start: {
      dateTime: startDateTime.toISOString(),
      // Note: If you want to support specific timezones, ask the user or config env var.
      // Defaults to utilizing the parsed time as UTC if no offset provided, or local server time interpretation.
      timeZone: 'UTC', 
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'UTC',
    },
    attendees: email ? [{ email }] : [],
  };

  console.log(`Attempting to insert event into calendar: ${CALENDAR_ID}`);
  
  try {
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    console.log('Event created successfully:', response.data.htmlLink);
    return response.data.htmlLink;
  } catch (error) {
    if (error.code === 404) {
      console.error(`ERROR: Calendar with ID "${CALENDAR_ID}" not found.`); 
      console.error("SOLUTION: 1. Go to Google Calendar Settings. 2. Share the calendar with the Service Account Email.");
    }
    throw error;
  }
}

async function createCalBooking({ name, date, time, title, email }) {
  if (!CAL_API_KEY) {
    throw new Error('CAL_API_KEY not configured');
  }
  const hasEventTypeId = !!CAL_EVENT_TYPE_ID && !Number.isNaN(CAL_EVENT_TYPE_ID);
  const hasSlugBooking = !!CAL_USERNAME && !!CAL_EVENT_TYPE_SLUG;
  if (!hasEventTypeId && !hasSlugBooking) {
    throw new Error('Missing Cal.com event type config. Set CAL_EVENT_TYPE_ID or (CAL_USERNAME + CAL_EVENT_TYPE_SLUG).');
  }
  if (!email) {
    throw new Error('Missing attendee email (required for Cal.com bookings)');
  }

  const dateTimeString = `${date}T${time}`;
  const startDateTime = new Date(dateTimeString);
  if (isNaN(startDateTime.getTime())) {
    throw new Error(`Invalid date/time format: ${date} ${time}`);
  }

  const payload = {
    start: startDateTime.toISOString(),
    attendee: {
      name,
      email,
      timeZone: CAL_ATTENDEE_TIMEZONE,
    },
    ...(hasEventTypeId
      ? { eventTypeId: CAL_EVENT_TYPE_ID }
      : { eventTypeSlug: CAL_EVENT_TYPE_SLUG, username: CAL_USERNAME }),
    metadata: {
      title: title || `Meeting with ${name}`,
      source: 'voice-scheduling-agent',
    },
  };

  const response = await fetch('https://api.cal.com/v2/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CAL_API_KEY}`,
      'cal-api-version': CAL_API_VERSION,
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const details = json ? JSON.stringify(json) : await response.text().catch(() => '');
    throw new Error(`Cal.com booking failed (${response.status}): ${details}`);
  }

  const bookingUid = json?.data?.uid;
  if (!bookingUid) {
    throw new Error('Cal.com booking created but uid missing in response');
  }

  // Cal.com does not guarantee a public booking details page.
  // The safest link is the Cal dashboard booking page (requires login), plus the UID for lookup.
  return `Cal.com booking UID: ${bookingUid} (view in dashboard: https://app.cal.com/bookings/${bookingUid})`;
}

// -- Serve Frontend (Production) --
// When deployed as a single service, serve the Vite build output from /dist.
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// -- Start Server --
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Env check: CAL_API_KEY set = ${Boolean(CAL_API_KEY)}`);
  console.log(`Env check: CAL_USERNAME set = ${Boolean(CAL_USERNAME)}`);
  console.log(`Env check: CAL_EVENT_TYPE_SLUG set = ${Boolean(CAL_EVENT_TYPE_SLUG)}`);
  
  // Startup check
  try {
    if (CAL_API_KEY) {
      console.log('-------------------------------------------------------');
      console.log('✅ Cal.com Configured');
      console.log(`🗓️  Event Type ID:       ${CAL_EVENT_TYPE_ID || '(not set)'}`);
      console.log(`👤 Cal Username:         ${CAL_USERNAME || '(not set)'}`);
      console.log(`🏷️  Event Type Slug:      ${CAL_EVENT_TYPE_SLUG || '(not set)'}`);
      console.log(`🌍 Attendee Time Zone:   ${CAL_ATTENDEE_TIMEZONE}`);
      console.log('-------------------------------------------------------');
      return;
    }

    if (!hasGoogleEnvCreds && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('⚠️  No calendar provider configured yet. Set Cal.com or Google Calendar env vars.');
      return;
    }

    const auth = await getAuthClient();
    // @ts-ignore
    const email = auth.email || (auth.credentials && auth.credentials.client_email);
    if (email) {
      console.log('-------------------------------------------------------');
      console.log('✅ Google Auth Configured');
      console.log(`📧 Service Account Email: ${email}`);
      console.log(`📅 Target Calendar ID:    ${CALENDAR_ID}`);
      console.log('-------------------------------------------------------');
      console.log('IMPORTANT: Share your Google Calendar with the email above to enable write access.');
    }
  } catch (e) {
    console.warn('⚠️  Startup Warning: Google Credentials not fully configured yet.');
  }
});