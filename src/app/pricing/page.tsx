import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { LocalizedBannerImage } from "@/components/ui/LocalizedBannerImage";

const bundles = [
  {
    name: "Starter Bundle",
    messages: 500,
    href: "/pricing?bundle=500",
    className: "left-[9.7%] top-[66.4%] h-[5%] w-[21.4%]"
  },
  {
    name: "Popular Bundle",
    messages: 1000,
    href: "/pricing?bundle=1000",
    className: "left-[37.2%] top-[66.4%] h-[5%] w-[22.4%]"
  },
  {
    name: "Premium Bundle",
    messages: 1500,
    href: "/pricing?bundle=1500",
    className: "left-[66.2%] top-[66.4%] h-[5%] w-[21.3%]"
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
              alt="EverBond one-time message bundles"
              className="block h-auto w-full max-w-[1920px] max-h-screen object-contain"
            />

            {bundles.map((bundle) => (
              <Link
                key={bundle.messages}
                href={bundle.href}
                aria-label={`Buy ${bundle.messages.toLocaleString("en-US")} messages`}
                className={`absolute rounded-full focus:outline-none ${bundle.className}`}
                draggable={false}
              >
                <span className="sr-only">
                  Buy {bundle.messages.toLocaleString("en-US")} messages
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
