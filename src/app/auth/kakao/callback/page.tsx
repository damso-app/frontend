import { CallbackClient } from "./CallbackClient";

interface KakaoCallbackPageProps {
  searchParams: Promise<{
    loginCode?: string | string[];
  }>;
}

function normalizeLoginCode(loginCode: string | string[] | undefined) {
  if (Array.isArray(loginCode)) return loginCode[0] ?? null;
  return loginCode ?? null;
}

export default async function KakaoCallbackPage({ searchParams }: KakaoCallbackPageProps) {
  const params = await searchParams;

  return <CallbackClient loginCode={normalizeLoginCode(params.loginCode)} />;
}
