
import { Reservation, ReservationStatus, Table, TableState, ShopConfig, TimeSlot, WaitingListEntry } from '../types';

const DB_KEY = 'aqiq_cafe_db';
const TABLES_KEY = 'aqiq_cafe_tables';
const CONFIG_KEY = 'aqiq_cafe_config';
const WAITING_KEY = 'aqiq_cafe_waiting';

// --- Default Data ---

const DEFAULT_CONFIG: ShopConfig = {
  openTime: "04:00",
  closeTime: "24:00", // Midnight
  slotDurationMinutes: 60,
  gracePeriodMinutes: 15,
  cleaningBufferMinutes: 5,
  maxSessionDurationMinutes: 120, // 2 hours max
};

// Initialize Tables if not present
const INITIAL_TABLES: Table[] = [
  { id: 't1', name: 'T1', capacity: 2, currentState: TableState.AVAILABLE },
  { id: 't2', name: 'T2', capacity: 2, currentState: TableState.AVAILABLE },
  { id: 't3', name: 'T3', capacity: 2, currentState: TableState.AVAILABLE },
  { id: 't4', name: 'T4', capacity: 4, currentState: TableState.AVAILABLE },
  { id: 't5', name: 'T5', capacity: 4, currentState: TableState.AVAILABLE },
  { id: 't6', name: 'T6', capacity: 4, currentState: TableState.AVAILABLE },
  { id: 't7', name: 'T7', capacity: 6, currentState: TableState.AVAILABLE },
  { id: 't8', name: 'T8', capacity: 6, currentState: TableState.AVAILABLE },
  { id: 't9', name: 'T9', capacity: 8, currentState: TableState.AVAILABLE },
];

// --- Helpers ---

const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = <T>(key: string, val: T) => {
  localStorage.setItem(key, JSON.stringify(val));
};

const notifyChange = () => {
  window.dispatchEvent(new Event('storage-update'));
};

export const subscribe = (listener: () => void) => {
  const handler = () => listener();
  window.addEventListener('storage-update', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('storage-update', handler);
    window.removeEventListener('storage', handler);
  };
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Time Utils
const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const fromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const addMinutes = (time: string, minutes: number) => fromMinutes(toMinutes(time) + minutes);

const getCurrentTimeMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- Core Data Access ---

export const getConfig = (): ShopConfig => getStorage(CONFIG_KEY, DEFAULT_CONFIG);
export const updateConfig = async (cfg: ShopConfig) => {
  setStorage(CONFIG_KEY, cfg);
  notifyChange();
};

export const getTables = (): Table[] => getStorage(TABLES_KEY, INITIAL_TABLES);
const saveTables = (tables: Table[]) => {
    setStorage(TABLES_KEY, tables);
    notifyChange();
}

// Table Management Actions
export const addTable = async (name: string, capacity: number) => {
    await delay(200);
    const tables = getTables();
    const newTable: Table = {
        id: Math.random().toString(36).substr(2, 6),
        name,
        capacity,
        currentState: TableState.AVAILABLE
    };
    tables.push(newTable);
    saveTables(tables);
};

export const updateTable = async (id: string, updates: Partial<Omit<Table, 'id'>>) => {
    await delay(200);
    const tables = getTables();
    const index = tables.findIndex(t => t.id === id);
    if (index !== -1) {
        tables[index] = { ...tables[index], ...updates };
        saveTables(tables);
    }
};

export const deleteTable = async (id: string) => {
    await delay(200);
    const tables = getTables();
    const newTables = tables.filter(t => t.id !== id);
    saveTables(newTables);
};

export const getReservations = (): Reservation[] => getStorage(DB_KEY, []);
const saveReservations = (res: Reservation[]) => {
  setStorage(DB_KEY, res);
  notifyChange();
};

export const getWaitingList = (): WaitingListEntry[] => getStorage(WAITING_KEY, []);
const saveWaitingList = (list: WaitingListEntry[]) => {
  setStorage(WAITING_KEY, list);
  notifyChange();
};

// --- Reservation Engine Logic ---

/**
 * Check if a specific table is free for a given time range on a date.
 * Considers: Overlapping reservations, Cleaning buffer.
 */
const isTableFree = (
  tableId: string,
  date: string,
  startMins: number,
  endMins: number,
  excludeReservationId?: string
): boolean => {
  const reservations = getReservations();
  const config = getConfig();

  return !reservations.some(r => {
    if (r.id === excludeReservationId) return false;
    if (r.tableId !== tableId) return false;
    if (r.date !== date) return false;
    if ([ReservationStatus.CANCELLED, ReservationStatus.NOSHOW, ReservationStatus.WAITING_LIST].includes(r.status)) return false;

    // Check overlap
    // Existing: [rStart, rEnd]
    // New:      [start, end]
    // Overlap if: start < rEnd + buffer && end > rStart
    // Note: We add cleaning buffer to the EXISTING reservation's end time to block it.
    const rStartMins = toMinutes(r.startTime);
    let rEndMins = toMinutes(r.endTime);
    
    // Add cleaning buffer if the reservation is CONFIRMED, OCCUPIED, or COMPLETED
    if (r.status !== ReservationStatus.PENDING) {
        rEndMins += config.cleaningBufferMinutes;
    }

    return startMins < rEndMins && endMins > rStartMins;
  });
};

/**
 * Find the best available table for specific criteria.
 */
const findBestTable = (
  date: string,
  startTime: string,
  endTime: string,
  guests: number
): Table | null => {
  const tables = getTables();
  const startMins = toMinutes(startTime);
  const endMins = toMinutes(endTime);

  // Filter candidates
  const candidates = tables.filter(t => 
    t.currentState !== TableState.OUT_OF_SERVICE &&
    t.capacity >= guests &&
    isTableFree(t.id, date, startMins, endMins)
  );

  // Sort by capacity (best fit) then name
  candidates.sort((a, b) => (a.capacity - b.capacity) || a.name.localeCompare(b.name));

  return candidates.length > 0 ? candidates[0] : null;
};

// --- Public Actions ---

export const createReservation = async (
  data: {
    customerName: string;
    phone: string;
    guests: number;
    date: string;
    time: string; // Start Time
    note?: string;
  },
  forceWaitlist: boolean = false
): Promise<{ reservation?: Reservation; waitingEntry?: WaitingListEntry; status: 'CONFIRMED' | 'WAITING_LIST'; position?: number }> => {
  await delay(500);
  const config = getConfig();
  const endTime = addMinutes(data.time, config.slotDurationMinutes);
  
  let assignedTable: Table | null = null;

  if (!forceWaitlist) {
    assignedTable = findBestTable(data.date, data.time, endTime, data.guests);
  }

  if (assignedTable) {
    // Create Confirmed Reservation
    const newReservation: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: data.customerName,
      phone: data.phone,
      guests: data.guests,
      date: data.date,
      startTime: data.time,
      endTime: endTime,
      tableId: assignedTable.id,
      note: data.note,
      status: ReservationStatus.CONFIRMED,
      createdAt: Date.now()
    };
    
    const all = getReservations();
    all.push(newReservation);
    saveReservations(all);
    return { reservation: newReservation, status: 'CONFIRMED' };
  } else {
    // Add to Waiting List
    const newEntry: WaitingListEntry = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: data.customerName,
      phone: data.phone,
      guests: data.guests,
      date: data.date,
      startTime: data.time,
      endTime: endTime,
      createdAt: Date.now()
    };
    
    const waiting = getWaitingList();
    waiting.push(newEntry);
    saveWaitingList(waiting);
    
    // Calculate position in queue for this specific time block (roughly)
    const position = waiting.filter(w => w.date === data.date).length;

    return { waitingEntry: newEntry, status: 'WAITING_LIST', position };
  }
};

export const checkInReservation = async (id: string): Promise<boolean> => {
  await delay(300);
  const reservations = getReservations();
  const res = reservations.find(r => r.id === id);
  
  if (!res || res.status !== ReservationStatus.CONFIRMED) return false;

  res.status = ReservationStatus.OCCUPIED;
  res.checkedInAt = Date.now();
  saveReservations(reservations);
  
  // Update Table State Immediately (Optional for UI, logic uses reservation status)
  return true;
};

export const extendSession = async (id: string, additionalMinutes: number): Promise<{ success: boolean; message?: string }> => {
  await delay(400);
  const reservations = getReservations();
  const res = reservations.find(r => r.id === id);

  if (!res || res.status !== ReservationStatus.OCCUPIED) {
    return { success: false, message: "Reservation not active." };
  }

  const currentEndMins = toMinutes(res.endTime);
  const newEndMins = currentEndMins + additionalMinutes;
  
  // Check if table is free for the extension
  if (!res.tableId || !isTableFree(res.tableId, res.date, currentEndMins, newEndMins, res.id)) {
    return { success: false, message: "Table booked for next slot." };
  }

  // Check Max Duration
  const startMins = toMinutes(res.startTime);
  const config = getConfig();
  if ((newEndMins - startMins) > config.maxSessionDurationMinutes) {
      return { success: false, message: "Exceeds maximum session limit." };
  }

  res.endTime = fromMinutes(newEndMins);
  saveReservations(reservations);
  return { success: true };
};

export const cancelReservation = async (id: string): Promise<void> => {
  await delay(300);
  const reservations = getReservations();
  const res = reservations.find(r => r.id === id);
  if (res) {
    res.status = ReservationStatus.CANCELLED;
    saveReservations(reservations);
    // TODO: Trigger logic to auto-assign waitlist?
  }
};

export const promoteFromWaitlist = async (entryId: string, tableId: string): Promise<Reservation | null> => {
    const waiting = getWaitingList();
    const entryIndex = waiting.findIndex(w => w.id === entryId);
    if(entryIndex === -1) return null;

    const entry = waiting[entryIndex];
    
    // Convert to reservation
    const newRes: Reservation = {
        id: Math.random().toString(36).substr(2, 9),
        customerName: entry.customerName,
        phone: entry.phone,
        guests: entry.guests,
        date: entry.date,
        startTime: entry.startTime,
        endTime: entry.endTime,
        tableId: tableId,
        status: ReservationStatus.CONFIRMED,
        createdAt: Date.now(),
        notified: true // Flag that they were promoted
    };

    const reservations = getReservations();
    reservations.push(newRes);
    saveReservations(reservations);

    // Remove from waitlist
    waiting.splice(entryIndex, 1);
    saveWaitingList(waiting);

    return newRes;
};

// --- Automated Engine (The "Cron Job") ---

export const runAutomatedChecks = () => {
  const reservations = getReservations();
  const config = getConfig();
  const now = new Date();
  const today = getTodayDateString();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  let changed = false;

  reservations.forEach(r => {
    // 1. Auto No-Show
    // If confirmed, date is today, and time > start + grace
    if (r.status === ReservationStatus.CONFIRMED && r.date === today) {
      const startMins = toMinutes(r.startTime);
      if (currentMins > (startMins + config.gracePeriodMinutes)) {
        r.status = ReservationStatus.NOSHOW;
        changed = true;
        console.log(`[Auto] Marked ${r.id} as No-Show`);
      }
    }

    // 2. Auto Complete
    // If occupied, date is today, and time > end
    if (r.status === ReservationStatus.OCCUPIED && r.date === today) {
      const endMins = toMinutes(r.endTime);
      if (currentMins > endMins) {
        r.status = ReservationStatus.COMPLETED;
        changed = true;
        console.log(`[Auto] Marked ${r.id} as Completed`);
      }
    }
  });

  if (changed) {
    saveReservations(reservations);
  }
};

// --- Views ---

export const getSlotsForDate = async (date: string, guests: number = 2): Promise<TimeSlot[]> => {
  // Return slots indicating if ANY table is available
  await delay(400); // Simulate network
  const config = getConfig();
  const slots: TimeSlot[] = [];
  
  let current = toMinutes(config.openTime);
  const end = toMinutes(config.closeTime);

  while (current < end) {
    const timeStr = fromMinutes(current);
    const endTimeStr = fromMinutes(current + config.slotDurationMinutes);
    
    // Check if ANY table matches criteria (using requested capacity)
    const bestTable = findBestTable(date, timeStr, endTimeStr, guests);
    
    slots.push({
      time: timeStr,
      available: !!bestTable
    });

    current += config.slotDurationMinutes;
  }
  return slots;
};

export const getTableStatusGrid = (date: string) => {
    // Returns a snapshot of tables for the dashboard
    const tables = getTables();
    const reservations = getReservations().filter(r => r.date === date && 
        [ReservationStatus.CONFIRMED, ReservationStatus.OCCUPIED].includes(r.status));
    
    return tables.map(t => {
        const res = reservations.find(r => r.tableId === t.id);
        return {
            ...t,
            currentReservation: res
        };
    });
};
