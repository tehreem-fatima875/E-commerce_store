import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link className="wordmark footer-wordmark" href="/">AVENOIR</Link>
          <p>Objects of intention.<br />Worn in your own way.</p>
        </div>
        <div className="footer-column">
          <span className="eyebrow">Explore</span>
          <Link href="/collections/women">Women</Link>
          <Link href="/collections/men">Men</Link>
          <Link href="/collections/shoes">Shoes</Link>
          <Link href="/collections/kids">Kids</Link>
        </div>
        <div className="footer-column">
          <span className="eyebrow">Avenoir</span>
          <Link href="/about">Our story</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/shipping-returns">Shipping & returns</Link>
        </div>
        <div className="footer-newsletter">
          <span className="eyebrow">A quieter kind of inbox</span>
          <p>Notes on new work, considered living and the things in between.</p>
          <NewsletterForm compact />
          <small>Newsletter sign-up is currently in preview.</small>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Avenoir. Made with intention.</span>
        <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><span>Pakistan · PKR</span></div>
      </div>
    </footer>
  );
}
