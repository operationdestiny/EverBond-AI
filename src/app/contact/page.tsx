"use client";

import { Briefcase, Bug, Lightbulb, Mail, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useSiteLanguage } from "@/lib/site-language";
import { FINAL_LOCALIZATION_COPY } from "@/lib/final-localization-language";

export default function ContactPage() {
  const { t, language } = useSiteLanguage();
  const finalCopy =
    FINAL_LOCALIZATION_COPY[language] ?? FINAL_LOCALIZATION_COPY.EN;

  const supportItems = [
    { icon: MessageSquare, title: t("generalSupportTitle"), body: t("generalSupportBody") },
    { icon: Lightbulb, title: t("featureRequestsTitle"), body: t("featureRequestsBody") },
    { icon: Bug, title: t("reportIssueTitle"), body: t("reportIssueBody") },
    { icon: Briefcase, title: t("businessInquiriesTitle"), body: t("businessInquiriesBody") }
  ];

  return (
    <AppShell>
      <main className="min-h-screen overflow-hidden bg-[#030304]">
        <section className="relative min-h-screen px-4 py-10 sm:px-6 sm:py-14 md:px-10 lg:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(255,92,168,0.17),transparent_36%),radial-gradient(circle_at_8%_12%,rgba(255,92,168,0.10),transparent_30%)]" />

          <div className="relative mx-auto grid min-h-[calc(100vh-7rem)] min-w-0 max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-bond-rose">{t("contact")}</p>
              <h1 className="mt-5 max-w-xl font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {t("getInTouch")}<br />
                {finalCopy.contactWith && <>{finalCopy.contactWith}{" "}</>}
                <span className="text-bond-rose">Ever</span><span className="text-white">Bond</span>.
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-bond-muted sm:text-lg sm:leading-8 md:text-xl">
                {t("contactDescription")}
              </p>

              <a
                href="mailto:support@everbond.ai"
                className="mt-8 flex min-w-0 max-w-xl items-center gap-3 rounded-3xl border border-bond-rose/30 bg-white/[0.035] p-4 shadow-[0_0_40px_rgba(255,92,168,0.10)] transition hover:border-bond-rose/60 hover:bg-bond-rose/5 sm:mt-10 sm:gap-6 sm:p-6"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-bond-rose/55 bg-bond-rose/10 text-bond-rose shadow-[0_0_32px_rgba(255,92,168,0.25)] sm:h-24 sm:w-24">
                  <Mail size={38} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-bond-rose">{t("supportEmailLabel")}</span>
                  <span className="mt-2 block break-all text-base font-bold text-white sm:break-normal sm:text-2xl md:text-3xl">support@everbond.ai</span>
                </span>
              </a>

              <div className="mt-10 grid min-w-0 max-w-xl gap-6 sm:grid-cols-2">
                {supportItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex min-w-0 gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-bond-rose/40 bg-bond-rose/10 text-bond-rose">
                        <Icon size={24} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-bond-rose">{item.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-bond-muted">{item.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative hidden min-h-[640px] items-center justify-center lg:flex">
              <div className="absolute h-[660px] w-[660px] rounded-full bg-bond-rose/10 blur-3xl" />
              <img
                src="/assets/everbond-contact-art.png"
                alt={finalCopy.contactImageAlt}
                className="relative z-10 w-full max-w-[660px] object-contain drop-shadow-[0_0_60px_rgba(255,92,168,0.18)]"
              />
            </div>

            <div className="relative flex min-w-0 justify-center lg:hidden">
              <img
                src="/assets/everbond-contact-art.png"
                alt={finalCopy.contactImageAlt}
                className="w-full max-w-full object-contain sm:max-w-[520px]"
              />
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
