import React, { useState } from 'react';
import { Person, Seva, ScheduleStatus, ScheduleEntry } from '../types';
import { Button } from './Button';
import { Calendar as CalendarIcon, Clock, X, HeartHandshake, AlertCircle } from 'lucide-react';

interface ScheduleFormProps {
  people: Person[];
  sevas: Seva[];
  onSubmit: (entries: Omit<ScheduleEntry, 'id'>[]) => void;
  onClose: () => void;
  initialDate?: string;
}

const DAYS_OF_WEEK = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

const calculateEndTime = (startTime: string, durationMinutes: number) => {
  const [hours, mins] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + durationMinutes);
  const endHours = date.getHours().toString().padStart(2, '0');
  const endMins = date.getMinutes().toString().padStart(2, '0');
  return `${endHours}:${endMins}`;
};

export const ScheduleForm: React.FC<ScheduleFormProps> = ({ people, sevas, onSubmit, onClose, initialDate }) => {
  // Check for prerequisites
  const hasSevas = sevas.length > 0;
  const hasPeople = people.length > 0;

  const [isRecurring, setIsRecurring] = useState(false);
  
  // Initialize state with Seva defaults if available
  const [formData, setFormData] = useState(() => {
    const initialSeva = sevas.length > 0 ? sevas[0] : null;
    const defaultStart = initialSeva?.defaultStartTime || '06:00';
    const defaultDuration = initialSeva?.defaultDurationMinutes || 60;

    return {
      startDate: initialDate || new Date().toISOString().split('T')[0],
      endDate: initialDate || new Date().toISOString().split('T')[0],
      startTime: defaultStart,
      endTime: calculateEndTime(defaultStart, defaultDuration),
      sevaId: initialSeva?.id || '',
      personId: people.length > 0 ? people[0].id : '',
      selectedDays: [0, 1, 2, 3, 4, 5, 6], // Default all days
    };
  });

  const handleSevaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSevaId = e.target.value;
    const selectedSeva = sevas.find(s => s.id === newSevaId);
    
    // Auto-populate time based on metadata
    let newStartTime = formData.startTime;
    let newEndTime = formData.endTime;

    if (selectedSeva) {
      if (selectedSeva.defaultStartTime) {
        newStartTime = selectedSeva.defaultStartTime;
      }
      // Always recalculate end time based on new or existing start time + new duration
      newEndTime = calculateEndTime(newStartTime, selectedSeva.defaultDurationMinutes);
    }

    setFormData({
      ...formData,
      sevaId: newSevaId,
      startTime: newStartTime,
      endTime: newEndTime
    });
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    const selectedSeva = sevas.find(s => s.id === formData.sevaId);
    const duration = selectedSeva?.defaultDurationMinutes || 60;
    
    setFormData({
      ...formData,
      startTime: newStartTime,
      endTime: calculateEndTime(newStartTime, duration)
    });
  };

  const toggleDay = (dayValue: number) => {
    setFormData(prev => {
      const exists = prev.selectedDays.includes(dayValue);
      if (exists) {
        return { ...prev, selectedDays: prev.selectedDays.filter(d => d !== dayValue) };
      } else {
        return { ...prev, selectedDays: [...prev.selectedDays, dayValue] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sevaId || !formData.personId) {
       alert("Please ensure a Seva Type and a Volunteer are selected.");
       return;
    }

    const entries: Omit<ScheduleEntry, 'id'>[] = [];
    const groupId = Math.random().toString(36).substr(2, 9);
    
    let current = new Date(formData.startDate);
    const end = new Date(isRecurring ? formData.endDate : formData.startDate);

    // Safety break for loop
    let loops = 0;
    while (current <= end && loops < 365) {
      loops++;
      const dayOfWeek = current.getDay();
      
      // If recurring, check if day matches. If not recurring, always add (it's a single day).
      if (!isRecurring || formData.selectedDays.includes(dayOfWeek)) {
        entries.push({
          groupId: isRecurring ? groupId : undefined,
          date: current.toISOString().split('T')[0],
          startTime: formData.startTime,
          endTime: formData.endTime,
          sevaId: formData.sevaId,
          personId: formData.personId,
          status: ScheduleStatus.SCHEDULED
        });
      }
      
      // Next day
      current.setDate(current.getDate() + 1);
    }

    if (entries.length === 0) {
      alert("No dates selected within the range.");
      return;
    }

    onSubmit(entries);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full animate-fade-in relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Schedule Seva</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {(!hasSevas || !hasPeople) ? (
          <div className="p-8 text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Setup Required</h4>
            <p className="text-gray-600 mb-6">
              Before you can schedule, you need to add:
              <ul className="mt-2 text-sm text-left inline-block">
                {!hasSevas && <li>• Seva Types (in Manage Sevas)</li>}
                {!hasPeople && <li>• Volunteers (in Volunteers)</li>}
              </ul>
            </p>
            <Button onClick={onClose}>Got it</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Toggle Type */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isRecurring ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setIsRecurring(false)}
              >
                Single Day
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isRecurring ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setIsRecurring(true)}
              >
                Weekly / Recurring
              </button>
            </div>

            <div className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRecurring ? 'Start Date' : 'Date'}
                  </label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      required
                      type="date" 
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                </div>
                {isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="relative">
                      <CalendarIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input 
                        required
                        type="date" 
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                        value={formData.endDate}
                        min={formData.startDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Recurrence Days */}
              {isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repeats On</label>
                  <div className="flex justify-between gap-1">
                    {DAYS_OF_WEEK.map(day => {
                      const isSelected = formData.selectedDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`
                            w-10 h-10 rounded-full text-xs font-semibold flex items-center justify-center transition-colors
                            ${isSelected ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                          `}
                        >
                          {day.label.charAt(0)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seva Type (Moved Up) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seva Type</label>
                <div className="relative">
                  <HeartHandshake className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <select 
                    required
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2 bg-white"
                    value={formData.sevaId}
                    onChange={handleSevaChange}
                  >
                    {sevas.length === 0 && <option value="">No Sevas Created</option>}
                    {sevas.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Default: {s.defaultStartTime || 'N/A'}, {s.defaultDurationMinutes}m)</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-1">Times will auto-adjust based on Seva selection.</p>
              </div>

              {/* Time (Now dependent on Seva) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      required
                      type="time" 
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                      value={formData.startTime}
                      onChange={handleStartTimeChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                      required
                      type="time" 
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                      value={formData.endTime}
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Volunteer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Volunteer</label>
                <select 
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2 bg-white"
                  value={formData.personId}
                  onChange={e => setFormData({...formData, personId: e.target.value})}
                >
                  {people.length === 0 && <option value="">No Volunteers Created</option>}
                  {people.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit">
                {isRecurring ? 'Schedule Series' : 'Schedule Seva'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
