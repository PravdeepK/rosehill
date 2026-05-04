export default function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-xs uppercase tracking-[0.3em] text-gold block ${className}`}
    >
      {children}
    </span>
  );
}
