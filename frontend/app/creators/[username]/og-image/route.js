import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    console.log('Starting OG image generation...');
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
          }}
        >
          عرب نوشن
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