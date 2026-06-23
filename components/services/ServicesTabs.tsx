import type { ServiceCategory } from "@/lib/data";

export default function ServicesCards({
  categories,
}: {
  categories: ServiceCategory[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {categories.map((cat) => (
        <div
          key={cat.name}
          className="bg-warm-white p-10 md:p-12 border border-transparent hover:border-gold transition-colors duration-300"
        >
          <h3 className="text-lg md:text-xl font-medium text-gold-contrast mb-7 pb-6 border-b border-medium-grey/15">
            {cat.name}
          </h3>
          <ul className="space-y-4">
            {cat.items.map((item) => (
              <li key={item} className="flex items-baseline gap-4">
                <span className="text-gold text-xs leading-none shrink-0 mt-[3px]">●</span>
                <span className="text-sm md:text-[15px] text-medium-grey leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
