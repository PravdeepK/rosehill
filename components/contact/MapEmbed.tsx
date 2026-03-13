export default function MapEmbed() {
  return (
    <div className="w-full aspect-[4/3] lg:aspect-square bg-warm-grey">
      <iframe
        src="https://maps.google.com/maps?q=6790+Kitimat+Road+Mississauga+ON+L5N+5L9&t=&z=15&ie=UTF8&iwloc=&output=embed"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Rose Hill Design Build Location"
      />
    </div>
  );
}
