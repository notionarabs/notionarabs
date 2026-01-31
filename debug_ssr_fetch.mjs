
// Mocking getApiBaseUrl logic
function getApiBaseUrl() {
    return 'http://127.0.0.1:5000/api';
}

async function getBlog(slug) {
    const apiUrl = getApiBaseUrl();
    console.log(`[getBlog] Fetching blog with slug: ${slug}`);
    console.log(`[getBlog] API URL: ${apiUrl}/blogs/${encodeURIComponent(slug)}`);

    try {
        const res = await fetch(`${apiUrl}/blogs/${encodeURIComponent(slug)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log(`[getBlog] Response status: ${res.status}`);

        if (!res.ok) {
            if (res.status === 404) {
                console.warn(`[getBlog] Blog not found (404)`);
                return null;
            }
            const text = await res.text();
            console.error(`[getBlog] Failed to fetch blog, status: ${res.status}, body: ${text.substring(0, 200)}`);
            return null;
        }

        const data = await res.json();

        // Check if success is true
        if (!data.success || !data.blog) {
            console.error(`[getBlog] API returned success: false or no blog data. Data:`, JSON.stringify(data).substring(0, 200));
            return null;
        }

        console.log("Success! Blog found:", data.blog.title);
        return data;
    } catch (error) {
        console.error('[getBlog] Error fetching blog:', error);
        return null;
    }
}

// Test with the specific slug
getBlog('ma-hw-nwshn');
