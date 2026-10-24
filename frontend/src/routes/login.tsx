import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Brand } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { terrainAerial } from "@/lib/demo";

const API_URL = "https://zany-space-goggles-gxrvg677gqqxcwqv9-8000.app.github.dev";
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — DepthWizard" },
      {
        name: "description",
        content: "Enter your DepthWizard terrain analysis workspace.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("depthwizard_token", data.access_token);

      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to backend",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-12 lg:px-20">
        <Brand />

        <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-16">
          <Link
            to="/"
            className="mb-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>

          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">
            Welcome back
          </p>

          <h1 className="mt-3 font-display text-4xl font-bold text-ink">
            Sign in to your workspace
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Your terrain insights are waiting for you.
          </p>

          <form className="mt-10 space-y-5" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-md border border-border bg-card px-4 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <label htmlFor="password" className="text-sm font-semibold">
                  Password
                </label>

                <span className="text-xs text-muted-foreground">
                  Use your registered password
                </span>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  minLength={1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="h-12 w-full">
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to DepthWizard?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 DepthWizard · SIH project
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img
          src={terrainAerial}
          alt="Alpine terrain seen from above"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 terrain-shade" />

        <div className="absolute bottom-16 left-16 right-16 text-primary-foreground">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-lime">
            Explore the unseen
          </p>

          <p className="max-w-md font-display text-4xl font-bold leading-tight">
            A different perspective changes everything.
          </p>
        </div>
      </div>
    </div>
  );
}
