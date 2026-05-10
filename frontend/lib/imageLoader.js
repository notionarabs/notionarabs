export default function imageLoader({ src, width, quality }) {
    if (!src) return '';

    // 1. Cloudinary Optimization
    if (src.includes('res.cloudinary.com')) {
        const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
        return src.replace('/upload/', `/upload/${params.join(',')}/`);
    }

    // 2. Unsplash Optimization
    if (src.includes('images.unsplash.com')) {
        const url = new URL(src);
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'max');
        url.searchParams.set('w', width.toString());
        if (quality) url.searchParams.set('q', quality.toString());
        return url.href;
    }

    // 3. Google Profile Pictures Optimization (e.g., lh3.googleusercontent.com)
    if (src.includes('googleusercontent.com')) {
        // Google avatars size modifier is at the end: =s400-c or =s96-c.
        // We strip any existing modifier and append the correct width.
        const cleanSrc = src.split('=')[0];
        return `${cleanSrc}=s${width}-c`;
    }

    // 4. Local images (starts with /) or local dev server
    if (src.startsWith('/') || src.startsWith('http://localhost') || src.startsWith('http://127.0.0.1')) {
        return src;
    }

    // 5. Fallback for other external domains: append width as query parameter to satisfy Next.js loader requirements
    try {
        const url = new URL(src);
        url.searchParams.set('w', width.toString());
        return url.href;
    } catch (e) {
        return src;
    }
}
