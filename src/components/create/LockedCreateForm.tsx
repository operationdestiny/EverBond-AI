"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSiteLanguage } from "@/lib/site-language";

const tagOptions = [
  "Romance",
  "Fantasy",
  "Gothic",
  "Comfort",
  "Rival",
  "Mystery",
  "Campus",
  "Mean",
  "Submissive",
  "Protective",
  "Adventure",
  "Slice of Life",
  "Sarcastic"
] as const;

const tagKeyMap: Record<(typeof tagOptions)[number], string> = {
  Romance: "romance",
  Fantasy: "fantasy",
  Gothic: "gothic",
  Comfort: "comfort",
  Rival: "rival",
  Mystery: "mystery",
  Campus: "campus",
  Mean: "mean",
  Submissive: "submissive",
  Protective: "protective",
  Adventure: "adventure",
  "Slice of Life": "sliceOfLife",
  Sarcastic: "sarcastic"
};

const systemDefaults = {
  section: "Public Creations",
  is_official: false,
  voice_enabled: false,
  image_generation_enabled: false,
  gifts_enabled: true,
  status: "published",
  view_count: 0,
  json_ld_type: "WebPage"
};

export function LockedCreateForm() {
  const { t } = useSiteLanguage();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"Public" | "Private">("Public");
  const [open, setOpen] = useState(false);

  const selectedTagText = useMemo(
    () => selectedTags.map((tag) => t(tagKeyMap[tag as keyof typeof tagKeyMap] ?? tag)).join(", "),
    [selectedTags, t]
  );

  function showLoginMessage() {
    setOpen(true);
  }

  function toggleTag(tag: string) {
    showLoginMessage();
    setSelectedTags((current) => {
      if (current.includes(tag)) return current.filter((item) => item !== tag);
      if (current.length >= 4) return current;
      return [...current, tag];
    });
  }

  function removeTag(tag: string) {
    showLoginMessage();
    setSelectedTags((current) => current.filter((item) => item !== tag));
  }

  const inputClass = "w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white outline-none focus:border-bond-rose/60";

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <form className="bond-card rounded-[2.5rem] border border-bond-rose/75 p-6 shadow-[0_0_0_1px_rgba(255,92,168,0.28),0_0_30px_rgba(255,92,168,0.10)] md:p-8" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-bond-muted">{t("profileImage")} <span className="text-bond-rose">*</span></span>
              <input
                required
                type="file"
                accept="image/*"
                onClick={showLoginMessage}
                onFocus={showLoginMessage}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-bond-muted outline-none file:mr-4 file:rounded-full file:border-0 file:bg-bond-rose file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-bond-muted">{t("name")} <span className="text-bond-rose">*</span></span>
              <input required maxLength={30} onClick={showLoginMessage} onFocus={showLoginMessage} placeholder={t("charactersMax30")} className={inputClass} />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-bond-muted">{t("visualDescription")} <span className="text-bond-rose">*</span></span>
              <input required maxLength={80} onClick={showLoginMessage} onFocus={showLoginMessage} placeholder={t("charactersMax80")} className={inputClass} />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-bond-muted">{t("describeYourCompanion")} <span className="text-bond-rose">*</span></span>
              <textarea
                required
                rows={4}
                maxLength={100}
                onClick={showLoginMessage}
                onFocus={showLoginMessage}
                placeholder={t("describeYourCompanionPlaceholder")}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white outline-none focus:border-bond-rose/60"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-bond-muted">{t("temperament")} <span className="text-bond-rose">*</span></span>
              <input required maxLength={50} onClick={showLoginMessage} onFocus={showLoginMessage} placeholder={t("describeTheirPersonality")} className={inputClass} />
            </label>

            <div className="space-y-3 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-bond-muted">{t("tags")} <span className="text-bond-rose">*</span></p>
                <p className="text-xs text-bond-muted">{t("chooseUpTo4Tags")}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-bond-rose bg-bond-rose text-white"
                          : "border-bond-rose/40 bg-bond-rose/10 text-white hover:border-bond-rose/70"
                      }`}
                    >
                      {t(tagKeyMap[tag])}
                    </button>
                  );
                })}
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center gap-2 rounded-full border border-bond-rose/50 bg-black/30 px-3 py-1.5 text-xs font-bold text-white hover:border-bond-rose"
                    >
                      {t(tagKeyMap[tag as keyof typeof tagKeyMap] ?? tag)}
                      <X size={13} />
                    </button>
                  ))}
                </div>
              )}

              <input required readOnly value={selectedTagText} onClick={showLoginMessage} onFocus={showLoginMessage} placeholder={t("selectedTagsAppearHere")} className={inputClass} />
            </div>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-bond-muted">{t("openingScenario")} <span className="text-bond-rose">*</span></span>
              <textarea required maxLength={200} rows={4} onClick={showLoginMessage} onFocus={showLoginMessage} placeholder={t("charactersMax200")} className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white outline-none focus:border-bond-rose/60" />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-bond-muted">{t("firstMessage")} <span className="text-bond-rose">*</span></span>
              <textarea required maxLength={100} rows={3} onClick={showLoginMessage} onFocus={showLoginMessage} placeholder={t("charactersMax100")} className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white outline-none focus:border-bond-rose/60" />
            </label>

            <div className="space-y-3 md:col-span-2">
              <p className="text-sm font-semibold text-bond-muted">{t("visibility")} <span className="text-bond-rose">*</span></p>
              <div className="grid gap-3 md:grid-cols-2">
                {(["Public", "Private"] as const).map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => {
                      showLoginMessage();
                      setVisibility(option);
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      visibility === option
                        ? "border-bond-rose bg-bond-rose/15"
                        : "border-white/10 bg-white/[0.03] hover:border-bond-rose/40"
                    }`}
                  >
                    <p className="font-display text-lg font-bold">{option === "Public" ? t("public") : t("private")}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <input type="hidden" name="section" value={systemDefaults.section} />
          <input type="hidden" name="visibility" value={visibility.toLowerCase()} />
          <input type="hidden" name="is_official" value={String(systemDefaults.is_official)} />
          <input type="hidden" name="voice_enabled" value={String(systemDefaults.voice_enabled)} />
          <input type="hidden" name="image_generation_enabled" value={String(systemDefaults.image_generation_enabled)} />
          <input type="hidden" name="gifts_enabled" value={String(systemDefaults.gifts_enabled)} />
          <input type="hidden" name="status" value={systemDefaults.status} />
          <input type="hidden" name="view_count" value={String(systemDefaults.view_count)} />
          <input type="hidden" name="json_ld_type" value={systemDefaults.json_ld_type} />

          <button type="button" onClick={showLoginMessage} className="mt-8 w-full rounded-full bg-bond-rose px-6 py-3.5 text-sm font-bold text-white transition hover:bg-bond-rose/90">
            {t("createCharacterCta")}
          </button>
        </form>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[2rem] border border-bond-rose/45 bg-bond-card p-7 text-center shadow-[0_0_42px_rgba(255,92,168,0.18)]">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full p-1 text-bond-muted hover:text-white" aria-label={t("close")}>
              <X size={18} />
            </button>
            <p className="font-display text-3xl font-bold text-bond-rose">
              {t("loginSignupCreate")}
            </p>
            <Link href="/pricing" className="mt-6 inline-flex rounded-full bg-bond-rose px-6 py-3 text-sm font-bold text-white">
              {t("loginSignup")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
