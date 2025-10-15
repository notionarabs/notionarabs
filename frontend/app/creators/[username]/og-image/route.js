import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { username } = await params;

    // Fetch creator data
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs.onrender.com/api'
      : 'http://localhost:5000/api';

    let creator = null;
    try {
      const response = await fetch(`${apiUrl}/creators/${username}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.creator) {
          creator = data.creator;
        }
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
    }

    // Fallback creator data
    if (!creator) {
      creator = {
        displayName: 'مبدع قوالب نوشن',
        name: 'مبدع',
        username: username || 'creator',
        templateCount: 0,
        profilePicture: null
      };
    }

    const displayName = creator.displayName || creator.name || 'مبدع قوالب نوشن';
    const templateCount = creator.templateCount || creator.templates || 0;
    const handle = `@${creator.username || username}`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fafafa',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '0 60px',
          }}
        >
          {/* Left Section - Text Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flex: 1,
              paddingRight: '40px',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  height: '40px',
                  width: '40px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                ع
              </div>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                }}
              >
                عرب نوشن
              </span>
            </div>

            {/* Creator Name */}
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                lineHeight: 1.1,
                marginBottom: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {displayName}
            </div>

            {/* Handle */}
            <div
              style={{
                fontSize: '32px',
                color: '#1a1a1a',
                marginBottom: '16px',
                fontWeight: '500',
              }}
            >
              {handle}
            </div>

            {/* Template Count */}
            <div
              style={{
                fontSize: '28px',
                color: '#666666',
                fontWeight: '500',
              }}
            >
              {templateCount} قالب
            </div>
          </div>

          {/* Right Section - Profile Picture */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#e0e0e0',
              border: '8px solid #ffffff',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            {creator.profilePicture ? (
              <img
                src={creator.profilePicture}
                alt={displayName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontSize: '80px',
                  fontWeight: 'bold',
                }}
              >
                {displayName.charAt(0)?.toUpperCase() || 'م'}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error);

    // Return a simple text response if ImageResponse fails
    return new Response('OG Image Generation Failed', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}