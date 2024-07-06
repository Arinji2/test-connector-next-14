import { cookies } from "next/headers";

export const getCurrentUser = async (): Promise<string | null> => {
  const lastAccountId = cookies().get("KLastAccountId")?.value;
  if (!lastAccountId) return null;
  const accountToken = cookies().get(`KSession-${lastAccountId}`)?.value;
  if (!accountToken) return null;
  try {
    const response = await fetch("https://dev-labs.kabila.app/api/authentication/accounts", {
      headers: {
        auth: `Bearer ${accountToken}`,
      },
    });
    const accountId = response.headers.get("x-account-id");
    return accountId ? (accountId as string) : null;
  } catch {
    return null;
  }
};
