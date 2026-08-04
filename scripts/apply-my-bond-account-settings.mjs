import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, "utf8");
}

function requireReplace(content, from, to, label) {
  if (content.includes(to)) return content;
  if (!content.includes(from)) {
    throw new Error(`My Bond patch could not find: ${label}`);
  }
  return content.replace(from, to);
}

function requireRegexReplace(content, pattern, replacement, label) {
  if (pattern.test(content)) {
    return content.replace(pattern, replacement);
  }
  if (content.includes(replacement.trim())) return content;
  throw new Error(`My Bond patch could not find: ${label}`);
}

const pagePath = "src/app/my-bond/page.tsx";
let page = read(pagePath);

page = page.replace(
  'import { GiftInventorySection } from "@/components/evershop/GiftInventorySection";\n',
  ""
);

page = requireReplace(
  page,
  `  return (
    <>
      <MyBondDashboard session={session} />
      <GiftInventorySection session={session} />
    </>
  );`,
  `  return <MyBondDashboard session={session} />;`,
  "standalone My Gifts placement"
);

write(pagePath, page);

const dashboardPath =
  "src/components/my-bond/MyBondDashboard.tsx";
let dashboard = read(dashboardPath);

const actionsImport =
  'import { AccountSettingsActions } from "@/components/my-bond/AccountSettingsActions";';
const giftsImport =
  'import { MyBondGiftInventorySection } from "@/components/evershop/MyBondGiftInventorySection";';

if (!dashboard.includes(actionsImport)) {
  dashboard = requireReplace(
    dashboard,
    'import { MyCompanionActions, type UpdatedCompanion } from "@/components/my-bond/MyCompanionActions";',
    `import { MyCompanionActions, type UpdatedCompanion } from "@/components/my-bond/MyCompanionActions";
${actionsImport}
${giftsImport}`,
    "My Bond component imports"
  );
}

dashboard = requireRegexReplace(
  dashboard,
  /<div>\s*<p className="text-sm font-bold uppercase tracking-\[0\.22em\] text-bond-rose">\s*\{copy\.recentChats\}\s*<\/p>\s*<h2 className="mt-2 font-display text-3xl font-bold text-white">\s*\{copy\.recentChats\}\s*<\/h2>\s*<\/div>/,
  `<div>
            <h2 className="font-display text-3xl font-bold text-bond-rose">
              {copy.recentChats}
            </h2>
          </div>`,
  "duplicate Recent Chats headings"
);

dashboard = requireRegexReplace(
  dashboard,
  /<div>\s*<p className="text-sm font-bold uppercase tracking-\[0\.22em\] text-bond-rose">\s*\{copy\.myCompanions\}\s*<\/p>\s*<h2 className="mt-2 font-display text-3xl font-bold text-white">\s*\{copy\.myCompanions\}\s*<\/h2>\s*<p className="mt-2 text-sm text-bond-muted">\s*\{data\.counts\.createdCompanions\} \/ 25\s*<\/p>\s*<\/div>/,
  `<div>
            <h2 className="font-display text-3xl font-bold text-bond-rose">
              {copy.myCompanions}
            </h2>
            <p className="mt-2 text-sm text-bond-muted">
              {data.counts.createdCompanions} / 25
            </p>
          </div>`,
  "duplicate My Companions headings"
);

dashboard = requireRegexReplace(
  dashboard,
  /<div>\s*<p className="text-sm font-bold uppercase tracking-\[0\.22em\] text-bond-rose">\s*\{copy\.favorites\}\s*<\/p>\s*<h2 className="mt-2 font-display text-3xl font-bold text-white">\s*\{copy\.favoriteCompanions\}\s*<\/h2>\s*<\/div>/,
  `<div>
            <h2 className="font-display text-3xl font-bold text-bond-rose">
              {copy.favoriteCompanions}
            </h2>
          </div>`,
  "duplicate Favorites headings"
);

if (!dashboard.includes("<MyBondGiftInventorySection session={session} />")) {
  dashboard = requireReplace(
    dashboard,
    '          <section className="mt-8 grid gap-6 lg:grid-cols-2">',
    `          <MyBondGiftInventorySection session={session} />

          <section className="mt-8 grid gap-6">`,
    "My Gifts placement before Account Information"
  );
} else {
  dashboard = dashboard.replace(
    '          <section className="mt-8 grid gap-6 lg:grid-cols-2">',
    '          <section className="mt-8 grid gap-6">'
  );
}

if (!dashboard.includes("<AccountSettingsActions")) {
  dashboard = requireRegexReplace(
    dashboard,
    /(<div className="flex flex-wrap justify-between gap-3 py-4">\s*<span className="text-bond-muted">\s*\{copy\.memberSince\}\s*<\/span>\s*<span className="font-semibold text-white">\s*\{formatDate\(data\.profile\.memberSince\)\}\s*<\/span>\s*<\/div>)(\s*<\/div>\s*<\/div>\s*<div className="rounded-\[2rem\] border border-white\/10 bg-white\/\[0\.025\] p-6 md:p-8">)/,
    `$1

                <AccountSettingsActions
                  session={session}
                  currentEmail={data.profile.email}
                />$2`,
    "Account Information actions"
  );
}

write(dashboardPath, dashboard);

console.log(
  "My Bond layout and account-management source patch complete."
);
