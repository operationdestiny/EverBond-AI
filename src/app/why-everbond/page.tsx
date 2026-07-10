"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useSiteLanguage } from "@/lib/site-language";

export default function WhyEverBondPage() {
  const { t } = useSiteLanguage();

  const highlights = [
    { title: t("trueMemory"), description: t("trueMemoryBody") },
    { title: t("consistency"), description: t("consistencyBody") },
    { title: t("privacy"), description: t("privacyBody") },
    { title: t("freedom"), description: t("freedomBody") }
  ];

  const faqs = [
    { question: t("whatIsEverBond"), answer: t("whatIsEverBondAnswer") },
    { question: t("areChatsPrivate"), answer: t("areChatsPrivateAnswer") },
    { question: t("whatIsEverMemory"), answer: t("whatIsEverMemoryAnswer") },
    { question: t("doINeedToSignUpOrPay"), answer: t("doINeedToSignUpOrPayAnswer") },
    { question: t("canIResetAConversation"), answer: t("canIResetAConversationAnswer") },
    { question: t("doesEverBondHaveNsfwFilter"), answer: t("doesEverBondHaveNsfwFilterAnswer") },
    { question: t("whatIsEverCoin"), answer: t("whatIsEverCoinAnswer") }
  ];

  return (
    <AppShell>
      <main className="pb-20">
        <section className="border-b border-white/5 bg-gradient-to-br from-bond-violet/18 via-transparent to-bond-rose/15 py-20">
          <div className="bond-container">
            <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">{t("whyEverBond")}</p>
              <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-bold tracking-tight md:text-7xl">
                {t("whyEverBond")}
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-bond-muted md:text-xl">
                {t("whyHeroDescription")}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {[t("memory"), t("consistency"), t("loyalty"), t("privacy"), t("freedom")].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-bond-rose/30 bg-bond-rose/10 px-4 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(255,92,168,0.12)]"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <div className="relative mt-12 w-full overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(12,12,18,0.94),rgba(20,10,24,0.96))] p-6 shadow-[0_0_48px_rgba(255,92,168,0.08)] md:p-8">
                <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-bond-rose/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-8 h-24 w-24 rounded-full bg-bond-violet/20 blur-3xl" />
                <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
                  <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,92,168,0.14),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
                    <div className="absolute h-[290px] w-[290px] rounded-full border border-bond-rose/20" />
                    <div className="absolute h-[230px] w-[230px] rounded-full border border-bond-violet/20 animate-pulse" />
                    <div className="absolute h-[160px] w-[160px] rounded-full border border-bond-rose/35 shadow-[0_0_40px_rgba(255,92,168,0.18)]" />
                    <div className="absolute h-24 w-24 rounded-full bg-bond-rose/20 blur-2xl animate-pulse" />

                    <div className="relative z-10 rounded-full border border-bond-rose/30 bg-black/40 px-8 py-8 text-center shadow-[0_0_30px_rgba(255,92,168,0.14)] backdrop-blur-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.35em] text-bond-rose">Ever Memory™</p>
                      <p className="mt-2 text-3xl font-bold text-white">{t("livesOn")}</p>
                    </div>

                    <div className="absolute left-7 top-8 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/90 backdrop-blur-sm animate-pulse">
                      {t("remembersPromises")}
                    </div>
                    <div className="absolute right-7 top-12 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/90 backdrop-blur-sm animate-pulse">
                      {t("tracksStoryProgress")}
                    </div>
                    <div className="absolute bottom-10 left-10 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/90 backdrop-blur-sm animate-pulse">
                      {t("keepsRelationshipState")}
                    </div>
                    <div className="absolute bottom-8 right-9 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/90 backdrop-blur-sm animate-pulse">
                      {t("continuesWhereYouLeftOff")}
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center md:items-start md:text-left">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">{t("whyPeopleStay")}</p>
                    <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">{t("bondDoesNotReset")}</h2>
                    <p className="mt-5 max-w-xl text-lg leading-8 text-bond-muted">
                      {t("bondDoesNotResetDescription")}
                    </p>

                    <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-sm font-semibold text-white">{t("privateByDefault")}</p>
                        <p className="mt-2 text-sm leading-6 text-bond-muted">
                          {t("privateByDefaultBody")}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-sm font-semibold text-white">{t("builtForRoleplay")}</p>
                        <p className="mt-2 text-sm leading-6 text-bond-muted">
                          {t("builtForRoleplayBody")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/5 py-16">
          <div className="bond-container">
            <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_0_40px_rgba(255,92,168,0.08)] md:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">{t("theDifference")}</p>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">{t("notJustQuantityQuality")}</h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-bond-muted">
                {t("designedForWhatYouWant")}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center transition hover:border-bond-rose/30 hover:bg-white/[0.04]"
                  >
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-3 text-sm leading-6 text-bond-muted">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="bond-container">
            <div className="mx-auto max-w-5xl">
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">{t("faq")}</p>
                <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">{t("questionsBeforeYouStart")}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-bond-muted md:text-lg">
                  {t("everythingImportantAtAGlance")}
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {faqs.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center shadow-[0_0_24px_rgba(255,92,168,0.03)] transition hover:border-bond-rose/25"
                  >
                    <h3 className="font-display text-xl font-bold text-white">{item.question}</h3>
                    <p className="mx-auto mt-3 max-w-4xl leading-7 text-bond-muted">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
