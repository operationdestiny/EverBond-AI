import { AppShell } from "@/components/layout/AppShell";
import { LockedCreateForm } from "@/components/create/LockedCreateForm";
import { LocalizedBannerImage } from "@/components/ui/LocalizedBannerImage";

export const metadata = {
  title: "Create a Companion — EverBond",
  description: "Create public or private AI companions for Public Creations."
};

export default function CreatePage() {
  return (
    <AppShell>
      <main className="pb-16">
        <section className="w-full">
          <LocalizedBannerImage
            banner="create"
            alt="Create your own AI companions with Ever Memory"
            className="block h-auto w-full"
          />
        </section>

        <section className="bond-container relative z-10 -mt-24 pt-0">
          <LockedCreateForm />
        </section>
      </main>
    </AppShell>
  );
}
