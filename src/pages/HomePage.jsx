import { useState } from 'react';
import { useStoreData } from '../context/StoreDataContext.jsx';
import ProductCard from '../components/ui/ProductCard.jsx';
import ProductImage from '../components/ui/ProductImage.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import { collectionHref } from '../utils/router.js';

function Newsletter() {
  const [joined, setJoined] = useState(false);
  function submit(event) { event.preventDefault(); if (event.currentTarget.reportValidity()) setJoined(true); }
  return <section className="newsletter-section" aria-labelledby="newsletter-title"><div className="newsletter-copy"><p className="eyebrow">A little note from us</p><h2 id="newsletter-title">Good things, <em>occasionally.</em></h2><p>New collections, thoughtful styling notes, and first looks—sent with care.</p></div>{joined ? <p className="newsletter-success" role="status">Thanks for your interest. Newsletter sign-up will be available soon.</p> : <form className="newsletter-form" onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required /><button className="button button-dark" type="submit">Join the list <span aria-hidden="true">↗</span></button><small>Newsletter sign-up is a preview and doesn’t save your email.</small></form>}</section>;
}

export default function HomePage() {
  const { products, collections, homepage } = useStoreData();
  const visibleProducts = products.filter((product) => product.status !== 'draft');
  const productById = (id) => visibleProducts.find((item) => item.id === id);
  const featuredCollections = homepage.featuredCollectionIds.map((id) => collections.find((item) => item.id === id)).filter((item) => item && item.displayStatus !== 'draft');
  const arrivals = homepage.newArrivalProductIds.map(productById).filter((product) => product && product.isNewArrival);
  const featuredProducts = homepage.featuredProductIds.map(productById).filter(Boolean);
  const show = (key) => homepage.sections[key] !== false;
  return <>
    {show('hero') && <section className="hero-section"><div className="hero-image-wrap"><ProductImage className="hero-image" src={homepage.heroImageUrl} alt="A model wearing a flowing neutral occasion look" /></div><div className="hero-overlay" /><div className="hero-content"><p className="hero-kicker">A considered wardrobe</p><h1>{homepage.heroHeading}<br /><em>{homepage.heroEmphasis}</em></h1><p>{homepage.heroSubtitle}</p><a className="button button-light" href={homepage.heroCtaLink || collectionHref('new-arrivals')}>{homepage.heroCtaText} <span aria-hidden="true">↗</span></a></div><span className="hero-index">STUDIO EDIT <span /> 01</span></section>}
    {show('commitments') && <section className="service-strip" aria-label="Our commitments"><span><b>01</b> Made for real life</span><span><b>02</b> Thoughtfully selected</span><span><b>03</b> Shipping across Canada</span></section>}
    {show('collections') && <section className="content-section category-section"><SectionHeading eyebrow="Find your feeling" title="A place for every kind of day" /><div className="category-grid">{featuredCollections.map((collection, index) => <a className={`category-card category-card-${index + 1}`} key={collection.id} href={collectionHref(collection.id)}><ProductImage className="category-image" src={collection.image} alt="" /><span className="category-shade" /><span className="category-copy"><small>{collection.id === 'sale' ? 'A considered offer' : 'Explore the edit'}</small><strong>{collection.title}</strong><span>Explore <span aria-hidden="true">↗</span></span></span></a>)}</div></section>}
    {show('arrivals') && <section className="content-section arrivals-section"><SectionHeading eyebrow="Just arrived" title="The pieces we can’t stop thinking about" link={collectionHref('new-arrivals')} linkText="Explore New Arrivals" /><div className="product-grid">{arrivals.map((product) => <ProductCard key={product.id} product={product} />)}</div>{!arrivals.length && <p className="admin-public-empty">New pieces are on their way.</p>}</section>}
    {show('story') && <section className="story-banner"><div className="story-image-wrap"><ProductImage className="story-image" src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85" alt="A relaxed look styled for a quiet afternoon" /></div><div className="story-content"><p className="eyebrow">The art of getting dressed</p><h2>Soft structure.<br /><em>Room to breathe.</em></h2><p>We look for the pieces that make getting ready feel less like a decision and more like a small ritual.</p><a className="text-button" href={collectionHref('sets')}>Find your everyday pieces <span aria-hidden="true">↗</span></a></div></section>}
    {show('featured') && <section className="content-section edit-section"><div className="edit-intro"><p className="eyebrow">A few good things</p><h2>Little details.<br /><em>Lovely layers.</em></h2><p>Finish the look your way with soft layers and considered accessories.</p><a className="text-button" href={collectionHref('scarves')}>Explore scarves <span aria-hidden="true">↗</span></a></div><div className="edit-product-grid">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}
    {show('quote') && <section className="quote-section"><p className="eyebrow">A feeling, not a formula</p><blockquote>“Clothes should make room for the life you’re already living.”</blockquote><span>— A note from our studio</span></section>}
    {show('newsletter') && <Newsletter />}
  </>;
}
