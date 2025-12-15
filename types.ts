export type CallStatus = 'disconnected' | 'connecting' | 'connected';

export interface VapiConfig {
  publicKey: string;
  assistantId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
}