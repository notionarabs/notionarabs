export const detectPlatform = (url) => {
    if (!url) return null;

    const urlLower = url.toLowerCase();

    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
        return { name: 'twitter', icon: 'twitter', color: 'text-sky-500' };
    }
    if (urlLower.includes('instagram.com')) {
        return { name: 'instagram', icon: 'instagram', color: 'text-pink-500' };
    }
    if (urlLower.includes('threads.net')) {
        return { name: 'threads', icon: 'threads', color: 'text-zinc-900 dark:text-zinc-100' };
    }
    if (urlLower.includes('linkedin.com')) {
        return { name: 'linkedin', icon: 'linkedin', color: 'text-blue-500' };
    }
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return { name: 'youtube', icon: 'youtube', color: 'text-red-500' };
    }
    if (urlLower.includes('facebook.com')) {
        return { name: 'facebook', icon: 'facebook', color: 'text-blue-500' };
    }
    if (urlLower.includes('tiktok.com')) {
        return { name: 'tiktok', icon: 'tiktok', color: 'text-zinc-900 dark:text-zinc-100' };
    }
    if (urlLower.includes('snapchat.com')) {
        return { name: 'snapchat', icon: 'snapchat', color: 'text-yellow-500' };
    }
    if (urlLower.includes('pinterest.com')) {
        return { name: 'pinterest', icon: 'pinterest', color: 'text-red-600' };
    }
    if (urlLower.includes('telegram.org') || urlLower.includes('t.me')) {
        return { name: 'telegram', icon: 'telegram', color: 'text-sky-400' };
    }
    if (urlLower.includes('discord.com') || urlLower.includes('discord.gg')) {
        return { name: 'discord', icon: 'discord', color: 'text-indigo-400' };
    }
    if (urlLower.includes('github.com')) {
        return { name: 'github', icon: 'github', color: 'text-zinc-800 dark:text-zinc-200' };
    }
    if (urlLower.includes('behance.net')) {
        return { name: 'behance', icon: 'behance', color: 'text-blue-500' };
    }
    if (urlLower.includes('dribbble.com')) {
        return { name: 'dribbble', icon: 'dribbble', color: 'text-pink-500' };
    }
    if (urlLower.includes('whatsapp.com') || urlLower.includes('wa.me')) {
        return { name: 'whatsapp', icon: 'whatsapp', color: 'text-emerald-500' };
    }

    return { name: 'website', icon: 'website', color: 'text-primary-500' };
};

export const isValidSocialMediaUrl = (url) => {
    if (!url) return false;
    // Accept any string that looks like a domain or URL
    return url.trim().length > 0;
};
