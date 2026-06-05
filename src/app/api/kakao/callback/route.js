export async function POST(request) {
  const { code, redirectUri } = await request.json();

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: '4825517f3d957c77bda439ac0479327d',
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return Response.json({ error: 'token_failed' }, { status: 400 });
  }

  const token = await tokenRes.json();

  const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: 'Bearer ' + token.access_token },
  });

  if (!userRes.ok) {
    return Response.json({ error: 'user_failed' }, { status: 400 });
  }

  const user = await userRes.json();
  const nickname = user.kakao_account?.profile?.nickname ?? null;

  return Response.json({ nickname });
}
