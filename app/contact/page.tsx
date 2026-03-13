import SectionLabel from "@/components/ui/SectionLabel";
import ContactForm from "@/components/contact/ContactForm";
import MapEmbed from "@/components/contact/MapEmbed";

export const metadata = {
  title: "Contact | Rosehill Design Build",
  description:
    "Get in touch with Rosehill Design Build for your next luxury retail, commercial, or residential project.",
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <ContactForm />
          <div className="space-y-8">
            <MapEmbed />
            <div className="space-y-3 text-sm">
              <p>
                6790 Kitimat Road, Unit 7
                <br />
                Mississauga, ON L5N 5L9
              </p>
              <p>
                <a
                  href="tel:905-826-7673"
                  className="hover:text-gold transition-colors"
                >
                  905-826-7673
                </a>
              </p>
              <p>
                <a
                  href="mailto:info@rosehilldesignbuild.com"
                  className="hover:text-gold transition-colors"
                >
                  info@rosehilldesignbuild.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
