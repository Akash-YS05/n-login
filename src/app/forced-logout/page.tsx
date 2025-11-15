import { Suspense } from "react";
import ForcedLogoutClient from "./ForcedLogoutClient";

export default function ForcedLogoutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <ForcedLogoutClient />
    </Suspense>
  );
}
