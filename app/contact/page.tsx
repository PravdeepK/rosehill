import SectionLabel from "@/components/ui/SectionLabel";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact | Rose Hill Design Build",
  description:
    "Get in touch with Rose Hill Design Build for your next luxury retail, commercial, or residential project across North America.",
};

export default function ContactPage() {
  return (
    <section className="pt-32 pb-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Contact</SectionLabel>
          <h1 className="text-3xl md:text-4xl font-light mt-4 mb-4">
            Get In Touch
          </h1>
          <p className="text-medium-grey max-w-xl mx-auto">
            Ready to start your project? Reach out and one of our team will be
            in touch.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <ContactForm />
          <div className="flex justify-center mt-8 text-sm text-medium-grey">
            <a
              href="tel:905-826-7673"
              className="hover:text-gold transition-colors"
            >
              905-826-7673
            </a>
          </div>
        </div>

        <div className="border-t border-warm-grey pt-16">
          <h2 className="text-center text-xs uppercase tracking-widest text-gold mb-10">
            Our Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="w-full aspect-video bg-warm-grey rounded-sm overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=6790+Kitimat+Road+Mississauga+ON+L5N+5L9&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Rose Hill Design Build — Canada"
                />
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium">Rose Hill Design Build</p>
                <p className="text-medium-grey">6790 Kitimat Road, Unit 7</p>
                <p className="text-medium-grey">Mississauga, ON L5N 5L9</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full aspect-video bg-warm-grey rounded-sm overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=16192+Coastal+Hwy+Lewes+DE+19958&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Rose Hill Design Build — United States"
                />
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium">Rose Hill Design Build LLC</p>
                <p className="text-medium-grey">16192 Coastal Hwy.</p>
                <p className="text-medium-grey">Lewes, DE 19958</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
