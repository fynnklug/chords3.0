import { LoginForm } from "@/components/login/login-form";
import { Music } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-center size-10 rounded-lg border bg-card">
          <Music className="size-5 text-foreground" />
        </div>
      </div>

      <LoginForm />
    </main>
  );
}
