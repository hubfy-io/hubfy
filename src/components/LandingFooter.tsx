import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingFooter() {
  const productLinks = [
    { label: "Guides", href: "/guides", internal: true },
    { label: "Documentation", href: "/docs", internal: true },
    { label: "Pricing", href: "/pricing", internal: true },
    { label: "Updates", href: "/updates", internal: true },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* CTA bar */}
      <div className="border-b border-background/10 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            Build your business on Hubfy
          </h3>
          <Button
            variant="outline"
            size="lg"
            className="border-background/20 bg-transparent text-background hover:bg-background hover:text-foreground"
            asChild
          >
            <Link to="/admin/signup">Start Free Trial</Link>
          </Button>
        </div>
      </div>

      {/* Links grid */}
      <div className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 sm:grid-cols-5 sm:gap-6">
          {/* Logo */}
          <div className="col-span-2 sm:col-span-1">
            <img
              src="/brand/logo-hubfy-light.svg"
              alt="Hubfy"
              className="h-6 w-auto"
            />
          </div>

          {/* Company */}
          <div>
            <p className="mb-3 text-sm font-semibold">Company</p>
            <ul className="space-y-2">
              {["About", "Careers", "Hire an Expert"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-background/60 transition-colors hover:text-background">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <p className="mb-3 text-sm font-semibold">Product</p>
            <ul className="space-y-2">
              {productLinks.map((item) => (
                <li key={item.label}>
                  {item.internal ? (
                    <Link
                      to={item.href}
                      className="text-sm text-background/60 transition-colors hover:text-background"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="text-sm text-background/60 transition-colors hover:text-background"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="mb-3 text-sm font-semibold">Resources</p>
            <ul className="space-y-2">
              {["Blog", "Videos & Webinars", "Help Center", "Status"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-background/60 transition-colors hover:text-background">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-sm font-semibold">Legal</p>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-background/60 transition-colors hover:text-background">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-background/60 transition-colors hover:text-background">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Social icons */}
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/hubfy.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/40 transition-colors hover:text-background"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://web.facebook.com/profile.php?id=61576567452338"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/40 transition-colors hover:text-background"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <span
              className="text-background/40"
              aria-label="X"
            >
              <Twitter className="h-5 w-5" />
            </span>
          </div>
          <p className="text-xs text-background/40">
            © 2026 Hubfy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
