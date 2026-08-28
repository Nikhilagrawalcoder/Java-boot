import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { StackRow } from "@/components/landing/stack-row";
import { BentoFeatures } from "@/components/landing/bento-features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CliShowcase } from "@/components/landing/cli-showcase";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { SiteFooter } from "@/components/landing/site-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <HeroSection />

        <section id="preview" className="mx-auto flex max-w-5xl justify-center px-6 pb-24">
          <DashboardPreview />
        </section>

        <StackRow />
        <BentoFeatures />
        <HowItWorks />
        <CliShowcase />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>

      <SiteFooter />
    </div>
  );
}
