import React from 'react';
import { CalendarEvent } from '../types';
import { Clock, User } from 'lucide-react';

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Product Sync with Vikara',
    date: '2023-10-27',
    time: '10:00 AM',
    attendees: ['Vikara Team']
  },
  {
    id: '2',
    title: 'Frontend Architecture Review',
    date: '2023-10-28',
    time: '02:00 PM',
    attendees: ['Senior Eng']
  }
];

export const EventList: React.FC = () => {
  return (
    <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
      {MOCK_EVENTS.map(event => (
        <div key={event.id} className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-4 hover:bg-gray-700/50 transition-colors group">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-200 group-hover:text-primary-300 transition-colors">{event.title}</h4>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-600">
                Confirmed
            </span>
          </div>
          
          <div className="flex flex-col gap-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{event.date} at {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>{event.attendees.join(', ')}</span>
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <p className="text-xs text-gray-500 italic">
          * Events shown are simulated for this demo UI. Check your Google Calendar for real events.
        </p>
      </div>
    </div>
  );
};