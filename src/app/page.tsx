import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-800/20 rounded-none blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-800/20 rounded-none blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white tracking-tight">NLogin</h1>
          <p className="text-slate-400 text-xs mt-3 font-light tracking-wide">Login Setup using Nextjs & Auth0</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-none p-8 shadow-2xl">
          {user ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-none">
                  <span className="text-green-400">✓</span>
                  <p className="text-xs font-light text-slate-300">Authenticated</p>
                </div>
              </div>
              <Profile />
              <LogoutButton />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-slate-300 text-xs font-light leading-relaxed tracking-wide">
                Log in to access your protected content securely.
              </p>
              <LoginButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
