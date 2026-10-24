import { AuthStatus } from "@/components/auth-status";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">WKU Connect</h1>
      <AuthStatus />
    </main>
  );
}