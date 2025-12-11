
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED', // Reserved for future
  OCCUPIED = 'OCCUPIED',   // Customer checked in
  COMPLETED = 'COMPLETED', // Session ended automatically or manually
  CANCELLED = 'CANCELLED',
  NOSHOW = 'NOSHOW',       // System marked after grace period
  WAITING_LIST = 'WAITING_LIST'
}

export enum TableState {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  OCCUPIED = 'OCCUPIED',
  CLEANING = 'CLEANING',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface Table {
  id: string;
  name: string; // "T1", "Window Table 2"
  capacity: number;
  currentState: TableState; // Real-time state
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  guests: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  tableId?: string; // Assigned table (optional if waiting list)
  note?: string;
  status: ReservationStatus;
  createdAt: number;
  notified?: boolean;
  checkedInAt?: number;
}

export interface WaitingListEntry {
  id: string;
  customerName: string;
  phone: string;
  guests: number;
  date: string;
  startTime: string;
  endTime: string; // Desired duration end
  createdAt: number;
}

export interface ShopConfig {
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  gracePeriodMinutes: number;
  cleaningBufferMinutes: number;
  maxSessionDurationMinutes: number;
}

export interface TimeSlot {
  time: string;
  available: boolean; // Computed based on ANY table availability
}
