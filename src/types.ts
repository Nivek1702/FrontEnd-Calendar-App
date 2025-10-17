export type DateTimeVO = {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
};

export type CreateEventSchema = {
  title: string;
  description?: string;
  location?: string;
  calendar_id: number;
};

export type EventEntity = {
  id: number;
  title: string;
  description: string;
  location: string;
  calendar_id: number;
};

export type CreateTimeSchema = {
  start_time: DateTimeVO;
  end_time: DateTimeVO;
  event_id: number;
};

export type TimeEntity = {
  id: number;
  start_time: DateTimeVO;
  end_time: DateTimeVO;
  event_id: number;
};

/** Lo que devuelve tu endpoint agregado: eventos con sus times */
export type EventTimes = {
  event: EventEntity;
  times: TimeEntity[];
};

/** Utilidades frontend */
export type NewTimeSlot = {
  date: Date;          // fecha (día) elegida en UI
  start: string;       // "HH:MM"
  end: string;         // "HH:MM"
};
