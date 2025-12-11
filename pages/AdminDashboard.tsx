
import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus, ShopConfig, WaitingListEntry, Table } from '../types';
import * as DB from '../services/db';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';

type Tab = 'reservations' | 'waiting' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ShopConfig>(DB.getConfig());
  
  // State for Table Management
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(2);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', capacity: 0 });

  // State to track which row has the extension menu open
  const [extendMenuId, setExtendMenuId] = useState<string | null>(null);

  // Filters
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    // Show loading mainly on initial mount
    if(reservations.length === 0 && waitingList.length === 0) setLoading(true);
    
    // Fetch fresh data
    const allRes = DB.getReservations();
    const allWait = DB.getWaitingList();
    const allTables = DB.getTables();
    
    setReservations(allRes.sort((a,b) => a.startTime.localeCompare(b.startTime)));
    setWaitingList(allWait.sort((a,b) => a.createdAt - b.createdAt));
    setTables(allTables.sort((a,b) => a.name.localeCompare(b.name)));
    setConfig(DB.getConfig());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Subscribe to DB changes
    const unsubscribe = DB.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  // --- Actions ---

  const handleCheckIn = async (id: string) => {
    const success = await DB.checkInReservation(id);
    if (!success) alert("Could not check in. Reservation might not be confirmed.");
  };

  const handleExtend = async (id: string, minutes: number) => {
    const res = await DB.extendSession(id, minutes); 
    if (res.success) {
      alert(`Session extended by ${minutes} minutes.`);
      setExtendMenuId(null); // Close menu
    } else {
      alert(`Cannot extend: ${res.message}`);
    }
  };

  const handleCancel = async (id: string) => {
    if(confirm("Cancel this reservation?")) {
        await DB.cancelReservation(id);
    }
  };

  const handlePromote = async (entryId: string) => {
      const entry = waitingList.find(w => w.id === entryId);
      if(!entry) return;

      // Simple prompt for table ID (In a real app, show a dropdown of available tables)
      const tableId = prompt(`Enter Table ID to assign (Available: ${tables.map(t => t.id).join(', ')}):`);
      if(tableId) {
          const result = await DB.promoteFromWaitlist(entryId, tableId);
          if(result) {
              alert("Customer promoted to Confirmed Reservation!");
          } else {
              alert("Failed to promote.");
          }
      }
  }

  const handleConfigSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await DB.updateConfig(config);
    alert(t('alert_settings_saved'));
  };

  const handleAddTable = async (e: React.FormEvent) => {
      e.preventDefault();
      if(newTableName && newTableCapacity > 0) {
          await DB.addTable(newTableName, newTableCapacity);
          setNewTableName('');
          setNewTableCapacity(2);
      }
  };

  const startEditTable = (table: Table) => {
      setEditingTableId(table.id);
      setEditForm({ name: table.name, capacity: table.capacity });
  };

  const handleUpdateTable = async () => {
      if (editingTableId && editForm.name && editForm.capacity > 0) {
          await DB.updateTable(editingTableId, { name: editForm.name, capacity: editForm.capacity });
          setEditingTableId(null);
      }
  };

  const handleDeleteTable = async (id: string) => {
      if(confirm('Delete this table? This will affect future availability.')) {
          await DB.deleteTable(id);
      }
  };

  // --- Filtering ---

  const displayedReservations = reservations.filter(r => r.date === filterDate && r.status !== ReservationStatus.CANCELLED);
  const displayedWaiting = waitingList.filter(w => w.date === filterDate);

  // Helper to colorize status
  const getStatusColor = (s: ReservationStatus) => {
      switch(s) {
          case ReservationStatus.CONFIRMED: return 'bg-blue-100 text-blue-700';
          case ReservationStatus.OCCUPIED: return 'bg-green-100 text-green-700';
          case ReservationStatus.COMPLETED: return 'bg-gray-100 text-gray-500';
          case ReservationStatus.NOSHOW: return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100';
      }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-serif text-aqiq-primary rtl:font-arabic">{t('dashboard_title')}</h2>
           <p className="text-gray-500">{t('dashboard_subtitle')}</p>
        </div>
        <div className="bg-white p-1 rounded-lg shadow-sm border inline-flex">
           {(['reservations', 'waiting', 'settings'] as Tab[]).map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-2 rounded capitalize text-sm font-medium transition ${activeTab === tab ? 'bg-aqiq-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
             >
               {t(`tab_${tab}` as any)}
             </button>
           ))}
        </div>
      </div>

      {activeTab !== 'settings' && (
        <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <label className="font-bold text-sm text-gray-700">{t('filter_date')}</label>
          <input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          />
          <button onClick={loadData} className="ms-auto text-sm text-aqiq-primary underline">{t('refresh')}</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500">{t('loading')}</div>
      ) : (
        <div className="space-y-6">
          
          {/* RESERVATIONS VIEW */}
          {activeTab === 'reservations' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
               {displayedReservations.length === 0 ? (
                 <div className="p-10 text-center text-gray-400">{t('no_records')}</div>
               ) : (
                 <div className="overflow-x-auto min-h-[400px]">
                   <table className="w-full text-start text-sm">
                     <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                       <tr>
                         <th className="p-4 text-start">Slot</th>
                         <th className="p-4 text-start">Table</th>
                         <th className="p-4 text-start">{t('th_customer')}</th>
                         <th className="p-4 text-start">{t('th_guests')}</th>
                         <th className="p-4 text-start">{t('th_status')}</th>
                         <th className="p-4 text-end">{t('th_actions')}</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {displayedReservations.map(r => (
                         <tr key={r.id} className="hover:bg-gray-50 transition relative">
                           <td className="p-4 font-mono font-bold text-aqiq-primary">
                               {r.startTime} - {r.endTime}
                           </td>
                           <td className="p-4">
                               <span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">{r.tableId?.toUpperCase()}</span>
                           </td>
                           <td className="p-4">
                             <div className="font-bold">{r.customerName}</div>
                             <div className="text-xs text-gray-500" dir="ltr">{r.phone}</div>
                           </td>
                           <td className="p-4">{r.guests}</td>
                           <td className="p-4">
                             <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(r.status)}`}>
                               {r.status}
                             </span>
                           </td>
                           <td className="p-4 text-end">
                             <div className="flex justify-end gap-2 items-center">
                               {/* Check In Action */}
                               {r.status === ReservationStatus.CONFIRMED && (
                                   <button 
                                      onClick={() => handleCheckIn(r.id)}
                                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs transition"
                                   >
                                       Check-In
                                   </button>
                               )}

                               {/* Extend Action Menu (INLINE now to fix clipping) */}
                               {r.status === ReservationStatus.OCCUPIED && (
                                   <>
                                      {extendMenuId === r.id ? (
                                        <div className="flex items-center gap-1 bg-white border border-blue-200 rounded p-1 shadow-sm animate-fadeIn">
                                            <button onClick={() => handleExtend(r.id, 30)} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold">+30m</button>
                                            <button onClick={() => handleExtend(r.id, 60)} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold">+1h</button>
                                            <button onClick={() => handleExtend(r.id, 90)} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold">+1.5h</button>
                                            <button onClick={() => handleExtend(r.id, 120)} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold">+2h</button>
                                            <button onClick={() => setExtendMenuId(null)} className="text-red-500 hover:text-red-700 px-1 font-bold">✕</button>
                                        </div>
                                      ) : (
                                        <button 
                                            onClick={() => setExtendMenuId(r.id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs transition flex items-center gap-1"
                                        >
                                            Extend
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                      )}
                                   </>
                               )}
                               
                               {/* Cancel/Delete */}
                               {[ReservationStatus.CONFIRMED, ReservationStatus.WAITING_LIST].includes(r.status) && (
                                  <button 
                                      onClick={() => handleCancel(r.id)} 
                                      className="text-red-500 hover:text-red-700 text-xs underline"
                                  >
                                      Cancel
                                  </button>
                               )}
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          )}

          {/* WAITING LIST VIEW */}
          {activeTab === 'waiting' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
               {displayedWaiting.length === 0 ? (
                 <div className="p-10 text-center text-gray-400">{t('no_records')}</div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-start text-sm">
                     <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                       <tr>
                         <th className="p-4 text-start">Requested Time</th>
                         <th className="p-4 text-start">{t('th_customer')}</th>
                         <th className="p-4 text-start">{t('th_guests')}</th>
                         <th className="p-4 text-end">{t('th_actions')}</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                       {displayedWaiting.map((w, index) => (
                         <tr key={w.id} className="hover:bg-gray-50 transition">
                           <td className="p-4 font-mono font-bold text-aqiq-primary">
                               {w.startTime}
                               <span className="block text-xs text-gray-400 font-normal">#{index + 1} in queue</span>
                           </td>
                           <td className="p-4">
                             <div className="font-bold">{w.customerName}</div>
                             <div className="text-xs text-gray-500" dir="ltr">{w.phone}</div>
                           </td>
                           <td className="p-4">{w.guests}</td>
                           <td className="p-4 text-end">
                               <button 
                                 onClick={() => handlePromote(w.id)} 
                                 className="bg-aqiq-primary text-white px-3 py-1 rounded hover:bg-aqiq-accent transition text-xs"
                               >
                                 Assign Table
                               </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeTab === 'settings' && (
             <div className="space-y-6 max-w-2xl mx-auto">
                 {/* Table Management */}
                 <div className="bg-white rounded-xl shadow-lg p-8">
                     <h3 className="text-xl font-serif text-aqiq-primary mb-6 rtl:font-arabic">Table Management</h3>
                     <div className="mb-6">
                         <div className="bg-gray-50 p-4 rounded-lg mb-4">
                             <h4 className="font-bold text-sm mb-2">Add New Table</h4>
                             <form onSubmit={handleAddTable} className="flex gap-2">
                                 <input 
                                     type="text" 
                                     placeholder="Name (e.g. T12)" 
                                     className="border p-2 rounded flex-1"
                                     value={newTableName}
                                     onChange={e => setNewTableName(e.target.value)}
                                     required
                                 />
                                 <input 
                                     type="number" 
                                     placeholder="Capacity" 
                                     className="border p-2 rounded w-24"
                                     value={newTableCapacity}
                                     onChange={e => setNewTableCapacity(Number(e.target.value))}
                                     min={1}
                                     required
                                 />
                                 <Button type="submit" className="whitespace-nowrap">Add</Button>
                             </form>
                         </div>

                         <div className="max-h-60 overflow-y-auto border rounded-lg">
                             <table className="w-full text-sm">
                                 <thead className="bg-gray-100 text-gray-700">
                                     <tr>
                                         <th className="p-3 text-start">Name</th>
                                         <th className="p-3 text-start">Capacity</th>
                                         <th className="p-3 text-end">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y">
                                     {tables.map(table => (
                                         <tr key={table.id}>
                                             <td className="p-3 font-bold">
                                                 {editingTableId === table.id ? (
                                                     <input 
                                                        value={editForm.name} 
                                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                        className="border rounded p-1 w-full"
                                                     />
                                                 ) : table.name}
                                             </td>
                                             <td className="p-3">
                                                 {editingTableId === table.id ? (
                                                     <div className="flex items-center gap-1">
                                                         <input 
                                                            type="number"
                                                            value={editForm.capacity} 
                                                            onChange={(e) => setEditForm({...editForm, capacity: Number(e.target.value)})}
                                                            className="border rounded p-1 w-16"
                                                            min={1}
                                                         />
                                                         <span className="text-xs">Guests</span>
                                                     </div>
                                                 ) : `${table.capacity} Guests`}
                                             </td>
                                             <td className="p-3 text-end">
                                                 {editingTableId === table.id ? (
                                                     <div className="flex gap-2 justify-end">
                                                         <button 
                                                             onClick={handleUpdateTable}
                                                             className="text-green-600 hover:text-green-800 text-xs font-bold"
                                                         >
                                                             Save
                                                         </button>
                                                         <button 
                                                             onClick={() => setEditingTableId(null)}
                                                             className="text-gray-500 hover:text-gray-700 text-xs"
                                                         >
                                                             Cancel
                                                         </button>
                                                     </div>
                                                 ) : (
                                                     <div className="flex gap-3 justify-end">
                                                         <button 
                                                            onClick={() => startEditTable(table)}
                                                            className="text-blue-500 hover:text-blue-700 underline text-xs"
                                                         >
                                                             Edit
                                                         </button>
                                                         <button 
                                                            onClick={() => handleDeleteTable(table.id)}
                                                            className="text-red-500 hover:text-red-700 underline text-xs"
                                                         >
                                                             Delete
                                                         </button>
                                                     </div>
                                                 )}
                                             </td>
                                         </tr>
                                     ))}
                                     {tables.length === 0 && (
                                         <tr><td colSpan={3} className="p-4 text-center text-gray-400">No tables defined.</td></tr>
                                     )}
                                 </tbody>
                             </table>
                         </div>
                     </div>
                 </div>

                 {/* General Configuration */}
                 <div className="bg-white rounded-xl shadow-lg p-8">
                   <h3 className="text-xl font-serif text-aqiq-primary mb-6 rtl:font-arabic">{t('settings_title')}</h3>
                   <form onSubmit={handleConfigSave} className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t('label_open_time')}</label>
                          <input 
                            type="time" 
                            value={config.openTime}
                            onChange={(e) => setConfig({...config, openTime: e.target.value})}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t('label_close_time')}</label>
                          <input 
                            type="time" 
                            value={config.closeTime}
                            onChange={(e) => setConfig({...config, closeTime: e.target.value})}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Max Session (Minutes)</label>
                        <input 
                          type="number" 
                          value={config.maxSessionDurationMinutes}
                          onChange={(e) => setConfig({...config, maxSessionDurationMinutes: Number(e.target.value)})}
                          className="w-full p-2 border rounded"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('label_duration')} (Default Booking)</label>
                        <input 
                          type="number" 
                          value={config.slotDurationMinutes}
                          onChange={(e) => setConfig({...config, slotDurationMinutes: Number(e.target.value)})}
                          className="w-full p-2 border rounded"
                        />
                     </div>

                     <Button type="submit" className="w-full">{t('btn_save_config')}</Button>
                   </form>
                 </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
};
