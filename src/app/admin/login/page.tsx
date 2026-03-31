import { Suspense } from "react";

import LoginClient from "./LoginClient";

export default function AdminLoginPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-white border border-general-border rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-primary-main">Admin Login</h1>
        <p className="text-sm text-general-muted-foreground mt-1">
          Sign in to manage funnels and adwalls.
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <LoginClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

