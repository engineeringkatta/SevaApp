import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Wand2, Bell, Clock, User as UserIcon } from 'lucide-react';
import { ScheduleEntry, Person, Seva, ScheduleStatus } from '../types';
import { generateReminderMessage } from '../services/geminiService';
import { Button } from './Button';

interface DashboardProps {
  entries: ScheduleEntry[];
  people: Person[];
  sevas: Seva[];
  onUpdateStatus: (id: string, status: ScheduleStatus) => void;
  onAddSevaClick: (date: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, people, sevas, onUpdateStatus, onAddSevaClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalEntry, setModalEntry] = useState<ScheduleEntry | null>(null);

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    
    // Adjust for Monday start if desired, currently Sunday start (0)
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // --- Helpers ---
  const getPerson = (id: string) => people.find(p => p.id === id);
  const getSeva = (id: string) => sevas.find(s => s.id === id);
  
  const formatDateStr = (day: number) => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleGenerateReminder = async (entry: ScheduleEntry) => {
    const person = getPerson(entry.personId);
    const seva = getSeva(entry.sevaId);
    if (!person || !seva) return;

    setIsGenerating(true);
    setModalEntry(entry);
    const msg = await generateReminderMessage(person, seva, entry.date, entry.startTime);
    setGeneratedMessage(msg);
    setIsGenerating(false);
  };

  const closeReminderModal = () => {
    setModalEntry(null);
    setGeneratedMessage(null);
  };

  // --- Render Days ---
  const renderCalendarDays = () => {
    const days = [];
    // Padding for empty start days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`pad-${i}`} className="bg-gray-50/50 min-h-[100px] border-b border-r border-gray-100"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateStr(day);
      const dayEntries = entries
        .filter(e => e.date === dateStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div 
          key={day} 
          className={`min-h-[120px] bg-white border-b border-r border-gray-100 p-2 hover:bg-orange-50/20 transition-colors group relative ${isToday ? 'bg-orange-50/40' : ''}`}
          onClick={(e) => {
            // Only trigger if clicking empty space
            if (e.target === e.currentTarget) onAddSevaClick(dateStr);
          }}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center ${isToday ? 'bg-orange-600 text-white' : 'text-gray-700'}`}>
              {day}
            </span>
            <button 
              onClick={() => onAddSevaClick(dateStr)}
              className="opacity-0 group-hover:opacity-100 text-orange-600 hover:bg-orange-100 p-1 rounded transition-all"
              title="Add Seva"
            >
              <span className="text-xs font-bold">+ Add</span>
            </button>
          </div>
          
          <div className="space-y-1">
            {dayEntries.map(entry => {
              const seva = getSeva(entry.sevaId);
              const person = getPerson(entry.personId);
              return (
                <div 
                  key={entry.id}
                  className={`text-xs p-1.5 rounded border-l-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${seva?.color || 'bg-gray-100 border-gray-300'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReminder(entry);
                  }}
                  title={`Click to send reminder to ${person?.fullName}`}
                >
                  <div className="font-semibold text-gray-800 truncate">{seva?.name}</div>
                  <div className="flex items-center text-gray-600 mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    {entry.startTime}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserIcon className="w-3 h-3 mr-1" />
                    {person?.fullName.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return days;
  };

  // --- Today's Overview Logic ---
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const upcomingEntries = entries
    .filter(e => e.date === tomorrowStr || e.date === todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">{monthName}</h2>
            <div className="flex space-x-1">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
            </div>
            <button onClick={goToToday} className="text-sm text-orange-600 font-medium hover:underline">Today</button>
          </div>
          
          <div className="text-sm text-gray-500 hidden sm:block">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-200 mr-2"></span>
            Scheduled Sevas
          </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Calendar Grid Body */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Sidebar: Upcoming & Actions */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        
        {/* Upcoming Card */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-orange-600" />
            Upcoming Sevas
          </h3>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {upcomingEntries.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No sevas for today or tomorrow.</p>
            ) : (
              upcomingEntries.map(entry => {
                const isTomorrow = entry.date === tomorrowStr;
                const person = getPerson(entry.personId);
                const seva = getSeva(entry.sevaId);
                
                return (
                  <div key={entry.id} className="relative pl-4 border-l-2 border-orange-200 py-1">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">
                      {isTomorrow ? 'Tomorrow' : 'Today'}
                    </p>
                    <h4 className="text-sm font-semibold text-gray-900">{seva?.name}</h4>
                    <p className="text-xs text-gray-600 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {entry.startTime} - {entry.endTime}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      {person?.fullName}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full justify-start text-xs h-8"
                      onClick={() => handleGenerateReminder(entry)}
                    >
                      <Wand2 className="w-3 h-3 mr-2" />
                      Draft Reminder
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Daily Summary Card */}
        <div className="bg-orange-900 text-orange-50 rounded-xl shadow-sm p-5 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">Daily Summary</h3>
            <p className="text-sm text-orange-200 mb-4">
              Send the full schedule for tomorrow to all volunteers in one click.
            </p>
            <Button variant="secondary" size="sm" className="w-full text-orange-900 border-none">
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-800 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Reminder Modal (Reused) */}
      {modalEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Wand2 className="w-5 h-5 text-purple-600 mr-2" />
              Generate AI Reminder
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">Message Preview:</p>
                {isGenerating ? (
                  <div className="flex items-center text-gray-500 py-4">
                    <Wand2 className="w-4 h-4 animate-spin mr-2" />
                    Asking Gemini to write the perfect reminder...
                  </div>
                ) : (
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-800 text-sm h-32 resize-none"
                    value={generatedMessage || ''}
                    readOnly
                  />
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={closeReminderModal}>Cancel</Button>
                <Button 
                  onClick={() => {
                    alert('Integration with WhatsApp/Email API would trigger here with the generated message.');
                    closeReminderModal();
                  }}
                  disabled={isGenerating || !generatedMessage}
                >
                  Send Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
