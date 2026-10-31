import {
  AIIntelligenceSection,
  AudienceSection,
  CoreFeaturesSection,
  FinalCTASection,
  HeroSection,
  ProofMetricsSection,
  WorkflowSection,
} from "@/features/features/components";
import {
  aiHighlights,
  coreFeatures,
  proofMetrics,
  workflow,
} from "@/features/features/data/featuresContent";

export const metadata = {
  title: "Features — Smart Inventory, GST POS & AI Business Insights",
  description:
    "Explore Vyapar Sakha's full suite of features: real-time inventory management, rapid GST billing, barcode scanning, multi-outlet synchronization, and AI retail insights.",
  keywords: [
    "retail POS features",
    "inventory management system features",
    "GST billing features",
    "barcode scanner integration",
    "multi-store retail software",
    "AI store assistant",
    "Vyapar Sathi features"
  ],
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Vyapar Sakha Features — Built for Indian Retailers",
    description:
      "Real-time inventory, POS billing, scanner pipelines, and AI automation in one platform.",
    url: "/features",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vyapar Sakha Features — Built for Indian Retailers",
    description:
      "Real-time inventory, POS billing, scanner pipelines, and AI automation in one platform.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-rad-yb">
      <div className="bg-mesh-light">
        <HeroSection />
        <ProofMetricsSection items={proofMetrics} />
        <CoreFeaturesSection items={coreFeatures} />
        <AIIntelligenceSection items={aiHighlights} />
        <WorkflowSection items={workflow} />
        <AudienceSection />
        <FinalCTASection />
      </div>
    </main>
  );
}
