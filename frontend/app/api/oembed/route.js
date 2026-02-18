import { NextResponse } from 'next/server';

/**
 * oEmbed endpoint — tells Notion (and other platforms) that our widget URLs
 * are embeddable iframes, so they render as rich embeds instead of link previews.
 *
 * Notion checks for oEmbed when you paste a URL. If it finds this endpoint
 * (via the <link rel="alternate" type="application/json+oembed"> tag in the page head),
 * it will use the iframe embed automatically.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const maxWidth = parseInt(searchParams.get('maxwidth') || '800');
    const maxHeight = parseInt(searchParams.get('maxheight') || '400');

    if (!url) {
        return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    // Only serve oEmbed for our own widget embed URLs
    if (!url.includes('/widgets/') || !url.includes('/embed')) {
        return NextResponse.json({ error: 'URL not supported' }, { status: 404 });
    }

    const width = Math.min(maxWidth, 800);
    const height = Math.min(maxHeight, 400);

    return NextResponse.json({
        type: 'rich',
        version: '1.0',
        title: 'Notion Arabs Widget',
        provider_name: 'Notion Arabs',
        provider_url: 'https://www.notionarabs.com',
        width,
        height,
        html: `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" allowtransparency="true" style="border:none;border-radius:16px;"></iframe>`,
    });
}
