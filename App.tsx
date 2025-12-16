import React, { useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PeopleList } from './components/PeopleList';
import { SevaList } from './components/SevaList';
import { ScheduleForm } from './components/ScheduleForm';
import { Button } from './components/Button';

// Mock Data Imports
import { INITIAL_PEOPLE, INITIAL_SEVAS, INITIAL_SCHEDULE } from './constants';
import { Person, Seva, ScheduleEntry, ScheduleStatus } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalDate, setScheduleModalDate] = useState<string | undefined>(undefined);

  // App State (Simulated Backend)
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [sevas, setSevas] = useState<Seva[]>(INITIAL_SEVAS);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(INITIAL_SCHEDULE);

  // Handlers
  const handleAddPerson = (newPerson: Omit<Person, 'id'>) => {
    const p: Person = { ...newPerson, id: Math.random().toString(36).substr(2, 9) };
    setPeople([...people, p]);
  };

  const handleDeletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    // Ideally we also handle schedule cleanup here
  };

  const handleAddSeva = (newSeva: Omit<Seva, 'id'>) => {
    const s: Seva = { ...newSeva, id: Math.random().toString(36).substr(2, 9) };
    setSevas([...sevas, s]);
  };

  const handleDeleteSeva = (id: string) => {
    setSevas(sevas.filter(s => s.id !== id));
  };

  // Handles Batch Creation from the new form
  const handleAddSchedule = (entries: Omit<ScheduleEntry, 'id'>[]) => {
    const newEntries = entries.map(entry => ({
      ...entry,
      id: Math.random().toString(36).substr(2, 9)
    }));
    setSchedule([...schedule, ...newEntries]);
  };

  const handleUpdateStatus = (id: string, status: ScheduleStatus) => {
    setSchedule(schedule.map(s => s.id === id ? { ...s, status } : s));
  };

  const openScheduleModal = (date?: string) => {
    setScheduleModalDate(date);
    setIsScheduleModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-orange-50/30 overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        onChangeView={setActiveView} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar for Mobile/Global Actions */}
        <header className="bg-white border-b border-orange-100 p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 rounded-md hover:bg-orange-50 text-gray-600 mr-2"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 lg:hidden">SevaConnect</h1>
          </div>
          
          <div className="flex items-center space-x-3">
             <Button 
                variant="primary" 
                size="sm"
                onClick={() => openScheduleModal()}
             >
               <Plus className="w-4 h-4 mr-1" />
               <span className="hidden sm:inline">Schedule Seva</span>
               <span className="sm:hidden">Add</span>
             </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {activeView === 'dashboard' && (
              <Dashboard 
                entries={schedule}
                people={people}
                sevas={sevas}
                onUpdateStatus={handleUpdateStatus}
                onAddSevaClick={openScheduleModal}
              />
            )}
            {activeView === 'sevas' && (
              <SevaList 
                sevas={sevas}
                onAddSeva={handleAddSeva}
                onDeleteSeva={handleDeleteSeva}
              />
            )}
            {activeView === 'people' && (
              <PeopleList 
                people={people}
                onAddPerson={handleAddPerson}
                onDeletePerson={handleDeletePerson}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {isScheduleModalOpen && (
        <ScheduleForm 
          people={people}
          sevas={sevas}
          onSubmit={handleAddSchedule}
          onClose={() => setIsScheduleModalOpen(false)}
          initialDate={scheduleModalDate}
        />
      )}
    </div>
  );
};

export default App;
