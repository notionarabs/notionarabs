import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic params
    const title = searchParams.get('title') || 'عرب نوشن';
    const type = searchParams.get('type') || 'website'; // template, creator, blog, website
    const creator = searchParams.get('creator') || '';
    const price = searchParams.get('price') || '';
    const count = searchParams.get('count') || '';
    const image = searchParams.get('image') || '';

    // Branded colors
    const primary = '#f97316'; // orange-500
    const secondary = '#fbbf24'; // amber-400
    const dark = '#0f172a'; // slate-900

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
            backgroundColor: dark,
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
            backgroundSize: '50px 50px',
            padding: '40px 80px',
            position: 'relative',
          }}
        >
          {/* Decorative Gradient Orb */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '200px',
              background: `radial-gradient(circle, ${primary}22 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
          />

          {/* Logo Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
              width: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                marginRight: '15px',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 'bold', color: 'white', letterSpacing: '0.1em' }}>NOTION ARABS</span>
              <span style={{ fontSize: 18, color: primary }}>عرب نوشن</span>
            </div>
            <div
              style={{
                width: 60,
                height: 60,
                backgroundColor: 'white',
                borderRadius: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              }}
            >
              <img
                src="https://www.notionarabs.com/icons/favicon.png"
                width="45"
                height="45"
                alt="Logo"
              />
            </div>
          </div>

          {/* Content Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              width: '100%',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {type === 'template' && (
              <div style={{ display: 'flex', marginBottom: 10 }}>
                <span style={{ backgroundColor: primary, color: 'white', padding: '5px 15px', borderRadius: 10, fontSize: 18, fontWeight: 'bold' }}>قالب نوشن احترافي</span>
              </div>
            )}
            
            <h1
              style={{
                fontSize: 64,
                fontWeight: 'black',
                color: 'white',
                textAlign: 'right',
                margin: '10px 0',
                lineHeight: 1.2,
                direction: 'rtl',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              {title}
            </h1>

            {creator && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 15 }}>
                <span style={{ fontSize: 28, color: '#94a3b8', marginRight: 10, direction: 'rtl' }}>بواسطة</span>
                <span style={{ fontSize: 32, color: secondary, fontWeight: 'bold' }}>{creator}</span>
              </div>
            )}

            {count && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 15 }}>
                <span style={{ fontSize: 32, color: 'white', fontWeight: 'bold' }}>{count}</span>
                <span style={{ fontSize: 28, color: '#94a3b8', marginLeft: 10, direction: 'rtl' }}>قالب متاح</span>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '20px',
              marginTop: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: 18 }}>notionarabs.com</span>
            </div>
            
            {price && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: primary, fontSize: 36, fontWeight: 'bold' }}>{price}</span>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
