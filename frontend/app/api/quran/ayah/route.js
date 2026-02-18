import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const ayah = searchParams.get('ayah');
    const editions = searchParams.get('editions');

    if (!ayah || !editions) {
        return NextResponse.json({ error: 'Missing ayah or editions param' }, { status: 400 });
    }

    try {
        const res = await fetch(
            `https://api.alquran.cloud/v1/ayah/${ayah}/editions/${editions}`,
            { next: { revalidate: 0 } } // no caching — always fresh ayah
        );

        if (!res.ok) {
            return NextResponse.json({ error: 'Upstream API error' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error('[quran proxy]', err);
        return NextResponse.json({ error: 'Failed to fetch from alquran.cloud' }, { status: 500 });
    }
}
