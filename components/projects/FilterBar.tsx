"use client";

const categories = [
  "All",
  "Luxury Retail",
  "Commercial",
  "Residential",
  "Special Projects",
];

interface FilterBarProps {
  active: string;
  onChange: (category: string) => void;
}

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center py-8">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`text-xs uppercase tracking-widest px-4 py-3 border transition-colors duration-300 cursor-pointer ${
            active === cat
              ? "border-gold text-gold"
              : "border-warm-grey text-medium-grey hover:border-gold hover:text-gold"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
