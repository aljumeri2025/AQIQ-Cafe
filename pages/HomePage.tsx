
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { TimeSlot } from '../types';
import * as DB from '../services/db';
import { useLanguage } from '../contexts/LanguageContext';

type Step = 'date' | 'time' | 'details' | 'confirm';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('date');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [bookingRef, setBookingRef] = useState<string>('');
  const [isWaitlistResult, setIsWaitlistResult] = useState(false);
  const [waitingPosition, setWaitingPosition] = useState<number | undefined>(undefined);

  // Load slots when date changes or DB updates
  useEffect(() => {
    if (selectedDate && step === 'time') {
      setLoading(true);
      
      const fetchSlots = () => {
        DB.getSlotsForDate(selectedDate, guests).then(slots => {
          setAvailableSlots(slots);
          setLoading(false);
        });
      };

      fetchSlots();

      // Subscribe to real-time updates
      const unsubscribe = DB.subscribe(() => {
        fetchSlots();
      });

      return () => unsubscribe();
    }
  }, [selectedDate, step, guests]);

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value);
  }

  const handleProceedToTime = () => {
      if(selectedDate) setStep('time');
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDate) return;

    setLoading(true);
    try {
      const result = await DB.createReservation({
        customerName: name,
        phone,
        guests,
        date: selectedDate,
        time: selectedSlot.time,
        note
      }, !selectedSlot.available); // Force waitlist if slot not available

      if (result.status === 'WAITING_LIST' && result.waitingEntry) {
          setBookingRef(result.waitingEntry.id);
          setIsWaitlistResult(true);
          setWaitingPosition(result.position);
      } else if (result.reservation) {
          setBookingRef(result.reservation.id);
          setIsWaitlistResult(false);
      }
      
      setStep('confirm');
    } catch (error) {
      alert(t('alert_error'));
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('date');
    setSelectedDate('');
    setSelectedSlot(null);
    setName('');
    setPhone('');
    setNote('');
    setBookingRef('');
    setIsWaitlistResult(false);
    setWaitingPosition(undefined);
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-aqiq-primary text-aqiq-secondary py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4">Aqiq Café</h1>
          <h2 className="font-arabic text-3xl md:text-4xl mb-8 text-aqiq-light">على العقيق اجتمعنا</h2>
          <p className="text-lg md:text-xl font-light mb-8 max-w-lg mx-auto opacity-90">
            {t('hero_subtitle')}
          </p>
          {step === 'date' && !selectedDate && (
             <Button 
                variant="secondary" 
                onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
             >
               {t('btn_reserve')}
             </Button>
          )}
        </div>
      </section>

      {/* Booking Flow */}
      <section id="booking-section" className="w-full max-w-2xl px-4 py-12 -mt-10 relative z-20">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-10 border-t-4 border-aqiq-accent">
          
          {/* Progress Indicators */}
          {step !== 'confirm' && (
            <div className="flex justify-between mb-8 text-sm font-bold text-gray-400 border-b pb-4">
              <span className={step === 'date' ? 'text-aqiq-primary' : ''}>{t('step_date')}</span>
              <span className={step === 'time' ? 'text-aqiq-primary' : ''}>{t('step_time')}</span>
              <span className={step === 'details' ? 'text-aqiq-primary' : ''}>{t('step_details')}</span>
            </div>
          )}

          {/* STEP 1: Date & Guests Selection */}
          {step === 'date' && (
            <div className="animate-fadeIn">
              <h3 className="text-2xl font-serif text-aqiq-primary mb-6 rtl:font-arabic">{t('select_date')}</h3>
              
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('step_date')}</label>
                    <input
                        type="date"
                        min={today}
                        value={selectedDate}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:border-aqiq-primary focus:ring-1 focus:ring-aqiq-primary outline-none transition"
                        onChange={handleDateSelect}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('label_guests')}</label>
                    <select 
                      value={guests} 
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:border-aqiq-primary focus:ring-1 focus:ring-aqiq-primary outline-none transition bg-white"
                    >
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? t('guest') : t('guests')}</option>)}
                    </select>
                </div>

                <div className="pt-4">
                    <Button onClick={handleProceedToTime} disabled={!selectedDate} className="w-full">
                        Next
                    </Button>
                </div>
              </div>

              <p className="mt-4 text-gray-500 text-sm">{t('open_hours_note')}</p>
            </div>
          )}

          {/* STEP 2: Time Selection */}
          {step === 'time' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-2xl font-serif text-aqiq-primary rtl:font-arabic">{t('select_time')}</h3>
                    <p className="text-sm text-gray-500">{selectedDate} • {guests} {guests === 1 ? t('guest') : t('guests')}</p>
                </div>
                <button onClick={() => { setStep('date'); }} className="text-sm text-gray-500 underline">{t('change_date')}</button>
              </div>
              
              {loading ? (
                <div className="text-center py-10">{t('loading')}</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleSlotSelect(slot)}
                      className={`
                        p-3 rounded-lg border-2 text-center transition relative overflow-hidden group shadow-sm
                        ${!slot.available 
                          ? 'border-red-200 bg-red-50 text-red-800' 
                          : 'border-green-200 bg-green-50 text-green-800 hover:border-green-500 hover:shadow-md'}
                      `}
                    >
                      <span className="font-bold text-lg block">{slot.time}</span>
                      <span className="text-xs uppercase font-bold mt-1 block">
                        {!slot.available ? t('waitlist') : t('available')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Details Form */}
          {step === 'details' && selectedSlot && (
            <form onSubmit={handleSubmit} className="animate-fadeIn space-y-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <h3 className="text-2xl font-serif text-aqiq-primary rtl:font-arabic">{t('your_details')}</h3>
                   <p className="text-gray-600 text-sm">
                     {selectedDate} @ {selectedSlot.time} 
                     {!selectedSlot.available && <span className="text-red-600 font-bold ms-2">{t('join_waitlist_flag')}</span>}
                   </p>
                </div>
                <button type="button" onClick={() => setStep('time')} className="text-sm text-gray-500 underline">{t('change_time')}</button>
              </div>

              {!selectedSlot.available && (
                <div className="bg-red-50 border-s-4 border-red-400 p-4 rounded text-sm text-red-800 mb-4">
                  <strong>{t('waitlist_warning')}</strong>
                </div>
              )}

              {/* Guest count displayed read-only here for clarity since selected earlier */}
              <div className="bg-gray-50 p-3 rounded border">
                <span className="block text-sm font-bold text-gray-700 mb-1">{t('label_guests')}</span>
                <span className="text-lg font-bold">{guests}</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('label_name')}</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-aqiq-primary focus:border-aqiq-primary"
                  placeholder={t('placeholder_name')}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('label_phone')}</label>
                <input 
                  required
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-aqiq-primary focus:border-aqiq-primary text-start"
                  placeholder={t('placeholder_phone')}
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t('label_requests')}</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-aqiq-primary focus:border-aqiq-primary h-24"
                  placeholder={t('placeholder_requests')}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" isLoading={loading}>
                  {!selectedSlot.available ? t('btn_join_waitlist') : t('btn_confirm')}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 4: Confirmation */}
          {step === 'confirm' && (
            <div className="text-center animate-fadeIn py-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isWaitlistResult ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {isWaitlistResult ? (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ) : (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                )}
              </div>
              <h3 className="text-3xl font-serif text-aqiq-primary mb-2 rtl:font-arabic">
                {isWaitlistResult ? t('confirmation_waitlist') : t('confirmation_success')}
              </h3>
              <p className="text-gray-600 mb-8">
                {isWaitlistResult 
                  ? t('confirmation_waitlist_msg') 
                  : t('confirmation_success_msg')}
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg text-start mb-8 max-w-sm mx-auto border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">{t('booking_ref')}</p>
                <p className="text-xl font-mono font-bold text-aqiq-primary mb-4">{bookingRef}</p>
                
                {waitingPosition && (
                    <div className="mb-4 bg-orange-100 p-2 rounded text-center text-orange-800 font-bold border border-orange-200">
                        You are number #{waitingPosition} on the list
                    </div>
                )}

                <p className="text-sm text-gray-500 mb-1">{t('date_time')}</p>
                <p className="font-bold mb-4">{selectedDate} @ {selectedSlot?.time}</p>
                
                <p className="text-sm text-gray-500 mb-1">{t('details')}</p>
                <p className="font-bold">{name} ({guests} {guests === 1 ? t('guest') : t('guests')})</p>
              </div>

              <div className="flex gap-4 justify-center">
                 <Button variant="outline" onClick={resetFlow}>{t('btn_another')}</Button>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
};
