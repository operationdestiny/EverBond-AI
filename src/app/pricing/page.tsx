import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { LocalizedBannerImage } from "@/components/ui/LocalizedBannerImage";

const plans = [
  {
    name: "Standard",
    href: "/pricing?plan=standard",
    className: "left-[8.4%] top-[82.7%] h-[6.5%] w-[24.2%]"
  },
  {
    name: "Premium",
    href: "/pricing?plan=premium",
    className: "left-[38.9%] top-[82.7%] h-[6.5%] w-[22.9%]"
  },
  {
    name: "Elite",
    href: "/pricing?plan=elite",
    className: "left-[69.5%] top-[82.7%] h-[6.5%] w-[22.5%]"
  }
];

export default function PricingPage() {
  return (
    <AppShell>
      <main className="bg-black">
        <section className="mx-auto flex h-screen items-center justify-center overflow-hidden px-0 py-0">
          <div className="relative inline-block">
            <LocalizedBannerImage
              banner="pricing"
              alt="EverBond pricing plans"
              className="block h-auto w-full max-w-[1920px] max-h-screen object-contain"
            />

            {plans.map((plan) => (
              <Link
                key={plan.name}
                href={plan.href}
                aria-label={`Unlock ${plan.name}`}
                className={`absolute rounded-full focus:outline-none ${plan.className}`}
                draggable={false}
              >
                <span className="sr-only">Unlock {plan.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
