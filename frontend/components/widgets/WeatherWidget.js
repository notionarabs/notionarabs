'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Wind, MapPin, Search, RefreshCw, Thermometer, Droplets, Navigation } from 'lucide-react';

const WEATHER_CODES = {
    0: { label: 'Clear sky', icon: <Sun className="w-8 h-8 text-yellow-400" />, bg: 'from-blue-400 to-blue-600' },
    1: { label: 'Mainly clear', icon: <Sun className="w-8 h-8 text-yellow-200" />, bg: 'from-blue-300 to-blue-500' },
    2: { label: 'Partly cloudy', icon: <Cloud className="w-8 h-8 text-gray-200" />, bg: 'from-blue-300 to-gray-400' },
    3: { label: 'Overcast', icon: <Cloud className="w-8 h-8 text-gray-400" />, bg: 'from-gray-400 to-gray-600' },
    45: { label: 'Fog', icon: <Wind className="w-8 h-8 text-gray-300" />, bg: 'from-gray-300 to-gray-500' },
    48: { label: 'Depositing rime fog', icon: <Wind className="w-8 h-8 text-gray-400" />, bg: 'from-gray-400 to-gray-600' },
    51: { label: 'Light drizzle', icon: <CloudRain className="w-8 h-8 text-blue-300" />, bg: 'from-blue-200 to-blue-400' },
    53: { label: 'Moderate drizzle', icon: <CloudRain className="w-8 h-8 text-blue-400" />, bg: 'from-blue-300 to-blue-500' },
    55: { label: 'Dense drizzle', icon: <CloudRain className="w-8 h-8 text-blue-500" />, bg: 'from-blue-400 to-blue-600' },
    61: { label: 'Slight rain', icon: <CloudRain className="w-8 h-8 text-blue-400" />, bg: 'from-blue-500 to-blue-700' },
    63: { label: 'Moderate rain', icon: <CloudRain className="w-8 h-8 text-blue-600" />, bg: 'from-blue-600 to-indigo-700' },
    65: { label: 'Heavy rain', icon: <CloudRain className="w-8 h-8 text-indigo-600" />, bg: 'from-indigo-700 to-purple-800' },
    71: { label: 'Slight snow fall', icon: <CloudSnow className="w-8 h-8 text-white" />, bg: 'from-blue-100 to-blue-300' },
    73: { label: 'Moderate snow fall', icon: <CloudSnow className="w-8 h-8 text-gray-100" />, bg: 'from-blue-200 to-white' },
    75: { label: 'Heavy snow fall', icon: <CloudSnow className="w-8 h-8 text-white" />, bg: 'from-gray-100 to-white' },
    95: { label: 'Thunderstorm', icon: <CloudLightning className="w-8 h-8 text-yellow-500" />, bg: 'from-gray-700 to-indigo-900' },
};

const DEFAULT_WEATHER = { label: 'Cloudy', icon: <Cloud className="w-8 h-8" />, bg: 'from-gray-400 to-gray-600' };

export default function WeatherWidget({
    theme = 'dark',
    font = 'tajawal',
    city = '',
    unit = 'celsius',
    showForecast = true,
    id = 'weather'
}) {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState(city || 'Detecting...');
    const [coords, setCoords] = useState(null);
    const [mounted, setMounted] = useState(false);

    const fetchWeather = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}&unit=${unit}`);
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else {
                setWeatherData(data);
                setLocationName(data.resolvedAddress || city || 'Detecting...');
                setCoords({ lat: data.lat, lon: data.lon });
                setError(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when city or unit changes
    useEffect(() => {
        setMounted(true);
        fetchWeather();
    }, [city, unit]);

    // Unit handling is now combined in the primary effect above

    const fontClasses = {
        tajawal: 'font-tajawal',
        cairo: 'font-cairo',
        amiri: 'font-amiri',
        almarai: 'font-almarai',
        changa: 'font-changa',
        'reem-kufi': 'font-reem-kufi',
        'aref-ruqaa': 'font-aref-ruqaa'
    };

    if (loading) {
        return (
            <div className={`w-full max-w-sm p-8 rounded-[2rem] animate-pulse flex flex-col items-center justify-center space-y-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                <span className="text-sm font-bold text-gray-400">تحميل الطقس...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-sm p-8 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-red-500 font-bold mb-2">عذراً، حدث خطأ</p>
                <p className="text-xs text-red-400/80">{error}</p>
                <button onClick={fetchWeather} className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary-500 hover:text-primary-400 underline">إعادة المحاولة</button>
            </div>
        );
    }

    if (!mounted || !weatherData) return null;

    const current = weatherData?.current_weather;
    const weatherInfo = WEATHER_CODES[current?.weathercode] || DEFAULT_WEATHER;

    return (
        <div className={`w-full max-w-sm p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 ${fontClasses[font] || 'font-tajawal'} ${theme === 'dark'
            ? 'bg-[#191919] text-white border border-white/5 shadow-2xl'
            : 'bg-white text-accent-900 border border-gray-100 shadow-xl'
            }`} dir="rtl">

            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${weatherInfo.bg} opacity-[0.03] transition-all duration-1000 group-hover:opacity-[0.07]`}></div>

            <div className="relative z-10 flex flex-col space-y-6">
                {/* Header: Location */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-black flex items-center gap-2 group/loc">
                            {locationName}
                            <MapPin className="w-4 h-4 text-primary-500 group-hover/loc:animate-bounce" />
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <button
                        onClick={fetchWeather}
                        className="p-2 rounded-xl bg-gray-500/5 hover:bg-primary-500/10 text-gray-400 hover:text-primary-500 transition-all border border-transparent hover:border-primary-500/20"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Main: Temperature & Icon */}
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black tracking-tighter tabular-nums drop-shadow-md">
                            {Math.round(current?.temperature)}
                        </span>
                        <span className="text-2xl font-bold text-primary-500">°</span>
                        <span className="text-sm font-bold text-gray-400 ml-2 uppercase tabular-nums">
                            {unit === 'celsius' ? 'C' : 'F'}
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-4 rounded-3xl bg-gray-500/5 backdrop-blur-sm border border-white/5 animate-float">
                            {weatherInfo.icon}
                        </div>
                        <span className="text-xs font-bold text-gray-400 text-center">
                            {weatherInfo.label}
                        </span>
                    </div>
                </div>

                {/* Details Bar */}
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
                    <div className="flex flex-col items-center gap-1">
                        <Wind className="w-4 h-4 text-primary-400" />
                        <span className="text-[10px] font-black tabular-nums">{current?.windspeed} كم/س</span>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">الرياح</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-x border-white/5">
                        <Navigation className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black tabular-nums">{current?.winddirection}°</span>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">الاتجاه</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Thermometer className="w-4 h-4 text-orange-400" />
                        <span className="text-[10px] font-black tabular-nums">
                            {Math.round(weatherData?.daily?.temperature_2m_max?.[0] || 0)}° / {Math.round(weatherData?.daily?.temperature_2m_min?.[0] || 0)}°
                        </span>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">العظمى/الصغرى</span>
                    </div>
                </div>

                {/* Forecast */}
                {showForecast && (
                    <div className="space-y-4 pt-2">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">التوقعات القادمة</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map((idx) => {
                                const dayCode = weatherData?.daily?.weathercode?.[idx];
                                const dayInfo = WEATHER_CODES[dayCode] || DEFAULT_WEATHER;
                                const date = new Date();
                                date.setDate(date.getDate() + idx);

                                return (
                                    <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-gray-500/5 border border-white/5 group/day hover:bg-primary-500/5 hover:border-primary-500/20 transition-all">
                                        <span className="text-[9px] font-black text-gray-400 mb-2 truncate w-full text-center">
                                            {date.toLocaleDateString('ar-EG', { weekday: 'short' })}
                                        </span>
                                        <div className="mb-2 transition-transform group-hover/day:scale-110 duration-300">
                                            {dayInfo.icon}
                                        </div>
                                        <span className="text-[10px] font-black tabular-nums">
                                            {Math.round(weatherData?.daily?.temperature_2m_max?.[idx] || 0)}°
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Animated Glow in Background */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        </div>
    );
}

