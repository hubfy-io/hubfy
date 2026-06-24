import { lazy, Suspense } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageLoader } from "@/components/ui/page-loader";

import { GuidesHeader } from "@/pages/guides/guides-header";
import { GuidesListing } from "@/pages/guides/guides-listing";
import { LandingFooter } from "@/components/LandingFooter";

/* ─── Guide registry ─── */

export interface GuideItem {
  slug: string;
  titleKey: string;
  categoryKey: string;
  descriptionKey: string;
  readTime: number;
  component: React.LazyExoticComponent<React.ComponentType>;
  sections: { id: string; titleKey: string }[];
}

export interface GuideCategory {
  id: string;
  titleKey: string;
}

export const GUIDE_CATEGORIES: GuideCategory[] = [
  { id: "orders", titleKey: "guides.categories.orders" },
  { id: "portal", titleKey: "guides.categories.portal" },
];

export const GUIDES: GuideItem[] = [
  {
    slug: "order-statuses",
    titleKey: "guides.articles.orderStatuses.title",
    categoryKey: "guides.categories.orders",
    descriptionKey: "guides.articles.orderStatuses.intro",
    readTime: 5,
    component: lazy(() => import("@/pages/guides/guide-order-statuses")),
    sections: [
      { id: "each-status", titleKey: "guides.articles.orderStatuses.eachStatusTitle" },
      { id: "summary-table", titleKey: "guides.articles.orderStatuses.summaryTableTitle" },
      { id: "flow", titleKey: "guides.articles.orderStatuses.flowTitle" },
      { id: "mockup", titleKey: "guides.articles.orderStatuses.mockupTitle" },
    ],
  },
  {
    slug: "disputed-vs-chargeback",
    titleKey: "guides.articles.disputedVsChargeback.title",
    categoryKey: "guides.categories.orders",
    descriptionKey: "guides.articles.disputedVsChargeback.intro",
    readTime: 4,
    component: lazy(() => import("@/pages/guides/guide-disputed-vs-chargeback")),
    sections: [
      { id: "disputed", titleKey: "guides.articles.disputedVsChargeback.disputed.title" },
      { id: "chargeback", titleKey: "guides.articles.disputedVsChargeback.chargeback.title" },
      { id: "comparison", titleKey: "guides.articles.disputedVsChargeback.comparisonTitle" },
      { id: "tldr", titleKey: "guides.articles.disputedVsChargeback.tldrTitle" },
    ],
  },
  {
    slug: "customer-portal",
    titleKey: "guides.articles.customerPortal.title",
    categoryKey: "guides.categories.portal",
    descriptionKey: "guides.articles.customerPortal.intro",
    readTime: 7,
    component: lazy(() => import("@/pages/guides/guide-customer-portal")),
    sections: [
      { id: "what-is", titleKey: "guides.articles.customerPortal.whatIs.title" },
      { id: "how-to-access", titleKey: "guides.articles.customerPortal.howToAccess.title" },
      { id: "navigation", titleKey: "guides.articles.customerPortal.navigation.title" },
      { id: "products-access", titleKey: "guides.articles.customerPortal.productsAccess.title" },
      { id: "orders", titleKey: "guides.articles.customerPortal.orders.title" },
      { id: "files-courses", titleKey: "guides.articles.customerPortal.filesCourses.title" },
      { id: "best-practices", titleKey: "guides.articles.customerPortal.bestPractices.title" },
    ],
  },
];

export function findGuide(slug: string): GuideItem | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/* ─── Page ─── */

export default function GuidesPage() {
  const { guideSlug } = useParams<{ guideSlug?: string }>();

  // /guides → listing page
  if (!guideSlug) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <GuidesHeader />
        <GuidesListing />
        <div className="mt-auto">
          <LandingFooter />
        </div>
      </div>
    );
  }

  // /guides/:slug → article page
  const guide = findGuide(guideSlug);
  if (!guide) {
    return <Navigate to="/guides" replace />;
  }

  const GuideContent = guide.component;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GuidesHeader />
      <Suspense fallback={<PageLoader />}>
        <GuideContent />
      </Suspense>
      <div className="mt-auto pt-16">
        <LandingFooter />
      </div>
    </div>
  );
}
