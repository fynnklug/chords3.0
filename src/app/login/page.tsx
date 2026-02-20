import { LoginForm } from "@/components/login/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="mb-8">
        <div className="flex items-center justify-center size-12 rounded-xl border border-border/20 bg-card">
          <span className="text-lg font-bold font-mono text-foreground">C</span>
        </div>
      </div>

      <LoginForm />
    </main>
  );
}
