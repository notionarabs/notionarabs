import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const method = searchParams.get('method') || '4';

    if (!city) {
        return NextResponse.json({ error: 'Missing city param' }, { status: 400 });
    }

    try {
        // Step 1: Geocode city → lat/lng (server-side, no CSP issue)
        const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'NotionArabs/1.0' } } // Nominatim requires a User-Agent
        );
        const geoData = await geoRes.json();

        let lat, lng, resolvedAddress;
        if (geoData && geoData.length > 0) {
            lat = geoData[0].lat;
            lng = geoData[0].lon;
            resolvedAddress = geoData[0].display_name.split(',').slice(0, 2).join(',');
        } else {
            // Fallback to Riyadh
            lat = 24.7136;
            lng = 46.6753;
            resolvedAddress = city;
        }

        // Step 2: Fetch prayer times (server-side, no CSP issue)
        const prayerRes = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`
        );
        const prayerResult = await prayerRes.json();

        return NextResponse.json({
            ...prayerResult,
            resolvedAddress,
        });
    } catch (err) {
        console.error('[prayer proxy]', err);
        return NextResponse.json({ error: 'Failed to fetch prayer times' }, { status: 500 });
    }
}
