import React, { useState } from 'react';
import { Person, NotificationChannel } from '../types';
import { User, Mail, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface PeopleListProps {
  people: Person[];
  onAddPerson: (person: Omit<Person, 'id'>) => void;
  onDeletePerson: (id: string) => void;
}

export const PeopleList: React.FC<PeopleListProps> = ({ people, onAddPerson, onDeletePerson }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPerson, setNewPerson] = useState({
    fullName: '',
    email: '',
    mobile: '',
    preferredChannel: NotificationChannel.WHATSAPP,
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPerson(newPerson);
    setIsAdding(false);
    setNewPerson({
      fullName: '',
      email: '',
      mobile: '',
      preferredChannel: NotificationChannel.WHATSAPP,
      active: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-orange-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Volunteers</h2>
          <p className="text-gray-500 text-sm mt-1">Manage people available for Seva</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Volunteer
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-orange-200 animate-slide-down">
          <h3 className="text-lg font-semibold mb-4">New Volunteer Details</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                required
                type="text" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                value={newPerson.fullName}
                onChange={e => setNewPerson({...newPerson, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input 
                required
                type="tel" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                value={newPerson.mobile}
                onChange={e => setNewPerson({...newPerson, mobile: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input 
                required
                type="email" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                value={newPerson.email}
                onChange={e => setNewPerson({...newPerson, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Notification</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 border px-3 py-2"
                value={newPerson.preferredChannel}
                onChange={e => setNewPerson({...newPerson, preferredChannel: e.target.value as NotificationChannel})}
              >
                <option value={NotificationChannel.WHATSAPP}>WhatsApp</option>
                <option value={NotificationChannel.EMAIL}>Email</option>
                <option value={NotificationChannel.BOTH}>Both</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Save Person</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map(person => (
          <div key={person.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors group">
             <div className="flex justify-between items-start">
               <div className="flex items-center space-x-3">
                 <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                   {person.fullName.charAt(0)}
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-900">{person.fullName}</h3>
                   <div className="flex items-center text-xs text-gray-500 mt-1">
                     {person.preferredChannel === NotificationChannel.WHATSAPP ? (
                       <MessageCircle className="w-3 h-3 mr-1 text-green-500" />
                     ) : (
                       <Mail className="w-3 h-3 mr-1 text-blue-500" />
                     )}
                     {person.preferredChannel}
                   </div>
                 </div>
               </div>
               <button 
                 onClick={() => onDeletePerson(person.id)}
                 className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
             </div>
             <div className="mt-4 space-y-2 text-sm text-gray-600">
               <p className="flex items-center"><Mail className="w-3 h-3 mr-2" /> {person.email}</p>
               <p className="flex items-center"><MessageCircle className="w-3 h-3 mr-2" /> {person.mobile}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
