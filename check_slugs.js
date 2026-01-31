
async function listBlogSlugs() {
    try {
        const response = await fetch('http://localhost:5000/api/blogs?limit=100');
        const data = await response.json();

        if (data.success) {
            console.log('Found blogs:', data.blogs.length);
            data.blogs.forEach(blog => {
                console.log(`- "${blog.title}": slug="${blog.slug}"`);
            });
        } else {
            console.log('Failed to fetch blogs:', data);
        }
    } catch (error) {
        console.error('Error fetching blogs:', error.message);
    }
}

listBlogSlugs();
