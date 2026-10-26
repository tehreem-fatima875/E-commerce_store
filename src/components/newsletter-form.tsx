"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { newsletterSchema } from "@/lib/validation";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <form
        className={compact ? "footer-signup" : "newsletter-form"}
        onSubmit={async (event) => {
          event.preventDefault();
          setMessage("");
          const formData = new FormData(event.currentTarget);
          const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
          if (!parsed.success) {
            setMessage("Enter a valid email address.");
            return;
          }
          setSubmitting(true);
          try {
            const response = await fetch("/api/newsletter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(parsed.data),
            });
            const result: { error?: string; message?: string } = await response.json();
            setMessage(result.message ?? result.error ?? "Newsletter sign-up is unavailable.");
          } catch {
            setMessage("We couldn’t reach the newsletter service. Your email was not saved.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <label className="sr-only" htmlFor={compact ? "footer-email" : "newsletter-email"}>Email address</label>
        <input
          id={compact ? "footer-email" : "newsletter-email"}
          name="email"
          placeholder="Your email address"
          required
          type="email"
        />
        {compact ? (
          <button aria-label="Join the newsletter" disabled={submitting} type="submit"><ArrowUpRight size={18} /></button>
        ) : (
          <button disabled={submitting} type="submit">{submitting ? "Sending…" : "Join us"} <ArrowRight size={15} /></button>
        )}
      </form>
      {message && <p aria-live="polite" className="newsletter-status" role="status">{message}</p>}
    </>
  );
}
