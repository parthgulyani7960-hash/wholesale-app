
import React, { useState } from 'react';

interface DeliverySchedulerProps {
    onSelectSlot: (slot: string) => void;
}

const DeliveryScheduler: React.FC<DeliverySchedulerProps> = ({ onSelectSlot }) => {
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const generateTimeSlots = () => {
        const slots = [];
        const today = new Date();
        const timeOptions = ["9 AM - 12 PM", "1 PM - 4 PM", "5 PM - 8 PM"];

        for (let i = 0; i < 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString(undefined, { weekday: 'long' });
            
            slots.push({
                day: dayLabel,
                date: date.toLocaleDateString(),
                times: timeOptions,
            });
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const handleSelect = (dayLabel: string, time: string) => {
        const fullSlot = `${dayLabel}, ${time}`;
        setSelectedSlot(fullSlot);
        onSelectSlot(fullSlot);
    };

    return (
        <div className="space-y-4">
            {timeSlots.map(daySlot => (
                <div key={daySlot.day}>
                    <p className="font-semibold text-sm text-gray-800">{daySlot.day} <span className="text-gray-500 font-normal">({daySlot.date})</span></p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {daySlot.times.map(time => {
                             const fullSlot = `${daySlot.day}, ${time}`;
                             const isSelected = selectedSlot === fullSlot;
                             return (
                                <button
                                    type="button"
                                    key={time}
                                    onClick={() => handleSelect(daySlot.day, time)}
                                    className={`p-2 border rounded-md text-xs transition-all duration-200 ${
                                        isSelected 
                                        ? 'bg-primary text-white border-primary shadow-md' 
                                        : 'bg-white hover:border-accent hover:text-accent'
                                    }`}
                                >
                                    {time}
                                </button>
                             )
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DeliveryScheduler;
