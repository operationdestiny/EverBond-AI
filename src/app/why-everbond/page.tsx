"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useSiteLanguage } from "@/lib/site-language";

function DetailItem({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-bond-rose shadow-[0_0_12px_rgba(255,92,168,0.55)]"
      />
      <span>{children}</span>
    </li>
  );
}

export default function WhyEverBondPage() {
  const { t } = useSiteLanguage();

  const heroStatements = [
    t("whyHeroStatement1"),
    t("whyHeroStatement2"),
    t("whyHeroStatement3")
  ];

  const memoryItems = [
    t("whyMemoryItem1"),
    t("whyMemoryItem2"),
    t("whyMemoryItem3"),
    t("whyMemoryItem4"),
    t("whyMemoryItem5"),
    t("whyMemoryItem6")
  ];

  const whyPeopleStayItems = [
    t("whyPeopleStayItem1"),
    t("whyPeopleStayItem2"),
    t("whyPeopleStayItem3")
  ];

  const featureSections = [
    {
      title: t("privateByDefault"),
      intro: t("privateByDefaultBody"),
      items: [
        t("privateByDefaultItem1"),
        t("privateByDefaultItem2"),
        t("privateByDefaultItem3"),
        t("privateByDefaultItem4")
      ],
      closing: t("privateByDefaultClosing")
    },
    {
      title: t("builtForRoleplay"),
      intro: t("builtForRoleplayBody"),
      items: [
        t("builtForRoleplayItem1"),
        t("builtForRoleplayItem2"),
        t("builtForRoleplayItem3"),
        t("builtForRoleplayItem4")
      ],
      closing: t("builtForRoleplayClosing")
    },
    {
      title: t("noSubscriptionsTotalFreedom"),
      intro: t("noSubscriptionsTotalFreedomBody"),
      items: [
        t("noSubscriptionsItem1"),
        t("noSubscriptionsItem2"),
        t("noSubscriptionsItem3"),
        t("noSubscriptionsItem4"),
        t("noSubscriptionsItem5"),
        t("noSubscriptionsItem6")
      ],
      closing: t("noSubscriptionsClosing")
    }
  ];

  const highlights = [
    { title: t("trueMemory"), description: t("trueMemoryBody") },
    { title: t("consistency"), description: t("consistencyBody") },
    { title: t("loyalty"), description: t("loyaltyBody") },
    { title: t("privacy"), description: t("privacyBody") },
    { title: t("freedom"), description: t("freedomBody") }
  ];

  const faqs = [
    { question: t("whatIsEverBond"), answer: t("whatIsEverBondAnswer") },
    { question: t("areChatsPrivate"), answer: t("areChatsPrivateAnswer") },
    { question: t("whatIsEverMemory"), answer: t("whatIsEverMemoryAnswer") },
    {
      question: t("doINeedToSignUpOrPay"),
      answer: t("doINeedToSignUpOrPayAnswer")
    },
    {
      question: t("canIResetAConversation"),
      answer: t("canIResetAConversationAnswer")
    },
    {
      question: t("doesEverBondHaveNsfwFilter"),
      answer: t("doesEverBondHaveNsfwFilterAnswer")
    },
    { question: t("whatIsEverCoin"), answer: t("whatIsEverCoinAnswer") }
  ];

  return (
    <AppShell>
      <main className="pb-20">
        <section className="border-b border-white/5 bg-gradient-to-br from-bond-violet/18 via-transparent to-bond-rose/15 py-20">
          <div className="bond-container">
            <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">
                {t("bondingDetails")}
              </p>
              <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-bold tracking-tight md:text-7xl">
                {t("whyEverBond")}
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-bond-muted md:text-xl">
                {t("whyHeroDescription")}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {heroStatements.map((statement) => (
                  <span
                    key={statement}
                    className="rounded-full border border-bond-rose/30 bg-bond-rose/10 px-4 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(255,92,168,0.12)]"
                  >
                    {statement}
                  </span>
                ))}
              </div>

              <div className="relative mt-12 w-full overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(12,12,18,0.94),rgba(20,10,24,0.96))] p-6 shadow-[0_0_48px_rgba(255,92,168,0.08)] md:p-8">
                <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-bond-rose/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-8 h-24 w-24 rounded-full bg-bond-violet/20 blur-3xl" />

                <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
                  <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,92,168,0.14),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
                    <div className="absolute h-[290px] w-[290px] rounded-full border border-bond-rose/20" />
                    <div className="absolute h-[230px] w-[230px] animate-pulse rounded-full border border-bond-violet/20" />
                    <div className="absolute h-[160px] w-[160px] rounded-full border border-bond-rose/35 shadow-[0_0_40px_rgba(255,92,168,0.18)]" />
                    <div className="absolute h-24 w-24 animate-pulse rounded-full bg-bond-rose/20 blur-2xl" />

                    <div className="relative z-10 rounded-full border border-bond-rose/30 bg-black/40 px-8 py-8 text-center shadow-[0_0_30px_rgba(255,92,168,0.14)] backdrop-blur-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.35em] text-bond-rose">
                        {t("memory")}
                      </p>
                      <p className="mt-2 max-w-[190px] text-2xl font-bold text-white">
                        {t("livesOn")}
                      </p>
                    </div>

                    <div className="absolute left-7 top-8 animate-pulse rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
                      {t("whyMemoryItem1")}
                    </div>
                    <div className="absolute right-7 top-12 animate-pulse rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
                      {t("whyMemoryItem4")}
                    </div>
                    <div className="absolute bottom-10 left-10 animate-pulse rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
                      {t("whyMemoryItem5")}
                    </div>
                    <div className="absolute bottom-8 right-9 animate-pulse rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
                      {t("whyMemoryItem6")}
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center md:items-start md:text-left">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">
                      {t("memory")}
                    </p>
                    <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
                      {t("bondDoesNotReset")}
                    </h2>
                    <p className="mt-5 max-w-xl text-lg leading-8 text-bond-muted">
                      {t("whyMemoryIntro")}
                    </p>
                    <ul className="mt-5 space-y-2 text-left text-base leading-7 text-bond-muted">
                      {memoryItems.map((item) => (
                        <DetailItem key={item}>{item}</DetailItem>
                      ))}
                    </ul>
                    <p className="mt-6 max-w-xl text-base leading-7 text-white/90">
                      {t("bondDoesNotResetDescription")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 w-full">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">
                  {t("whyPeopleStay")}
                </p>
                <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
                  {t("whyPeopleStayIntro")}
                </h2>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {whyPeopleStayItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center shadow-[0_0_24px_rgba(255,92,168,0.04)]"
                    >
                      <p className="text-base leading-7 text-white">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                  {featureSections.map((section) => (
                    <article
                      key={section.title}
                      className="rounded-3xl border border-white/10 bg-black/25 p-6 text-left shadow-[0_0_30px_rgba(255,92,168,0.05)]"
                    >
                      <h3 className="font-display text-2xl font-bold text-white">
                        {section.title}
                      </h3>
                      <p className="mt-3 leading-7 text-bond-muted">
                        {section.intro}
                      </p>
                      <ul className="mt-5 space-y-2 text-sm leading-6 text-bond-muted">
                        {section.items.map((item) => (
                          <DetailItem key={item}>{item}</DetailItem>
                        ))}
                      </ul>
                      <p className="mt-5 font-semibold leading-7 text-bond-rose">
                        {section.closing}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/5 py-16">
          <div className="bond-container">
            <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_0_40px_rgba(255,92,168,0.08)] md:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">
                {t("theDifference")}
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
                {t("notJustQuantityQuality")}
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-bond-muted">
                {t("designedForWhatYouWant")}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center transition hover:border-bond-rose/30 hover:bg-white/[0.04]"
                  >
                    <p className="text-base font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-bond-muted">
                      {item.description}
                    </p>
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
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-bond-rose">
                  {t("faq")}
                </p>
                <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
                  {t("questionsBeforeYouStart")}
                </h2>
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
                    <h3 className="font-display text-xl font-bold text-white">
                      {item.question}
                    </h3>
                    <p className="mx-auto mt-3 max-w-4xl leading-7 text-bond-muted">
                      {item.answer}
                    </p>
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
