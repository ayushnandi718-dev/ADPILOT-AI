import { getAuthToken, verifyToken } from "./auth/auth";

export async function getAuthUserId(): Promise<string | null> {
  const token = await getAuthToken();
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.userId || null;
}
