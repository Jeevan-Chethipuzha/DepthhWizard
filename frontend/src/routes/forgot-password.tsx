
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, KeyRound } from "lucide-react";
import { Brand } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

const API_URL = "https://zany-space-goggles-gxrvg677gqqxcwqv9-8000.app.github.dev";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Reset Password — DepthWizard" }],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to send reset code.");
      }

      setStage(2);
      setSuccess("If your account exists, a reset code has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Invalid or expired reset code. Please try again."
        );
      }

      setStage(3);
      setSuccess("Your password has been changed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[430px]">
        <Brand />

        <div className="mt-12">
          <Link
            to="/login"
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} /> Back to login
          </Link>

          {stage !== 3 ? (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {stage === 1 ? <Mail size={24} /> : <KeyRound size={24} />}
              </div>

              <h1 className="font-display text-3xl font-bold text-ink">
                {stage === 1 ? "Forgot your password?" : "Create a new password"}
              </h1>

              <p className="mt-3 text-sm text-muted-foreground">
                {stage === 1
                  ? "Enter your registered email address. We'll send you a password reset code."
                  : "Enter the 6-digit code sent to your email and choose a new password."}
              </p>

              {stage === 1 ? (
                <form onSubmit={handleForgot} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold">
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

                  <Button type="submit" disabled={loading} className="h-12 w-full">
                    {loading ? "Sending code..." : "Send reset code"}
                    {!loading && <ArrowRight />}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleReset} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="code" className="mb-2 block text-sm font-semibold">
                      6-digit verification code
                    </label>
                    <input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="h-12 w-full rounded-md border border-border bg-card px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                      New password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="h-12 w-full rounded-md border border-border bg-card px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold">
                      Confirm new password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Enter password again"
                      className="h-12 w-full rounded-md border border-border bg-card px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="h-12 w-full">
                    {loading ? "Changing password..." : "Reset password"}
                    {!loading && <ArrowRight />}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStage(1);
                      setCode("");
                      setError("");
                      setSuccess("");
                    }}
                    className="w-full text-sm text-primary hover:underline"
                  >
                    Use a different email
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <KeyRound size={24} />
              </div>
              <h1 className="font-display text-3xl font-bold text-ink">
                Password changed!
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Your DepthWizard password has been updated. You can now sign in with your new password.
              </p>
              <Button
                className="mt-8 h-12 w-full"
                onClick={() => navigate({ to: "/login" })}
              >
                Go to login <ArrowRight />
              </Button>
            </>
          )}

          {error && (
            <p className="mt-5 text-sm text-red-600">{error}</p>
          )}

          {success && (
            <p className="mt-5 text-sm text-green-600">{success}</p>
          )}
        </div>
      </div>
    </div>
  );
}
