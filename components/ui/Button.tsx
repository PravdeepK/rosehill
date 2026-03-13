import Link from "next/link";

interface ButtonProps {
  href?: string;
  variant?: "primary" | "outline";
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}

export default function Button({
  href,
  variant = "primary",
  children,
  className = "",
  type = "button",
  onClick,
}: ButtonProps) {
  const base =
    "inline-block px-8 py-3 text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer";
  const variants = {
    primary:
      "bg-dark text-warm-white hover:bg-gold border border-dark hover:border-gold",
    outline:
      "border border-dark text-dark hover:bg-dark hover:text-warm-white",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
