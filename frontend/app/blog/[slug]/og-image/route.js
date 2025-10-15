import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
    // Fetch blog data
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs.onrender.com/api'
      : 'http://localhost:5000/api';

    let blog = null;
    try {
      const response = await fetch(`${apiUrl}/blogs/${slug}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.blog) {
          blog = data.blog;
        }
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
    }

    // Fallback blog data
    if (!blog) {
      blog = {
        title: 'مقال عن قوالب نوشن',
        excerpt: 'مقال مفيد عن استخدام قوالب Notion باللغة العربية',
        author: { name: 'مبدع', displayName: 'مبدع قوالب نوشن' },
        category: 'نصائح',
        featuredImage: null
      };
    }

    const blogTitle = blog.title || 'مقال عن قوالب نوشن';
    const blogExcerpt = blog.excerpt || blog.description || 'مقال مفيد عن استخدام قوالب Notion باللغة العربية';
    const authorName = blog.author?.displayName || blog.author?.name || 'مبدع';
    const category = blog.category || 'نصائح';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fafafa',
            backgroundImage: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Logo - Top Left */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <img
              src={`${process.env.NODE_ENV === 'production' ? 'https://www.notionarabs.com' : 'http://localhost:3000'}/favicon.png`}
              alt="عرب نوشن"
              style={{
                height: '32px',
                width: '32px',
              }}
            />
            <span
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1a1a1a',
              }}
            >
              عرب نوشن
            </span>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
              paddingTop: '100px',
            }}
          >
            {/* Left Section - Blog Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
                paddingRight: '40px',
              }}
            >
              {/* Category Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '20px',
                  width: 'fit-content',
                }}
              >
                {category}
              </div>

              {/* Blog Title */}
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  lineHeight: 1.2,
                  marginBottom: '16px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {blogTitle}
              </div>

              {/* Blog Excerpt */}
              <div
                style={{
                  fontSize: '20px',
                  color: '#666666',
                  lineHeight: 1.4,
                  marginBottom: '20px',
                }}
              >
                {blogExcerpt.length > 120 ? blogExcerpt.substring(0, 120) + '...' : blogExcerpt}
              </div>

              {/* Author */}
              <div
                style={{
                  fontSize: '18px',
                  color: '#1a1a1a',
                  fontWeight: '500',
                }}
              >
                بقلم {authorName}
              </div>
            </div>

            {/* Right Section - Blog Image */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '400px',
                height: '300px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              {blog.featuredImage ? (
                <img
                  src={blog.featuredImage}
                  alt={blogTitle}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '10px',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                  }}
                >
                  <div
                    style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                    }}
                  >
                    📝
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '500',
                    }}
                  >
                    مقال مدونة
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating blog OG image:', error);
    
    // Fallback OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          {/* Logo - Top Left */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <img
              src={`${process.env.NODE_ENV === 'production' ? 'https://www.notionarabs.com' : 'http://localhost:3000'}/favicon.png`}
              alt="عرب نوشن"
              style={{
                height: '32px',
                width: '32px',
              }}
            />
            <span
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1a1a1a',
              }}
            >
              عرب نوشن
            </span>
          </div>

          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: '20px',
            }}
          >
            مدونة عرب نوشن
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#666666',
            }}
          >
            مقالات ونصائح حول قوالب Notion
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}
