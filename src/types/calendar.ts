export type UserCalendar = {
  id: number;
  name: string;
  description: string;
  color: string;
};

export type DayEvent = {
  id: number;        
  eventId: number;   
  calendarId: number;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;  
};
