export default function SectionLabel({
  children,
  className = "",
  // Defaults to the AA-contrast gold used on light backgrounds. On dark
  // sections pass `text-gold` (or `text-gold-light`) so the label still reads
  // as gold instead of disappearing into the background.
  color = "text-gold-contrast",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={`text-xs uppercase tracking-[0.3em] ${color} block ${className}`}
    >
      {children}
    </span>
  );
}
