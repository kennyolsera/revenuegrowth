import { AlertTriangle, Database, Layers, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export function SupabaseNotice() {
  const { language } = useLanguage();
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/95 to-orange-50/95 p-4 text-xs text-amber-900 shadow-sm">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">
          {language === "id" ? "Koneksi Supabase Belum Terdeteksi" : "Supabase Connection Not Configured"}
        </p>
        <p className="text-amber-800 leading-relaxed">
          {language === "id"
            ? "Data pada tampilan ini menggunakan fallback kosong. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diatur di Environment Variables Vercel."
            : "Displaying placeholder empty state. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured in Vercel Environment Variables."}
        </p>
      </div>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  const { language } = useLanguage();
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-800 shadow-sm">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div>
        <span className="font-semibold">{language === "id" ? "Terjadi Kendala: " : "Error Encountered: "}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

export function EmptyState({ text, description }: { text: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Decorative Graphic illustration */}
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-accent/15 via-blue-400/10 to-indigo-400/20 blur-md" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <Layers className="h-7 w-7 text-slate-400" />
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-700">{text}</p>
      {description && <p className="mt-1 text-xs text-slate-400 max-w-sm">{description}</p>}
    </div>
  );
}
