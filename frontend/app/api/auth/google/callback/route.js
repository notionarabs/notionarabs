// Next.js API route to handle Google OAuth callback redirect
// This redirects from api.notionarabs.com to EC2 IP

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Build the redirect URL with all parameters
  const params = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    params.append(key, value);
  }
  
  const redirectUrl = `http://ec2-50-19-23-245.compute-1.amazonaws.com/api/auth/google/callback?${params.toString()}`;
  
  return Response.redirect(redirectUrl, 302);
}
