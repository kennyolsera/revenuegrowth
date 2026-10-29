"use client";

import { useState } from "react";
import { Eye, EyeSlash, ArrowsClockwise, Copy, Check } from "@/components/icons";
import { Input, Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// No look-alikes (0/O/o, 1/l/I) so a password read over the phone survives, and no
// characters WhatsApp treats as formatting (* bold, _ italic, ~ strike, ` mono):
// a password like "ab*cd*ef" would arrive as bold "cd" with the asterisks gone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const SYMBOLS = "!@#$%?";

/** 14 characters from the browser's CSPRNG, always with a digit and a symbol. */
export function generatePassword(length = 14): string {
  const pick = (set: string) => {
    const buf = new Uint32Array(1);
    // Rejection sampling avoids modulo bias.
    const limit = Math.floor(0x100000000 / set.length) * set.length;
    do crypto.getRandomValues(buf);
    while (buf[0] >= limit);
    return set[buf[0] % set.length];
  };
  const chars = Array.from({ length: length - 2 }, () => pick(ALPHABET));
  chars.push(pick("23456789"), pick(SYMBOLS));
  // Shuffle so the digit and symbol aren't always at the end.
  for (let i = chars.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  language,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  language: "id" | "en";
}) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const tooShort = value.length > 0 && value.length < 8;
  const waRisk = /[*_~`]/.test(value);
  const L = {
    show: language === "id" ? "Tampilkan password" : "Show password",
    hide: language === "id" ? "Sembunyikan password" : "Hide password",
    gen: language === "id" ? "Buat otomatis" : "Generate",
    copy: language === "id" ? "Salin password" : "Copy password",
    hint: language === "id" ? "Minimal 8 karakter." : "At least 8 characters.",
    wa:
      language === "id"
        ? "Hindari * _ ~ ` jika dikirim lewat WhatsApp: karakter ini diubah jadi format teks dan hilang."
        : "Avoid * _ ~ ` if you'll send it on WhatsApp: it turns them into text formatting and they disappear.",
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the user can still select the shown text */
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <button
          type="button"
          onClick={() => {
            onChange(generatePassword());
            setShown(true);
          }}
          className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <ArrowsClockwise aria-hidden className="h-3.5 w-3.5" /> {L.gen}
        </button>
      </div>
      <div className="relative">
        <Input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete="new-password"
          spellCheck={false}
          minLength={8}
          maxLength={72}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={`${id}-hint`}
          aria-invalid={tooShort || undefined}
          className={cn("pr-16 font-mono", tooShort && "border-red focus:border-red")}
        />
        <div className="absolute inset-y-0 right-1 flex items-center gap-0.5">
          <button
            type="button"
            onClick={copy}
            disabled={!value}
            aria-label={L.copy}
            title={L.copy}
            className="rounded p-1 text-text-3 hover:text-text disabled:opacity-30"
          >
            {copied ? <Check aria-hidden className="h-3.5 w-3.5 text-green" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? L.hide : L.show}
            title={shown ? L.hide : L.show}
            className="rounded p-1 text-text-3 hover:text-text"
          >
            {shown ? <EyeSlash aria-hidden className="h-3.5 w-3.5" /> : <Eye aria-hidden className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <p id={`${id}-hint`} className={cn("mt-1 text-xs", tooShort ? "text-red" : waRisk ? "text-amber" : "text-text-3")}>
        {waRisk ? L.wa : L.hint}
      </p>
    </div>
  );
}
