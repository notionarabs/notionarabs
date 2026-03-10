import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const unit = searchParams.get('unit') || 'celsius';

    let lat, lng, resolvedAddress, timezone;

    try {
        if (!city) {
            // Step 0: Detect location via IP
            const vercelLat = request.headers.get('x-vercel-ip-latitude');
            const vercelLon = request.headers.get('x-vercel-ip-longitude');
            const vercelCity = request.headers.get('x-vercel-ip-city');
            const vercelCountry = request.headers.get('x-vercel-ip-country');

            if (vercelLat && vercelLon) {
                lat = vercelLat;
                lng = vercelLon;
                resolvedAddress = vercelCity ? `${vercelCity}, ${vercelCountry || ''}` : 'Detected Location';
            } else {
                const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip');
                const ipRes = await fetch(`http://ip-api.com/json/${ip || ''}`);
                const ipData = await ipRes.json();

                if (ipData.status === 'success') {
                    lat = ipData.lat;
                    lng = ipData.lon;
                    resolvedAddress = `${ipData.city}, ${ipData.country}`;
                } else {
                    lat = 24.7136;
                    lng = 46.6753;
                    resolvedAddress = 'Riyadh';
                }
            }
        } else {
            // Step 1: Geocode city name
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
                { headers: { 'User-Agent': 'NotionArabs/1.0' } }
            );
            const geoData = await geoRes.json();

            if (geoData && geoData.length > 0) {
                lat = geoData[0].lat;
                lng = geoData[0].lon;
                resolvedAddress = geoData[0].display_name.split(',').slice(0, 1).join('');
            } else {
                lat = 24.7136;
                lng = 46.6753;
                resolvedAddress = city;
            }
        }

        // Step 2: Fetch Weather from Open-Meteo
        const unitParam = unit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto${unitParam}`
        );
        const weatherData = await weatherRes.json();

        return NextResponse.json({
            ...weatherData,
            resolvedAddress,
            lat,
            lon: lng
        });

    } catch (err) {
        console.error('[weather proxy]', err);
        return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }
}
