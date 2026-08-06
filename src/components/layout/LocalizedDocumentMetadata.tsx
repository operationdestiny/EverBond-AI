"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSiteLanguage } from "@/lib/site-language";
import { localizedMetadataForPath } from "@/lib/final-localization-language";

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element) element.setAttribute(attribute, value);
}

export function LocalizedDocumentMetadata() {
  const pathname = usePathname();
  const { language } = useSiteLanguage();

  useEffect(() => {
    function applyMetadata() {
      const dynamicName =
        pathname.startsWith("/chat/") ||
        pathname.startsWith("/character/")
          ? document.querySelector("h1")?.textContent?.trim()
          : undefined;
      const metadata = localizedMetadataForPath(
        pathname,
        language,
        dynamicName
      );

      document.title = metadata.title;
      setMeta('meta[name="description"]', "content", metadata.description);
      setMeta('meta[property="og:title"]', "content", metadata.title);
      setMeta(
        'meta[property="og:description"]',
        "content",
        metadata.description
      );
    }

    applyMetadata();

    if (
      !pathname.startsWith("/chat/") &&
      !pathname.startsWith("/character/")
    ) {
      return;
    }

    const observer = new MutationObserver(applyMetadata);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [language, pathname]);

  return null;
}
