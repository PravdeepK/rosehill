import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">404</p>
      <h1 className="text-2xl font-light text-dark mb-4">Page not found</h1>
      <p className="text-sm text-medium-grey max-w-sm mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-gold hover:text-gold-light transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
