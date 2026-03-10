import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
        return NextResponse.json({ error: 'Missing city parameter' }, { status: 400 });
    }

    try {
        // Step 1: Geocode city name to lat/lon
        const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
            { headers: { 'User-Agent': 'NotionArabs/1.0' } }
        );
        const geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
            const { lat, lon } = geoData[0];

            // Step 2: Fetch timezone from Open-Meteo
            const timezoneRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
            );
            const timezoneData = await timezoneRes.json();

            if (timezoneData && timezoneData.timezone) {
                return NextResponse.json({ timezone: timezoneData.timezone });
            }
        }

        return NextResponse.json({ error: 'Timezone not found for city' }, { status: 404 });

    } catch (err) {
        console.error('[timezone proxy]', err);
        return NextResponse.json({ error: 'Failed to fetch timezone data' }, { status: 500 });
    }
}
