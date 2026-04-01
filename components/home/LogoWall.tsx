import fs from "fs";
import path from "path";
import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";

function listLogoFiles(): string[] {
  const dir = path.join(process.cwd(), "public", "logos");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(
      (f) =>
        /\.(png|svg)$/i.test(f) && !f.startsWith(".") && !f.startsWith(".__")
    )
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export default function LogoWall() {
  const files = listLogoFiles();
  if (files.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 bg-warm-grey">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 md:mb-16">
          <SectionLabel>Partners</SectionLabel>
          <h2 className="text-2xl md:text-3xl font-light mt-4 text-dark">
            Brands we&apos;ve worked with
          </h2>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 md:gap-x-10 md:gap-y-14 list-none p-0 m-0 items-center justify-items-center">
          {files.map((file) => {
            const src = `/logos/${file}`;
            const isSvg = file.toLowerCase().endsWith(".svg");
            const label = file.replace(/\.(png|svg)$/i, "").replace(/_/g, " ");
            const mono =
              "brightness-0 contrast-100 opacity-[0.78] hover:opacity-100 transition-opacity duration-300";
            return (
              <li
                key={file}
                className="w-full max-w-[200px] h-16 md:h-[4.5rem] relative flex items-center justify-center"
              >
                {isSvg ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local trusted SVGs from /public
                  <img
                    src={src}
                    alt={label}
                    className={`max-h-full max-w-full w-full h-full object-contain object-center ${mono}`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <Image
                    src={src}
                    alt={label}
                    fill
                    className={`object-contain object-center ${mono}`}
                    sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 200px"
                    loading="lazy"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
