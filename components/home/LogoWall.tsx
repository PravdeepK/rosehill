import fs from "fs";
import path from "path";
import SectionLabel from "@/components/ui/SectionLabel";
import LogoWallClient, { type LogoMeta } from "@/components/home/LogoWallClient";

function listLogoItems(): LogoMeta[] {
  const dir = path.join(process.cwd(), "public", "logos");
  if (!fs.existsSync(dir)) return [];
  const names = fs
    .readdirSync(dir)
    .filter(
      (f) =>
        /\.(png|svg)$/i.test(f) && !f.startsWith(".") && !f.startsWith(".__")
    )
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return names.map((name) => ({
    name,
    v: fs.statSync(path.join(dir, name)).mtimeMs,
  }));
}

export default function LogoWall() {
  const items = listLogoItems();
  if (items.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 bg-warm-grey">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 md:mb-16">
          <SectionLabel>Partners</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-light mt-4 text-dark">
            Brands we&apos;ve worked with
          </h2>
        </div>

        <LogoWallClient initialItems={items} />
      </div>
    </section>
  );
}
