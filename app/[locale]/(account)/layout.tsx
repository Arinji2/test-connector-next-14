import { redirect } from "@/i18n/navigation";

import { getCurrentUser } from "@/lib/users";
import { use } from "react";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const account = use(getCurrentUser());

  if (!account) {
    redirect("/connect");
  }

  return children;
}

export default ProtectedLayout;
