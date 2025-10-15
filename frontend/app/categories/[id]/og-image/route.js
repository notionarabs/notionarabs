import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Fetch category data and templates count
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs.onrender.com/api'
      : 'http://localhost:5000/api';

    let categoryData = null;
    let templatesCount = 0;
    
    try {
      // Get templates in this category
      const response = await fetch(`${apiUrl}/templates?category=${encodeURIComponent(id)}&limit=1`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.templates) {
          templatesCount = data.pagination?.total || data.templates.length;
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    }

    const categoryName = decodeURIComponent(id) || 'قوالب نوشن';
    const categoryIcon = getCategoryIcon(categoryName);

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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              paddingTop: '100px',
              textAlign: 'center',
            }}
          >
            {/* Category Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                marginBottom: '30px',
                fontSize: '60px',
              }}
            >
              {categoryIcon}
            </div>

            {/* Category Title */}
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                lineHeight: 1.2,
                marginBottom: '20px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {categoryName}
            </div>

            {/* Templates Count */}
            <div
              style={{
                fontSize: '32px',
                color: '#666666',
                marginBottom: '30px',
                fontWeight: '500',
              }}
            >
              {templatesCount} قالب متاح
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '24px',
                color: '#4b5563',
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              اكتشف أفضل قوالب {categoryName} باللغة العربية لـ Notion
            </div>
          </div>

          {/* Bottom Stats */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              right: '40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                color: '#6b7280',
              }}
            >
              قوالب عربية عالية الجودة
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#6b7280',
              }}
            >
              تحميل مجاني
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
    console.error('Error generating category OG image:', error);
    
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
            قوالب نوشن
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#666666',
            }}
          >
            قوالب عربية لـ Notion
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

// Helper function to get category icons
function getCategoryIcon(categoryName) {
  const iconMap = {
    'الدراسة والبحث': '📚',
    'العمل والأعمال': '💼',
    'التخطيط الشخصي': '📅',
    'الإنتاجية والتنظيم': '⚡',
    'إدارة المشاريع': '🎯',
    'التسويق': '📈',
    'التطوير': '💻',
    'التصميم': '🎨',
    'المالية': '💰',
    'الموارد البشرية': '👥',
    'المبيعات': '🛒',
    'التعليم': '🎓',
    'الصحة': '🏥',
    'السفر': '✈️',
    'الطعام': '🍽️',
    'الرياضة': '🏃',
    'الترفيه': '🎮',
    'الأسرة': '👨‍👩‍👧‍👦',
    'المنزل': '🏠',
    'السيارة': '🚗',
  };
  
  return iconMap[categoryName] || '📝';
}
