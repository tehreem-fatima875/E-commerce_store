"use client";

import { motion } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { imageUrl, products } from "@/data/development-fixtures";

const departments = [
  { title: "Women", note: "A study in softness", image: "photo-1529139574466-a303027c1d8b", href: "/collections/women", position: "center 35%" },
  { title: "Men", note: "Ease, considered", image: "photo-1519085360753-af0119f7cbe7", href: "/collections/men", position: "center 30%" },
  { title: "Shoes", note: "Grounded in form", image: "photo-1543163521-1bf539c55dd2", href: "/collections/shoes", position: "center" },
  { title: "Kids", note: "Room to become", image: "photo-1503919005314-30d93d07d823", href: "/collections/kids", position: "center" },
];

const riseIn = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-heading" className="hero">
        <div aria-hidden="true" className="hero-image" />
        <div className="hero-shade" />
        <motion.div
          animate="visible"
          className="hero-content"
          initial="hidden"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } } }}
        >
          <motion.span className="hero-kicker" variants={riseIn}>Avenoir · Collection 01</motion.span>
          <motion.h1 id="hero-heading" variants={riseIn}>A softer way<br />to <em>arrive.</em></motion.h1>
          <motion.p variants={riseIn}>Considered pieces, made to move with you.<br />An everyday wardrobe, seen differently.</motion.p>
          <motion.div className="hero-actions" variants={riseIn}>
            <Link className="button button-light" href="/collections/new-arrivals">Shop the collection <ArrowRight size={15} /></Link>
            <Link className="text-link text-link-light" href="/about">Discover Avenoir <ArrowUpRight size={15} /></Link>
          </motion.div>
        </motion.div>
        <div className="hero-index"><span>01</span><span className="hero-index-line" /><span>04</span></div>
        <Link aria-label="Scroll to discover" className="hero-scroll" href="#departments"><ArrowDown size={15} /> Scroll to explore</Link>
        <span className="hero-caption">A study in light & form — 2026</span>
      </section>

      <section className="intro section-wrap">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={riseIn}>
          Avenoir is an invitation to look forward with a little more intention. Thoughtful forms, tactile materials and the space to make them your own.
        </motion.p>
        <span className="eyebrow">The art of everyday</span>
      </section>

      <section aria-labelledby="department-heading" className="department-section section-wrap" id="departments">
        <div className="section-heading">
          <div><span className="eyebrow">Find your own way</span><h2 id="department-heading">Made for <em>every day.</em></h2></div>
          <Link className="text-link" href="/collections/all">Explore all collections <ArrowRight size={15} /></Link>
        </div>
        <div className="department-grid">
          {departments.map((department, index) => (
            <motion.div
              className={`department-card department-card-${index + 1}`}
              initial={{ opacity: 0, y: 24 }}
              key={department.title}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <Link href={department.href}>
                <div
                  aria-label={`${department.title} collection`}
                  className="department-image"
                  role="img"
                  style={{ backgroundImage: `url("${imageUrl(department.image, 1100)}")`, backgroundPosition: department.position }}
                />
                <div className="department-overlay" />
                <div className="department-copy"><span>{department.note}</span><h3>{department.title}</h3></div>
                <span aria-hidden="true" className="department-arrow"><ArrowUpRight size={18} /></span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="featured-section section-wrap">
        <div className="section-heading">
          <div><span className="eyebrow">The considered edit</span><h2 id="featured-heading">Pieces to <em>keep close.</em></h2></div>
          <Link className="text-link" href="/collections/essentials">View the edit <ArrowRight size={15} /></Link>
        </div>
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.handle} product={product} />)}
        </div>
      </section>

      <section aria-labelledby="editorial-heading" className="editorial-section">
        <div className="editorial-image" role="img" aria-label="A sunlit, quiet architectural interior" />
        <div className="editorial-copy">
          <span className="eyebrow">A note on less, and better</span>
          <h2 id="editorial-heading">The beauty of<br /><em>enough.</em></h2>
          <p>We believe getting dressed can be a quieter ritual. A considered palette, a familiar shape, a piece that feels more like yours each time you wear it.</p>
          <Link className="text-link" href="/about">The Avenoir point of view <ArrowUpRight size={15} /></Link>
          <span className="editorial-mark">A / 01</span>
        </div>
      </section>

      <section aria-labelledby="arrivals-heading" className="arrivals-section section-wrap">
        <div className="arrivals-heading">
          <div><span className="eyebrow">Just found its way here</span><h2 id="arrivals-heading">New <em>arrivals.</em></h2></div>
          <p>New season, familiar feeling.<br />Made to find a place in your everyday.</p>
        </div>
        <div className="arrivals-feature">
          <div className="arrivals-image" role="img" aria-label="A model wearing the new season collection" />
          <div className="arrivals-caption"><span>01 / The everyday uniform</span><Link href="/collections/new-arrivals">Meet the new collection <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      <section className="newsletter-section">
        <span className="eyebrow">A little something, occasionally</span>
        <h2>Stay in the <em>know.</em></h2>
        <p>New collections, thoughtful notes and a closer look at the things we make.</p>
        <NewsletterForm />
        <small>Newsletter sign-up is in preview; submissions are not stored.</small>
      </section>
    </>
  );
}
