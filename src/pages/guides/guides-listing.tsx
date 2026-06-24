import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GUIDES, GUIDE_CATEGORIES } from "@/pages/Guides";

export function GuidesListing() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredGuides =
    selectedCategory === "all"
      ? GUIDES
      : GUIDES.filter(
          (g) => t(g.categoryKey) === t(`guides.categories.${selectedCategory}`)
        );

  return (
    <>
      {/* Hero band */}
      <div className="border-b bg-muted">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold lg:text-5xl">
              {t("guides.listingTitle", "Guias e tutoriais")}
            </h1>
            <p className="max-w-2xl text-balance text-muted-foreground lg:text-lg">
              {t(
                "guides.listingDescription",
                "Aprenda a usar a Hubfy como um profissional. Guias práticos, explicações claras e exemplos visuais para tirar o máximo da plataforma."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 pb-24 sm:py-16 sm:pb-32">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Grid: sidebar + articles */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 lg:grid-cols-4">
          {/* Category sidebar (desktop) */}
          <div className="hidden flex-col gap-1 lg:flex">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "justify-start text-left",
                selectedCategory === "all" &&
                  "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {t("guides.allArticles", "Todos os guias")}
            </Button>
            {GUIDE_CATEGORIES.map((cat) => (
              <Button
                variant="ghost"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "justify-start text-left",
                  selectedCategory === cat.id &&
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {t(cat.titleKey, cat.id)}
              </Button>
            ))}
          </div>

          {/* Mobile category filter */}
          <div className="flex gap-2 overflow-x-auto lg:hidden">
            <Button
              variant={selectedCategory === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              {t("guides.allArticles", "Todos os guias")}
            </Button>
            {GUIDE_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {t(cat.titleKey, cat.id)}
              </Button>
            ))}
          </div>

          {/* Article list */}
          <div className="lg:col-span-3">
            {filteredGuides.map((guide, i) => (
              <div key={guide.slug}>
                <Link
                  to={`/guides/${guide.slug}`}
                  className="group flex flex-col gap-3"
                >
                  <p className="text-sm font-semibold text-muted-foreground">
                    {t(guide.categoryKey)}
                  </p>
                  <h3 className="text-2xl font-semibold text-balance group-hover:text-primary transition-colors lg:text-3xl">
                    {t(guide.titleKey)}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(guide.descriptionKey)}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {guide.readTime} min
                    </span>
                  </div>
                </Link>
                {i < filteredGuides.length - 1 && (
                  <Separator className="my-8" />
                )}
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
