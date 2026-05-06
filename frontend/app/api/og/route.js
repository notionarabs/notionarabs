import { ImageResponse } from '@vercel/og';

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

    // Fetch Cairo font for Arabic rendering support (since Satori default fonts do not support Arabic characters)
    let fontRegular = null;
    let fontBold = null;
    try {
      fontRegular = await fetch(
        'https://gwfh.mran.ch/api/fonts/cairo/v28/arabic-400-normal.woff'
      ).then((res) => {
        if (!res.ok) throw new Error('Font status not ok');
        return res.arrayBuffer();
      });

      fontBold = await fetch(
        'https://gwfh.mran.ch/api/fonts/cairo/v28/arabic-700-normal.woff'
      ).then((res) => {
        if (!res.ok) throw new Error('Font status not ok');
        return res.arrayBuffer();
      });
    } catch (fontErr) {
      console.warn('Failed to fetch Cairo fonts, falling back to system fonts:', fontErr.message);
    }

    // Safely pre-fetch external image as a base64 string to avoid Satori/CORS fetch failures
    let imageBase64 = null;
    if (image) {
      try {
        const imgRes = await fetch(image);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          imageBase64 = `data:${contentType};base64,${base64}`;
        }
      } catch (imgErr) {
        console.warn('Failed to pre-fetch external preview image for OG rendering:', imgErr.message);
      }
    }

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
            fontFamily: fontRegular ? 'Cairo, sans-serif' : 'sans-serif',
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
              <span style={{ fontSize: 18, color: primary, fontWeight: 'bold' }}>عرب نوشن</span>
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
                fontWeight: 'bold',
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

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, width: '100%', justifyContent: 'flex-end' }}>
               {imageBase64 && (
                <div style={{ 
                  display: 'flex', 
                  width: 120, 
                  height: 120, 
                  borderRadius: type === 'creator' ? 60 : 20, 
                  overflow: 'hidden', 
                  border: '4px solid rgba(255,255,255,0.1)',
                  marginRight: 20
                }}>
                  <img src={imageBase64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {creator && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 24, color: '#94a3b8', marginRight: 10, direction: 'rtl' }}>بواسطة</span>
                    <span style={{ fontSize: 28, color: secondary, fontWeight: 'bold' }}>{creator}</span>
                  </div>
                )}

                {count && (
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 5 }}>
                    <span style={{ fontSize: 28, color: 'white', fontWeight: 'bold' }}>{count}</span>
                    <span style={{ fontSize: 24, color: '#94a3b8', marginLeft: 8, direction: 'rtl' }}>قالب متاح</span>
                  </div>
                )}
              </div>
            </div>
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
        fonts: fontRegular && fontBold ? [
          {
            name: 'Cairo',
            data: fontRegular,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Cairo',
            data: fontBold,
            weight: 700,
            style: 'normal',
          }
        ] : undefined,
      }
    );
  } catch (e) {
    console.error('OG Image generation crashed:', e.message);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
