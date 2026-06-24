import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/auth/ThemeSwitcher";
import { Separator } from "@/components/ui/separator";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function GuidesHeader() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img
            src="/brand/logo-hubfy-dark.svg"
            alt="Hubfy"
            className="h-6 dark:hidden"
          />
          <img
            src="/brand/logo-hubfy-light.svg"
            alt="Hubfy"
            className="hidden h-6 dark:block"
          />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/guides">{t("guides.title", "Guias")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/updates">{t("updates.title", "Updates")}</Link>
          </Button>
        </nav>

        {/* Actions desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/login">{t("auth.login.title", "Login")}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/signup">
              {t("auth.signup.title", "Criar conta")}
            </Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              asChild
            >
              <Link
                to="/guides"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("guides.title", "Guias")}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              asChild
            >
              <Link
                to="/updates"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("updates.title", "Updates")}
              </Link>
            </Button>
          </nav>
          <Separator className="my-2" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/login">{t("auth.login.title", "Login")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/admin/signup">
                {t("auth.signup.title", "Criar conta")}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
