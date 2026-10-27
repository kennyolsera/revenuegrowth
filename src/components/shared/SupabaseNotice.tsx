import { Warning, WarningCircle, Tray } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/lib/LanguageContext";

export function SupabaseNotice() {
  const { language } = useLanguage();
  return (
    <div role="status" className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-[12.5px] text-amber-800">
      <Warning aria-hidden className="mt-px h-4 w-4 shrink-0" />
      <div className="space-y-0.5">
        <p className="font-medium text-amber-900">
          {language === "id" ? "Supabase belum tersambung" : "Supabase isn't connected"}
        </p>
        <p className="leading-relaxed">
          {language === "id"
            ? "Halaman ini kosong sampai NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY diisi di Environment Variables Vercel."
            : "This page stays empty until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel's Environment Variables."}
        </p>
      </div>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  const { language } = useLanguage();
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[12.5px] text-red-800">
      <WarningCircle aria-hidden className="mt-px h-4 w-4 shrink-0" />
      <p>
        <span className="font-medium text-red-900">{language === "id" ? "Gagal memuat: " : "Couldn't load: "}</span>
        {message}
      </p>
    </div>
  );
}

export function EmptyState({ text, description }: { text: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <Tray aria-hidden className="mb-2.5 h-5 w-5 text-text-4" />
      <p className="text-[13px] font-medium text-text-2">{text}</p>
      {description && <p className="mt-1 max-w-sm text-[12.5px] text-text-3">{description}</p>}
    </div>
  );
}
