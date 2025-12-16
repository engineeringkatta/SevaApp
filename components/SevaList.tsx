import React, { useState } from 'react';
import { Seva } from '../types';
import { Plus, Trash2, Clock, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface SevaListProps {
  sevas: Seva[];
  onAddSeva: (seva: Omit<Seva, 'id'>) => void;
  onDeleteSeva: (id: string) => void;
}

export const SevaList: React.FC<SevaListProps> = ({ sevas, onAddSeva, onDeleteSeva }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSeva, setNewSeva] = useState({
    name: '',
    description: '',
    defaultDurationMinutes: 60,
    defaultStartTime: '06:00',
    color: 'bg-orange-100'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSeva(newSeva);
    setIsAdding(false);
    setNewSeva({
      name: '',
      description: '',
      defaultDurationMinutes: 60,
      defaultStartTime: '06:00',
      color: 'bg-orange-100'
    });
  };

  const colors = [
    { name: 'Saffron', class: 'bg-orange-100' },
    { name: 'Red', class: 'bg-red-100' },
    { name: 'Yellow', class: 'bg-yellow-100' },
    { name: 'Green', class: 'bg-green-100' },
    { name: 'Blue', class: 'bg-blue-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-orange-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Seva Types</h2>
          <p className="text-gray-500 text-sm mt-1">Define the types of services available</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Seva
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-orange-200 animate-slide-down">
          <h3 className="text-lg font-semibold mb-4">Create New Seva</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Seva Name</label>
              <input 
                required
                type="text" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                placeholder="e.g. Morning Aarti"
                value={newSeva.name}
                onChange={e => setNewSeva({...newSeva, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (Mins)</label>
                <input 
                  required
                  type="number" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                  value={newSeva.defaultDurationMinutes}
                  onChange={e => setNewSeva({...newSeva, defaultDurationMinutes: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Start</label>
                <input 
                  required
                  type="time" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                  value={newSeva.defaultStartTime}
                  onChange={e => setNewSeva({...newSeva, defaultStartTime: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                placeholder="Brief details about the service"
                value={newSeva.description}
                onChange={e => setNewSeva({...newSeva, description: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Tag</label>
              <div className="flex space-x-2">
                {colors.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${c.class} ${newSeva.color === c.class ? 'border-gray-600' : 'border-transparent'}`}
                    onClick={() => setNewSeva({...newSeva, color: c.class})}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Create Seva</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sevas.map(seva => (
          <div key={seva.id} className={`p-6 rounded-xl shadow-sm border border-transparent hover:shadow-md transition-shadow ${seva.color}`}>
             <div className="flex justify-between items-start">
               <div className="flex items-center space-x-3">
                 <div className="p-2 bg-white/60 rounded-lg">
                   <Sparkles className="w-5 h-5 text-gray-700" />
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-900 text-lg">{seva.name}</h3>
                 </div>
               </div>
               <button 
                 onClick={() => onDeleteSeva(seva.id)}
                 className="text-gray-500 hover:text-red-600 transition-colors"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
             </div>
             <p className="mt-3 text-sm text-gray-700">{seva.description || "No description provided."}</p>
             <div className="mt-4 flex items-center space-x-4 text-xs font-semibold text-gray-600">
               <div className="flex items-center bg-white/50 px-2 py-1 rounded">
                  <Clock className="w-3 h-3 mr-1" />
                  {seva.defaultDurationMinutes} mins
               </div>
               {seva.defaultStartTime && (
                 <div className="flex items-center bg-white/50 px-2 py-1 rounded">
                    Starts at {seva.defaultStartTime}
                 </div>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
