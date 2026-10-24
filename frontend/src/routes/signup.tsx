
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Brand } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { terrainAlt } from "@/lib/demo";

const API_URL =
  "https://zany-space-goggles-gxrvg677gqqxcwqv9-8000.app.github.dev";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Create account — DepthWizard" }],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Account creation failed."
        );
      }

      // Sign in after registration so we obtain a real access token.
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok || !loginData.access_token) {
        throw new Error(
          loginData.detail || "Account created, but login failed. Please sign in."
        );
      }

      localStorage.setItem("depthwizard_token", loginData.access_token);

      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-12 lg:px-20">
        <Brand />
        <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-12">
          <Link
            to="/"
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>

          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">
            Begin exploring
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink">
            Create your workspace
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Start turning imagery into terrain intelligence.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSignup}>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold">
                Full name
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Your name"
                className="h-12 w-full rounded-md border border-border bg-card px-4 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="h-12 w-full rounded-md border border-border bg-card px-4 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  minLength={1}
                  placeholder="Create a password"
                  className="h-12 w-full rounded-md border border-border bg-card px-4 pr-12 text-sm outline-none focus:border-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1.5"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="h-12 w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight />}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 DepthWizard · SIH project
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img
          src={terrainAlt}
          alt="Satellite view of a mountain range"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 terrain-shade" />
        <div className="absolute bottom-16 left-16 right-16 text-primary-foreground">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-lime">
            A world of perspective
          </p>
          <p className="max-w-md font-display text-4xl font-bold leading-tight">
            See the shape of what lies ahead.
          </p>
        </div>
      </div>
    </div>
  );
}
