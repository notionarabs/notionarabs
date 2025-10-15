import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Fetch template data
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs.onrender.com/api'
      : 'http://localhost:5000/api';

    let template = null;
    try {
      const response = await fetch(`${apiUrl}/templates/${id}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.template) {
          template = data.template;
        }
      }
    } catch (error) {
      console.error('Error fetching template data:', error);
    }

    // Fallback template data
    if (!template) {
      template = {
        title: 'قالب نوشن',
        description: 'قالب عربي لـ Notion',
        creator: { name: 'مبدع', displayName: 'مبدع قوالب نوشن' },
        category: 'عام',
        price: 0,
        previewImage: null
      };
    }

    const templateTitle = template.title || 'قالب نوشن';
    const templateDescription = template.description || 'قالب عربي لـ Notion';
    const creatorName = template.creator?.displayName || template.creator?.name || 'مبدع';
    const category = template.category || 'عام';
    const isPaid = template.price && template.price > 0;
    const price = template.price || 0;

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
            {/* Left Section - Template Info */}
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
                  backgroundColor: '#3b82f6',
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

              {/* Template Title */}
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
                {templateTitle}
              </div>

              {/* Template Description */}
              <div
                style={{
                  fontSize: '20px',
                  color: '#666666',
                  lineHeight: 1.4,
                  marginBottom: '20px',
                }}
              >
                {templateDescription.length > 120 ? templateDescription.substring(0, 120) + '...' : templateDescription}
              </div>

              {/* Creator and Price */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    color: '#1a1a1a',
                    fontWeight: '500',
                  }}
                >
                  بواسطة {creatorName}
                </div>
                {isPaid ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                    }}
                  >
                    {price} ر.س
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                    }}
                  >
                    مجاني
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Template Preview */}
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
              {template.previewImage ? (
                <img
                  src={template.previewImage}
                  alt={templateTitle}
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
                    معاينة القالب
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
    console.error('Error generating template OG image:', error);
    
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
            قالب نوشن
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#666666',
            }}
          >
            قالب عربي لـ Notion
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
