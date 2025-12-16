import { Person, Seva, ScheduleEntry, NotificationChannel, ScheduleStatus } from './types';

export const INITIAL_PEOPLE: Person[] = [
  {
    id: 'p1',
    fullName: 'Rahul Sharma',
    email: 'rahul@example.com',
    mobile: '9876543210',
    preferredChannel: NotificationChannel.WHATSAPP,
    active: true
  },
  {
    id: 'p2',
    fullName: 'Priya Patel',
    email: 'priya@example.com',
    mobile: '9876543211',
    preferredChannel: NotificationChannel.EMAIL,
    active: true
  },
  {
    id: 'p3',
    fullName: 'Amit Kumar',
    email: 'amit@example.com',
    mobile: '9876543212',
    preferredChannel: NotificationChannel.BOTH,
    active: true
  },
  {
    id: 'p4',
    fullName: 'Anjali Desai',
    email: 'anjali@example.com',
    mobile: '9876543213',
    preferredChannel: NotificationChannel.WHATSAPP,
    active: true
  }
];

export const INITIAL_SEVAS: Seva[] = [
  {
    id: 's1',
    name: 'Morning Asan',
    description: 'First prayer of the day. Requires setup of lamps.',
    defaultDurationMinutes: 45,
    defaultStartTime: '05:00',
    color: 'bg-orange-100 border-orange-200'
  },
  {
    id: 's2',
    name: 'Temple Cleaning',
    description: 'Cleaning the main hall and entrance.',
    defaultDurationMinutes: 90,
    defaultStartTime: '07:00',
    color: 'bg-blue-100 border-blue-200'
  },
  {
    id: 's3',
    name: 'Evening Aarti',
    description: 'Evening prayer service.',
    defaultDurationMinutes: 60,
    defaultStartTime: '18:30',
    color: 'bg-red-100 border-red-200'
  },
  {
    id: 's4',
    name: 'Kitchen Help',
    description: 'Assisting in preparing Prasad.',
    defaultDurationMinutes: 120,
    defaultStartTime: '09:00',
    color: 'bg-yellow-100 border-yellow-200'
  }
];

// Helper to generate a date string for today/tomorrow
const getDateStr = (offsetDays: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const batchId1 = 'batch_123';
const batchId2 = 'batch_456';

export const INITIAL_SCHEDULE: ScheduleEntry[] = [
  // Today
  {
    id: 'sch1',
    groupId: batchId1,
    date: getDateStr(0),
    startTime: '05:00',
    endTime: '05:45',
    sevaId: 's1',
    personId: 'p1',
    status: ScheduleStatus.SCHEDULED
  },
  {
    id: 'sch2',
    groupId: batchId2,
    date: getDateStr(0),
    startTime: '18:30',
    endTime: '19:30',
    sevaId: 's3',
    personId: 'p2',
    status: ScheduleStatus.SCHEDULED
  },
  // Tomorrow
  {
    id: 'sch3',
    groupId: batchId1,
    date: getDateStr(1),
    startTime: '05:00',
    endTime: '05:45',
    sevaId: 's1',
    personId: 'p3',
    status: ScheduleStatus.SCHEDULED
  },
  {
    id: 'sch4',
    groupId: batchId2,
    date: getDateStr(1),
    startTime: '18:30',
    endTime: '19:30',
    sevaId: 's3',
    personId: 'p4',
    status: ScheduleStatus.SCHEDULED
  },
  // Day After Tomorrow
  {
    id: 'sch5',
    groupId: batchId1,
    date: getDateStr(2),
    startTime: '05:00',
    endTime: '05:45',
    sevaId: 's1',
    personId: 'p1',
    status: ScheduleStatus.SCHEDULED
  },
  {
    id: 'sch6',
    date: getDateStr(3),
    startTime: '07:00',
    endTime: '08:30',
    sevaId: 's2',
    personId: 'p2',
    status: ScheduleStatus.SCHEDULED
  }
];
