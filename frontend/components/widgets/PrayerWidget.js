'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, CalendarDays, Moon, Settings } from 'lucide-react';

export default function PrayerWidget({
    theme = 'dark',
    city = 'Riyadh',
    method = 4,
    font = 'tajawal',
    id = 'prayer'
}) {
    const [editUrl, setEditUrl] = useState('#');

    useEffect(() => {
        setEditUrl(`${window.location.origin}/widgets/${id}?theme=${theme}&font=${font}&city=${city}`);
    }, [id, theme, font, city]);

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa'
    };
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resolvedAddress, setResolvedAddress] = useState(city);

    useEffect(() => {
        const fetchTimes = async () => {
            try {
                setLoading(true);

                // Single proxy call — geocoding + prayer times handled server-side
                const res = await fetch(`/api/prayer/times?city=${encodeURIComponent(city)}&method=${method}`);
                const result = await res.json();

                if (result.code === 200) {
                    setData(result.data);
                    setResolvedAddress(result.resolvedAddress || city);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchTimes, 600);
        return () => clearTimeout(timeoutId);
    }, [city, method]);

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
    );

    const prayers = [
        { name: 'الفجر', key: 'Fajr' },
        { name: 'الظهر', key: 'Dhuhr' },
        { name: 'العصر', key: 'Asr' },
        { name: 'المغرب', key: 'Maghrib' },
        { name: 'العشاء', key: 'Isha' }
    ];

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'م' : 'ص';
        const displayHours = h % 12 || 12;
        return `${displayHours}:${minutes} ${ampm}`;
    };

    const getNextPrayer = () => {
        if (!data?.timings) return null;
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        for (const prayer of prayers) {
            const [hours, minutes] = data.timings[prayer.key].split(':');
            const prayerTime = parseInt(hours) * 60 + parseInt(minutes);
            if (prayerTime > currentTime) return prayer.key;
        }
        return 'Fajr';
    };

    const nextPrayerKey = getNextPrayer();

    return (
        <div className={`w-full p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 relative group overflow-hidden ${fontClasses[font]} ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-[#2f2f2f]'
            : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            }`}>
            {/* Edit Button */}
            <a
                href={editUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 p-2 rounded-full bg-gray-500/10 hover:bg-primary-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 z-50 text-gray-400"
                title="تعديل الأداة"
            >
                <Settings className="w-4 h-4" />
            </a>

            <div className="flex flex-col space-y-8" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Moon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{data?.date?.hijri?.day} {data?.date?.hijri?.month?.ar} {data?.date?.hijri?.year}</h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {resolvedAddress}
                            </p>
                        </div>
                    </div>
                    <div className="text-left" dir="ltr">
                        <div className="text-sm font-black text-primary-500">{data?.date?.readable}</div>
                        <div className="text-[10px] text-gray-400 tracking-widest uppercase">{data?.date?.hijri?.weekday?.ar}</div>
                    </div>
                </div>

                {/* Times Grid */}
                <div className="grid grid-cols-5 gap-2 sm:gap-4">
                    {prayers.map((prayer) => {
                        const isNext = prayer.key === nextPrayerKey;
                        return (
                            <div key={prayer.key} className={`flex flex-col items-center p-3 sm:p-4 rounded-3xl transition-all ${isNext
                                ? 'bg-primary-500 text-white shadow-glow scale-105 z-10 border border-primary-400'
                                : theme === 'dark' ? 'bg-dark-tertiary border border-transparent' : 'bg-secondary-50 border border-transparent'
                                }`}>
                                <span className={`text-[10px] sm:text-xs mb-1 font-bold ${isNext ? 'text-white/90' : 'text-gray-500'}`}>{prayer.name}</span>
                                <span className={`text-[10px] sm:text-sm font-black whitespace-nowrap ${isNext ? 'text-white' : 'text-primary-500'}`}>
                                    {formatTime(data?.timings[prayer.key])}
                                </span>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
