export default function imageLoader({ src, width, quality }) {
    // Cloudinary
    if (src.includes('res.cloudinary.com')) {
        const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
        return src.replace('/upload/', `/upload/${params.join(',')}/`);
    }

    // Unsplash
    if (src.includes('images.unsplash.com')) {
        const url = new URL(src);
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'max');
        url.searchParams.set('w', width.toString());
        if (quality) url.searchParams.set('q', quality.toString());
        return url.href;
    }

    // Local images or other providers (no transformation)
    return src;
}
