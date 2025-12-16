export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  BOTH = 'BOTH',
}

export enum ScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Person {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  preferredChannel: NotificationChannel;
  active: boolean;
}

export interface Seva {
  id: string;
  name: string;
  description: string;
  defaultDurationMinutes: number;
  defaultStartTime?: string; // HH:mm format
  color: string; // Tailwind color class specific (e.g., 'bg-orange-100')
}

export interface ScheduleEntry {
  id: string;
  groupId?: string; // To link recurring events together
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  sevaId: string;
  personId: string;
  status: ScheduleStatus;
}

export interface DailySummary {
  date: string;
  entries: ScheduleEntry[];
}
