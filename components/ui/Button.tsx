import Link from "next/link";

interface ButtonProps {
  href?: string;
  variant?: "primary" | "outline";
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  href,
  variant = "primary",
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-8 py-3 text-sm uppercase tracking-widest transition-colors duration-300 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-dark text-warm-white hover:bg-gold hover:text-dark border border-dark hover:border-gold",
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
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
