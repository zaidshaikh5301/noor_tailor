import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  categories,
  editorialImages,
  getFaqs,
  getProduct,
  getProducts,
  homeCategoryImages,
  shopConfig,
  testimonials,
} from "./services/catalog";
import type { Product } from "./types";
import { useStore } from "./hooks/useStore";
import { handleImageError } from "./utils/productFallback";
import { productPath } from "./utils/paths";
import { ProductCard } from "./components/ProductCard";
import { errorMessage } from "./services/apiClient";
import { validateCoupon } from "./services/coupons";
import { createAppointment } from "./services/appointments";
import { sendContactMessage } from "./services/contact";
import { buildWhatsAppUrl, buildOrderWhatsAppMessage, buildProductEnquiryMessage, buildAppointmentWhatsAppMessage, buildContactWhatsAppMessage } from "./utils/whatsapp";
import { getWebPPath, getThumbnailPath } from "./utils/imagePaths";
import "./App.css";

function useCatalog() {
  const [items, setItems] = useState<Product[]>([]),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    getProducts().then((data) => {
      if (alive) {
        setItems(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);
  return { items, loading };
}
function imageFallback(
  event: React.SyntheticEvent<HTMLImageElement>,
) {
  handleImageError(event);
}
function Header() {
  const { cart, wishlist } = useStore();
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  useEffect(() => {
    let active = true;
    if (query.trim()) {
      getProducts().then((p) => {
        if (active)
          setSuggestions(
            p
              .filter((x) => x.name.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 4),
          );
      });
    } else Promise.resolve().then(() => setSuggestions([]));
    return () => {
      active = false;
    };
  }, [query]);
  return (
    <>
      <div className="announcement">
        Complimentary alterations on orders over ₹20,000 <span>·</span> Visit
      </div>
      <header className="site-header">
        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? "Close" : "Menu"}
        </button>
        <NavLink to="/" className="wordmark">
          NOOR <small>TAILORING HOUSE.</small>
        </NavLink>
        <nav className={`main-nav ${open ? "mobile-open" : ""}`}>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/shop/wedding">Wedding</NavLink>
          <NavLink to="/tailoring">Made to Measure</NavLink>
          <NavLink to="/about">Our House</NavLink>
        </nav>
        <div className="header-actions">
          <div className="search-wrap">
            <input
              aria-label="Search products"
              placeholder="Search pieces"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    to={productPath(p.slug)}
                    onClick={() => setQuery("")}
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link className="header-link" to="/wishlist">
            Saved <sup>{wishlist.length || ""}</sup>
          </Link>
          <Link className="header-link" to="/cart">
            Bag{" "}
            <sup>
              {cart.reduce((sum, item) => sum + item.quantity, 0) || ""}
            </sup>
          </Link>
        </div>
      </header>
    </>
  );
}
function Footer() {
  const whatsappLink = buildWhatsAppUrl(`Hello ${shopConfig.name}, I would like to get in touch.`);
  return (
    <footer>
      <div className="footer-top">
        <div>
          <Link to="/" className="wordmark footer-mark">
            NOOR<small>TAILORING HOUSE</small>
          </Link>
          <p>
            Clothes with a sense of occasion.
            <br />
            Made with care in {shopConfig.city}, {shopConfig.state}.
          </p>
        </div>
        <div>
          <span className="eyebrow">Explore</span>
          <Link to="/shop">Shop all</Link>
          <Link to="/tailoring">Made to measure</Link>
          <Link to="/about">Our house</Link>
        </div>
        <div>
          <span className="eyebrow">Care & service</span>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">Frequently asked</Link>
          <Link to="/shipping">Shipping & returns</Link>
        </div>
        <div>
          <span className="eyebrow">Visit the atelier</span>
          <p>
            {shopConfig.addressLines.join('<br />')}
            <br />
            {shopConfig.openingHours}
          </p>
          <a
            href={whatsappLink.url}
            target="_blank"
            rel="noreferrer"
            className={whatsappLink.isPlaceholder ? 'placeholder' : ''}
          >
            {whatsappLink.isPlaceholder ? 'WhatsApp (number not configured)' : 'WhatsApp the atelier ↗'}
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {shopConfig.name} 2026</span>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
        <span>{shopConfig.city}, {shopConfig.state}</span>
      </div>
    </footer>
  );
}
function Home() {
  const { items, loading } = useCatalog();
  return (
    <>
      <section className="hero-home">
        <div className="hero-copy">
          <span className="eyebrow light">A TAILORING HOUSE </span>
          <h1>
            For the days
            <br />
            that stay with you.
          </h1>
          <p>Clothes made with patience, for occasions that deserve it.</p>
          <Link className="button button-light" to="/shop">
            Discover the collection <span>↗</span>
          </Link>
        </div>
        <div className="hero-visual">
          <picture>
            <source srcSet={getThumbnailPath(editorialImages.groom)} media="(max-width: 600px)" type="image/webp" />
            <source srcSet={getWebPPath(editorialImages.groom)} type="image/webp" />
            <img
              className="hero-photo"
              src={editorialImages.groom}
              alt="Indian groom in an ivory wedding outfit and turban, photographed outdoors"
              width="1200"
              height="900"
              fetchPriority="high"
              loading="eager"
              onError={imageFallback}
            />
          </picture>
          <div className="hero-caption">
            THE WEDDING EDIT &nbsp; / &nbsp; 2026
          </div>
        </div>
      </section>
      <section className="intro-band">
        <span className="eyebrow">DRESS WITH INTENTION</span>
        <p>
          Good clothes do not ask for attention.
          <br />
          <em>They earn it.</em>
        </p>
        <span className="intro-note">
          Thoughtful cloth. A considered fit.
          <br />
          The ease of knowing it is yours.
        </span>
      </section>
      <section className="section category-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE NOOR WARDROBE</span>
            <h2>Made for the moment.</h2>
          </div>
          <Link className="text-link" to="/shop">
            View everything ↗
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <Link
              key={c.slug}
              to={`/shop/${c.slug}`}
              className={`category-tile tile-${i + 1}`}
            >
              <span className="category-number">0{i + 1} / COLLECTION</span>
              <picture>
                <source srcSet={getThumbnailPath(homeCategoryImages[c.name as keyof typeof homeCategoryImages]?.src || '')} media="(max-width: 600px)" type="image/webp" />
                <source srcSet={getWebPPath(homeCategoryImages[c.name as keyof typeof homeCategoryImages]?.src || '')} type="image/webp" />
                <img
                  className="category-photo"
                  src={homeCategoryImages[c.name as keyof typeof homeCategoryImages]?.src || ''}
                  alt={homeCategoryImages[c.name as keyof typeof homeCategoryImages]?.alt ?? c.name}
                  loading="lazy"
                  onError={imageFallback}
                />
              </picture>
              <div className="category-name">
                <strong>{c.name}</strong>
                <span>
                  {c.note} <b>↗</b>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="wedding-feature">
        <div className="feature-art">
          <picture>
            <source srcSet={getThumbnailPath(editorialImages.featureWedding)} media="(max-width: 600px)" type="image/webp" />
            <source srcSet={getWebPPath(editorialImages.featureWedding)} type="image/webp" />
            <img
              className="feature-photo"
              src={editorialImages.featureWedding}
              alt="Groom wearing an embroidered maroon sherwani"
              loading="lazy"
              onError={imageFallback}
            />
          </picture>
          <span className="art-note">A STUDY IN FORM / 01</span>
        </div>
        <div className="feature-copy">
          <span className="eyebrow">THE WEDDING EDIT</span>
          <h2>
            He will remember
            <br />
            how it felt.
          </h2>
          <p>
            A sherwani chosen slowly. A fitting that leaves room to breathe. An
            outfit that feels like him, only more so.
          </p>
          <Link className="button button-dark" to="/shop/wedding">
            Explore wedding wear <span>↗</span>
          </Link>
        </div>
      </section>
      <section className="section products-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">JUST ARRIVED</span>
            <h2>New to the house.</h2>
          </div>
          <Link className="text-link" to="/shop?sort=newest">
            See new arrivals ↗
          </Link>
        </div>
        <ProductGrid
          items={items.filter((x) => x.isNew).slice(0, 4)}
          loading={loading}
        />
      </section>
      <section className="measure-band">
        <div className="measure-photo">
          <picture>
            <source srcSet={getThumbnailPath(editorialImages.tailoring)} media="(max-width: 600px)" type="image/webp" />
            <source srcSet={getWebPPath(editorialImages.tailoring)} type="image/webp" />
            <img
              className="measure-photo-image"
              src={editorialImages.tailoring}
              alt="Tailor taking measurements for a fitted suit in an atelier"
              loading="lazy"
              onError={imageFallback}
            />
          </picture>
          <span className="art-note">A FITTING AT THE ATELIER</span>
        </div>
        <div className="measure-copy">
          <span className="eyebrow">MADE TO MEASURE</span>
          <h2>
            A little more
            <br />
            like you.
          </h2>
          <p>
            Our tailor takes the time to get the shoulders right, the sleeve
            just so, and the details entirely yours.
          </p>
          <ol>
            <li>
              <b>01</b>
              <span>
                A conversation
                <br />
                Tell us where you are going.
              </span>
            </li>
            <li>
              <b>02</b>
              <span>
                Your measurements
                <br />
                Taken by hand, here or at home.
              </span>
            </li>
            <li>
              <b>03</b>
              <span>
                A fitting
                <br />
                Fine-tuned until it feels right.
              </span>
            </li>
          </ol>
          <Link className="text-link" to="/tailoring">
            Book an appointment ↗
          </Link>
        </div>
      </section>
      <section className="section products-section bestseller">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WORN, LOVED, RETURNED TO</span>
            <h2>The house favourites.</h2>
          </div>
          <Link className="text-link" to="/shop?sort=popular">
            Shop bestsellers ↗
          </Link>
        </div>
        <ProductGrid
          items={items.filter((x) => x.isBestseller).slice(0, 4)}
          loading={loading}
        />
      </section>
      <section className="testimonial-section">
        <span className="eyebrow">A NOTE FROM OUR CLIENTS</span>
        <div className="quote-mark">“</div>
        <blockquote>{testimonials[0].quote}</blockquote>
        <span className="quote-credit">
          {testimonials[0].name} <i>·</i> {testimonials[0].occasion}
        </span>
      </section>
      <section className="lookbook">
        <div className="lookbook-title">
          <span className="eyebrow">A FEW MOMENTS IN NOOR</span>
          <h2>Worn in good company.</h2>
          <a href={shopConfig.instagramUrl} target="_blank" rel="noreferrer">
            Follow along on Instagram ↗
          </a>
        </div>
        <div className="lookbook-image look-1">
          <picture>
            <source srcSet={getThumbnailPath(editorialImages.lookbookGroom)} media="(max-width: 600px)" type="image/webp" />
            <source srcSet={getWebPPath(editorialImages.lookbookGroom)} type="image/webp" />
            <img
              src={editorialImages.lookbookGroom}
              alt="Groom in ivory traditional wedding wear"
              width="600"
              height="720"
              loading="lazy"
              onError={imageFallback}
            />
          </picture>
          <span>01 / BEFORE THE CEREMONY</span>
        </div>
        <div className="lookbook-image look-2">
          <picture>
            <source srcSet={getThumbnailPath(editorialImages.kurtas)} media="(max-width: 600px)" type="image/webp" />
            <source srcSet={getWebPPath(editorialImages.kurtas)} type="image/webp" />
            <img
              src={editorialImages.kurtas}
              alt="Models in colorful embroidered kurta pajama sets"
              width="600"
              height="720"
              loading="lazy"
              onError={imageFallback}
            />
          </picture>
          <span>02 / THE LAST FITTING</span>
        </div>
        <div className="lookbook-image look-3">
          <picture>
            <source srcSet={getThumbnailPath(editorialImages.lookbookEvening)} media="(max-width: 600px)" type="image/webp" />
            <source srcSet={getWebPPath(editorialImages.lookbookEvening)} type="image/webp" />
            <img
              src={editorialImages.lookbookEvening}
              alt="Model wearing a deep green velvet blazer"
              width="600"
              height="720"
              loading="lazy"
              onError={imageFallback}
            />
          </picture>
          <span>03 / AFTER HOURS</span>
        </div>
      </section>
      <VisitBanner />
    </>
  );
}
function ProductGrid({
  items,
  loading,
}: {
  items: Product[];
  loading: boolean;
}) {
  if (loading)
    return (
      <div className="product-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" />
        ))}
      </div>
    );
  return (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
function Shop() {
  const { items, loading } = useCatalog();
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [min, setMin] = useState(params.get("min") || "");
  const [size, setSize] = useState(params.get("size") || "");
  const [fabric, setFabric] = useState(params.get("fabric") || "");
  const [occasion, setOccasion] = useState(params.get("occasion") || "");
  const [color, setColor] = useState(params.get("color") || "");
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [shown, setShown] = useState(8);
  const nav = useNavigate();
  const filtered = useMemo(() => {
    let list = items.filter(
      (p) =>
        (!category ||
          p.category.toLowerCase().replace(/\W/g, "") ===
            category.replace(/-/g, "")) &&
        (!search ||
          `${p.name} ${p.fabric} ${p.category}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!min || p.price >= Number(min)) &&
        (!size || p.sizes.includes(size)) &&
        (!fabric || p.fabric.toLowerCase().includes(fabric.toLowerCase())) &&
        (!occasion ||
          p.occasion.some((x) => x.toLowerCase() === occasion.toLowerCase())) &&
        (!color ||
          p.colors.some((x) => x.name.toLowerCase() === color.toLowerCase())),
    );
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "popular")
      list.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
    if (sort === "newest")
      list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return list;
  }, [items, category, search, min, size, fabric, occasion, color, sort]);
  function sync(next: URLSearchParams) {
    setParams(next, { replace: true });
  }
  return (
    <main className="page-shell shop-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / Shop{" "}
        {category && `/ ${category.replace("-", " ")}`}
      </div>
      <div className="shop-title">
        <div>
          <span className="eyebrow">THE COLLECTION</span>
          <h1>
            {category ? category.replace("-", " ") : "A considered wardrobe."}
          </h1>
          <p>Pieces to wear often. And remember.</p>
        </div>
        <span className="result-count">{filtered.length} pieces</span>
      </div>
      <div className="shop-toolbar">
        <input
          aria-label="Search collection"
          placeholder="Search the collection"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            const p = new URLSearchParams(params);
            if (e.target.value) {
              p.set("q", e.target.value);
            } else {
              p.delete("q");
            }
            sync(p);
          }}
        />
        <select
          aria-label="Filter category"
          value={category || ""}
          onChange={(e) =>
            nav(e.target.value ? `/shop/${e.target.value}` : "/shop")
          }
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter price"
          value={min}
          onChange={(e) => {
            setMin(e.target.value);
            const p = new URLSearchParams(params);
            if (e.target.value) {
              p.set("min", e.target.value);
            } else {
              p.delete("min");
            }
            sync(p);
          }}
        >
          <option value="">Any price</option>
          <option value="10000">₹10,000+</option>
          <option value="20000">₹20,000+</option>
          <option value="30000">₹30,000+</option>
        </select>
        <select
          aria-label="Filter size"
          value={size}
          onChange={(e) => {
            setSize(e.target.value);
            const p = new URLSearchParams(params);
            if (e.target.value) {
              p.set("size", e.target.value);
            } else {
              p.delete("size");
            }
            sync(p);
          }}
        >
          <option value="">Any size</option>
          {["S", "M", "L", "XL", "XXL"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Filter fabric"
          value={fabric}
          onChange={(e) => {
            setFabric(e.target.value);
            const p = new URLSearchParams(params);
            if (e.target.value) {
              p.set("fabric", e.target.value);
            } else {
              p.delete("fabric");
            }
            sync(p);
          }}
        >
          <option value="">Any fabric</option>
          {[...new Set(items.map((x) => x.fabric))].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Filter occasion"
          value={occasion}
          onChange={(e) => {
            setOccasion(e.target.value);
            const p = new URLSearchParams(params);
            if (e.target.value) {
              p.set("occasion", e.target.value);
            } else {
              p.delete("occasion");
            }
            sync(p);
          }}
        >
          <option value="">Any occasion</option>
          {[...new Set(items.flatMap((x) => x.occasion))].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Filter colour"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            const p = new URLSearchParams(params);
            if (e.target.value) {
              p.set("color", e.target.value);
            } else {
              p.delete("color");
            }
            sync(p);
          }}
        >
          <option value="">Any colour</option>
          {[...new Set(items.flatMap((x) => x.colors.map((c) => c.name)))].map(
            (x) => (
              <option key={x}>{x}</option>
            ),
          )}
        </select>
        <select
          aria-label="Sort products"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            const p = new URLSearchParams(params);
            p.set("sort", e.target.value);
            sync(p);
          }}
        >
          <option value="newest">Newest</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
          <option value="popular">Popularity</option>
        </select>
      </div>
      <div className="filter-chips">
        {(search || min || size || fabric || occasion || color) && (
          <>
            <span>Showing filtered pieces</span>
            <button
              onClick={() => {
                setSearch("");
                setMin("");
                setSize("");
                setFabric("");
                setOccasion("");
                setColor("");
                setParams({ sort });
              }}
            >
              Clear all ×
            </button>
          </>
        )}
      </div>
      {loading ? (
        <ProductGrid items={[]} loading />
      ) : filtered.length ? (
        <>
          <ProductGrid items={filtered.slice(0, shown)} loading={false} />
          {shown < filtered.length && (
            <button
              className="button button-outline load-more"
              onClick={() => setShown((x) => x + 8)}
            >
              Load more pieces
            </button>
          )}
        </>
      ) : (
        <div className="empty-state">
          <span className="eyebrow">NOTHING HERE JUST YET</span>
          <h2>Try another search.</h2>
          <button
            className="text-link"
            onClick={() => {
              setSearch("");
              setMin("");
              setSize("");
              setFabric("");
              setOccasion("");
              setColor("");
              setParams({});
            }}
          >
            Clear filters ↗
          </button>
        </div>
      )}
    </main>
  );
}
function ProductPage() {
  const { slug = "" } = useParams();
  const { add, toggleWish, wishlist } = useStore();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1),
    [size, setSize] = useState("M"),
    [sizeOpen, setSizeOpen] = useState(false),
    [open, setOpen] = useState("");
  const { items } = useCatalog();
  useEffect(() => {
    getProduct(slug).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="product-grid">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 500 }} />
          ))}
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page-shell confirmation">
        <span className="eyebrow">PIECE NOT FOUND</span>
        <h1>
          This piece is not in the collection.
        </h1>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link className="button button-dark" to="/shop">
          Return to shop ↗
        </Link>
      </main>
    );
  }

  const firstImage = product.images?.[0] ?? '/images/products/ivory-raw-silk-bandhgala.jpg';
  const firstColor = product.colors?.[0];
  const hasPrice = typeof product.price === 'number' && product.price > 0;

  const productEnquiryMessage = buildProductEnquiryMessage({
    productName: product.name,
    size: size,
    color: firstColor?.name || 'N/A',
    pageUrl: `${location.origin}/product/${product.slug}`,
  });
  const productEnquiry = buildWhatsAppUrl(productEnquiryMessage);

  const heroWebP = getWebPPath(firstImage);
  const heroThumb = getThumbnailPath(firstImage);

  return (
    <main className="page-shell product-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}
      </div>
      <div className="product-detail">
        <div className="gallery">
          <div className="gallery-main">
            <div
              className="product-large-art"
              style={
                { "--garment": firstColor?.hex } as React.CSSProperties
              }
            >
              <span>
                NOOR
                <br />
                ATELIER
              </span>
            </div>
            <picture>
              <source srcSet={heroThumb} media="(max-width: 600px)" type="image/webp" />
              <source srcSet={heroWebP} type="image/webp" />
              <img
                className="gallery-photo"
                src={firstImage}
                alt={product.imageAlt ?? product.name}
                width="900"
                height="1100"
                loading="eager"
                fetchPriority="high"
                onError={(e) => handleImageError(e, `product:${product.slug}`)}
              />
            </picture>
            <span className="gallery-index">01 / 01</span>
          </div>
        </div>
        <div className="product-info">
          <span className="eyebrow">
            {product.category} / {product.subcategory}
          </span>
          <h1>{product.name}</h1>
          {product.isNew && <span className="badge" style={{ marginBottom: 12 }}>New</span>}
          {product.isBestseller && <span className="badge" style={{ marginBottom: 12, background: '#e8e4da', color: '#333' }}>Bestseller</span>}
          <p>{product.description}</p>
          <div className="detail-rule" />
          {hasPrice && (
            <div className="price-row" style={{ marginBottom: 24 }}>
              <span className="field-label">PRICE</span>
              <span style={{ font: '400 28px var(--serif)', color: 'var(--ink)' }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            </div>
          )}
          {!hasPrice && (
            <div className="price-row" style={{ marginBottom: 24 }}>
              <span className="field-label">PRICE</span>
              <span style={{ font: '400 28px var(--serif)', color: 'var(--ink)' }}>
                Price on request
              </span>
            </div>
          )}
          <span className="field-label">
            COLOUR — {firstColor?.name ?? 'N/A'}
          </span>
          <div className="swatches">
            {firstColor && (
              <button
                aria-label={firstColor.name}
                className="swatch selected"
                style={{ background: firstColor.hex }}
              />
            )}
          </div>
          <div className="size-label">
            <span className="field-label">SELECT SIZE</span>
            <button className="text-link" onClick={() => setSizeOpen(true)}>
              Size guide ↗
            </button>
          </div>
          <div className="size-options">
            {(product.sizes ?? []).map((s) => (
              <button
                className={size === s ? "chosen" : ""}
                onClick={() => setSize(s)}
                key={s}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="quantity-label field-label">QUANTITY</div>
          <div className="purchase-row">
            <div className="quantity-control">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span>{qty}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQty(Math.min(10, qty + 1))}
              >
                +
              </button>
            </div>
            <button
              className="button button-dark add-button"
              onClick={() =>
                add({
                  slug: product.slug,
                  quantity: qty,
                  size,
                  color: firstColor?.name || "",
                })
              }
            >
              Add to bag
            </button>
            <button
              className="detail-wish"
              onClick={() => toggleWish(slug)}
              aria-label="Toggle wishlist"
            >
              {wishlist.includes(slug) ? "♥" : "♡"}
            </button>
          </div>
          <a
            className="whatsapp-link"
            target="_blank"
            rel="noreferrer"
            href={productEnquiry.url}
            aria-label={productEnquiry.isPlaceholder ? 'WhatsApp number not configured' : `Enquire about ${product.name} on WhatsApp`}
          >
            {productEnquiry.isPlaceholder ? 'Enquire on WhatsApp (number not configured)' : 'Enquire about this outfit on WhatsApp ↗'}
          </a>
          <div className="detail-rule" />
          {[
            ["The cloth", `${product.fabric}. ${product.fit}.`],
            ["Care & keeping", product.careInstructions],
            ["Delivery", product.deliveryNote],
          ].map(([title, body]) => (
            <div className="accordion" key={title}>
              <button
                aria-expanded={open === title}
                onClick={() => setOpen(open === title ? "" : title)}
              >
                {title}
                <span>{open === title ? "−" : "+"}</span>
              </button>
              {open === title && <p>{body}</p>}
            </div>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images,
            sku: product.id,
            offers: hasPrice
              ? {
                  "@type": "Offer",
                  priceCurrency: "INR",
                  price: product.price,
                  availability: product.inStock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                }
              : {
                  "@type": "Offer",
                  priceCurrency: "INR",
                  availability: product.inStock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                },
          }),
        }}
      />
      <section className="section related">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOU MAY ALSO LIKE</span>
            <h2>In the same spirit.</h2>
          </div>
        </div>
        <ProductGrid
          items={items
            .filter((p) => p.slug !== slug && p.category === product.category)
            .slice(0, 4)}
          loading={false}
        />
      </section>
      {sizeOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSizeOpen(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSizeOpen(false)}
              aria-label="Close size guide"
            >
              ×
            </button>
            <span className="eyebrow">FIND YOUR FIT</span>
            <h2 id="size-title">Size guide</h2>
            <p>
              Measurements are body measurements in inches. If between sizes,
              speak with our atelier about made-to-measure.
            </p>
            <table>
              <tbody>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Waist</th>
                </tr>
                {[
                  ["S", "36–38", "30–32"],
                  ["M", "38–40", "32–34"],
                  ["L", "40–42", "34–36"],
                  ["XL", "42–44", "36–38"],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => (
                      <td key={cell}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
function Cart() {
  const {
    cart,
    setQty,
    remove,
    notify,
    couponCode,
    discountPercent,
    applyCoupon,
    clearCoupon,
  } = useStore();
  const { items } = useCatalog();
  const subtotal = cart.reduce(
    (sum, l) =>
      sum + (items.find((p) => p.slug === l.slug)?.price || 0) * l.quantity,
    0,
  );
  const hasPriceUnknown = cart.some(
    (l) => (items.find((p) => p.slug === l.slug)?.price || 0) === 0
  );
  const discount = Math.round((subtotal * discountPercent) / 100);
  const [coupon, setCoupon] = useState(couponCode);
  const [checking, setChecking] = useState(false);
  async function apply() {
    if (!coupon.trim()) return;
    setChecking(true);
    try {
      const result = await validateCoupon(coupon, subtotal);
      if (result.valid) applyCoupon(coupon.trim().toUpperCase(), result.discountPercent);
      else {
        clearCoupon();
        notify(result.message);
      }
    } catch (err) {
      notify(errorMessage(err, "We could not check that offer code."));
    } finally {
      setChecking(false);
    }
  }
  return (
    <main className="page-shell">
      <span className="eyebrow">YOUR SELECTION</span>
      <h1 className="page-heading">The bag.</h1>
      {cart.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing in your bag yet.</h2>
          <Link className="button button-dark" to="/shop">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {cart.map((line) => {
              const p = items.find((x) => x.slug === line.slug);
              if (!p) return null;
              const linePrice = p.price || 0;
              return (
                <div className="cart-line" key={`${line.slug}-${line.size}`}>
                  <div
                    className="cart-art"
                    style={
                      { "--garment": p.colors[0]?.hex } as React.CSSProperties
                    }
                  />
                  <div className="cart-description">
                    <Link to={productPath(p.slug)}>
                      <strong>{p.name}</strong>
                    </Link>
                    <span>
                      {line.size} · {line.color}
                    </span>
                    <span>
                      {linePrice > 0 ? `₹${linePrice.toLocaleString("en-IN")}` : 'Price on request'}
                    </span>
                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          setQty(line.slug, line.quantity - 1, line.size)
                        }
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        onClick={() =>
                          setQty(line.slug, line.quantity + 1, line.size)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-link"
                    onClick={() => remove(line.slug, line.size)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <aside className="summary">
            <h2>Order summary</h2>
            <div>
              <span>Subtotal</span>
              <span>{subtotal > 0 ? `₹${subtotal.toLocaleString("en-IN")}` : 'To be confirmed'}</span>
            </div>
            <div>
              <span>Delivery</span>
              <span>
                {subtotal >= 20000 ? "Complimentary" : "Calculated at checkout"}
              </span>
            </div>
            {discount > 0 && (
              <div>
                <span>Code applied</span>
                <span>−₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {hasPriceUnknown && (
              <div className="price-notice">
                <span>Note: Some items have no price set. Final total will be confirmed by the atelier.</span>
              </div>
            )}
            <div className="coupon">
              <input
                placeholder="Offer code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <button onClick={apply} disabled={checking}>
                {checking ? "Checking…" : "Apply"}
              </button>
            </div>
            <div className="summary-total">
              <b>Total</b>
              <b>{subtotal > 0 && !hasPriceUnknown ? `₹${Math.max(0, subtotal - discount).toLocaleString("en-IN")}` : 'To be confirmed'}</b>
            </div>
            <Link className="button button-dark checkout-button" to="/checkout">
              Continue to checkout
            </Link>
            <p>Complimentary delivery on orders over ₹20,000.</p>
          </aside>
        </div>
      )}
    </main>
  );
}
function Checkout() {
  const { cart, remove, couponCode, discountPercent, clearCoupon } = useStore();
  const { items } = useCatalog();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Gujarat",
    pin: "",
    notes: "",
  });
  const [whatsappSent, setWhatsAppSent] = useState(false);
  const subtotal = cart.reduce(
    (sum, l) =>
      sum + (items.find((p) => p.slug === l.slug)?.price || 0) * l.quantity,
    0,
  );
  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discount);
  const hasPriceUnknown = cart.some(
    (l) => (items.find((p) => p.slug === l.slug)?.price || 0) === 0
  );

  function validateForm(): boolean {
    if (!cart.length) {
      setError("Your bag is empty.");
      return false;
    }
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.pin.trim() ||
      !/^[0-9]{6}$/.test(form.pin)
    ) {
      setError("Please check your details. All fields are required. Enter a valid six-digit PIN code.");
      return false;
    }
    return true;
  }

  function buildOrderItemsForWhatsApp() {
    return cart.map((line) => {
      const p = items.find((x) => x.slug === line.slug);
      return {
        name: p?.name ?? line.slug,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
        price: p?.price ?? 0,
      };
    });
  }

  function handleSendWhatsApp() {
    if (!validateForm()) return;

    const whatsappItems = buildOrderItemsForWhatsApp();
    const message = buildOrderWhatsAppMessage({
      name: form.name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pin,
      notes: form.notes,
      items: whatsappItems,
      subtotal,
      discount: discount > 0 ? discount : undefined,
      couponCode: couponCode || undefined,
    });

    const { url, isPlaceholder } = buildWhatsAppUrl(message);
    if (isPlaceholder) {
      setError("WhatsApp number not configured. Please contact the atelier directly.");
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    setWhatsAppSent(true);
  }

  function handleConfirmSent() {
    // Clear cart and coupon only after user confirms they sent the WhatsApp message
    cart.forEach((line) => remove(line.slug, line.size));
    clearCoupon();
    setWhatsAppSent(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "Gujarat",
      pin: "",
      notes: "",
    });
  }

  return (
    <main className="page-shell">
      <span className="eyebrow">A FEW DETAILS</span>
      <h1 className="page-heading">Delivery & checkout.</h1>
      {whatsappSent ? (
        <div className="confirmation-panel">
          <span className="eyebrow">ORDER REQUEST SENT</span>
          <h2>Your order request has been sent via WhatsApp.</h2>
          <p>Our atelier will review your request and confirm availability, pricing, and delivery timeline on WhatsApp.</p>
          <p className="small-note">No order has been placed yet. The shop will confirm details with you before proceeding.</p>
          <button className="button button-dark" onClick={handleConfirmSent}>
            Yes, I sent it — Clear my bag
          </button>
          <button className="button button-outline" onClick={() => setWhatsAppSent(false)}>
            Not yet — Go back
          </button>
        </div>
      ) : (
        <form className="checkout-layout" onSubmit={(e) => { e.preventDefault(); handleSendWhatsApp(); }}>
          <div className="checkout-form">
            <h2>Where should we send it?</h2>
            <div className="form-grid">
              {[
                ["name", "Full name"],
                ["email", "Email address (optional)"],
                ["phone", "Phone number"],
                ["pin", "PIN code"],
                ["city", "City"],
                ["state", "State"],
                ["address", "Street address"],
                ["notes", "Delivery notes (optional)"],
              ].map(([name, label]) => (
                <label key={name} className={name === "address" || name === "notes" ? "wide" : ""}>
                  {label}
                  {name === "notes" ? (
                    <textarea
                      rows={3}
                      value={form[name as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    />
                  ) : (
                    <input
                      required={name !== "email" && name !== "notes"}
                      value={form[name as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    />
                  )}
                </label>
              ))}
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-dark" type="button" onClick={handleSendWhatsApp}>
              Send order request on WhatsApp
            </button>
            <p className="small-note">
              This sends your order details to our WhatsApp. No payment is collected. The atelier will confirm availability and pricing before any order is placed.
            </p>
          </div>
          <aside className="summary">
            <h2>Your order request</h2>
            {cart.map((line) => {
              const p = items.find((x) => x.slug === line.slug);
              const linePrice = p?.price || 0;
              return (
                <div key={line.slug}>
                  <span>
                    {p?.name} × {line.quantity} ({line.size}, {line.color})
                  </span>
                  <span>
                    {linePrice > 0 ? `₹${(linePrice * line.quantity).toLocaleString("en-IN")}` : 'Price on request'}
                  </span>
                </div>
              );
            })}
            {discount > 0 && (
              <div>
                <span>Offer ({discountPercent}%)</span>
                <span>−₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {hasPriceUnknown && (
              <div className="price-notice">
                Some items have no price set. Final total will be confirmed by the atelier.
              </div>
            )}
            <div className="summary-total">
              <b>Total</b>
              <b>{total > 0 && !hasPriceUnknown ? `₹${total.toLocaleString("en-IN")}` : 'To be confirmed'}</b>
            </div>
          </aside>
        </form>
      )}
    </main>
  );
}
function Confirmation() {
  return (
    <main className="page-shell confirmation">
      <span className="eyebrow">THANK YOU</span>
      <h1>
        Your order request
        <br />
        has been sent.
      </h1>
      <p>
        We have received your order request via WhatsApp. Our atelier will be in touch to confirm
        availability, pricing, and delivery details.
      </p>
      <p className="small-note">No order has been placed yet. The shop will confirm details with you before proceeding.</p>
      <Link className="button button-dark" to="/shop">
        Back to the collection ↗
      </Link>
    </main>
  );
}
function Wishlist() {
  const { wishlist } = useStore();
  const { items, loading } = useCatalog();
  const saved = items.filter((p) => wishlist.includes(p.slug));
  return (
    <main className="page-shell">
      <span className="eyebrow">KEPT CLOSE</span>
      <h1 className="page-heading">Your saved pieces.</h1>
      {saved.length ? (
        <ProductGrid items={saved} loading={loading} />
      ) : (
        <div className="empty-state">
          <h2>No pieces saved yet.</h2>
          <p>Keep the ones you are thinking about close by.</p>
          <Link className="button button-dark" to="/shop">
            Explore the collection
          </Link>
        </div>
      )}
    </main>
  );
}
function Tailoring() {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    garment: "Suit",
    occasion: "Wedding",
    name: "",
    phone: "",
    date: "",
    visit: "in-store",
    notes: "",
  });
  const [error, setError] = useState("");
  const [whatsappSent, setWhatsAppSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!values.name || !values.phone || !values.date) {
      setError("Please add your name, phone number and preferred date.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createAppointment({
        garmentType: values.garment,
        occasion: values.occasion,
        preferredDate: values.date,
        contactMethod: values.visit === "in-store" ? "in-store" : "call",
        name: values.name,
        phone: values.phone,
        ...(values.notes ? { notes: values.notes } : {}),
      });
      
      // Send WhatsApp message with booking details
      const message = buildAppointmentWhatsAppMessage({
        garment: values.garment,
        occasion: values.occasion,
        visit: values.visit,
        date: values.date,
        name: values.name,
        phone: values.phone,
        notes: values.notes,
      });
      
      const { url, isPlaceholder } = buildWhatsAppUrl(message);
      if (isPlaceholder) {
        setError("WhatsApp number not configured. Please contact the atelier directly.");
        setSubmitting(false);
        return;
      }
      
      window.open(url, '_blank', 'noopener,noreferrer');
      setWhatsAppSent(true);
    } catch (err) {
      setError(
        errorMessage(err, "We could not save your request. Please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  }
  
  function handleConfirmSent() {
    setSuccess(true);
    setWhatsAppSent(false);
    setValues({
      garment: "Suit",
      occasion: "Wedding",
      name: "",
      phone: "",
      date: "",
      visit: "in-store",
      notes: "",
    });
    setStep(1);
  }

  return (
    <main className="page-shell tailoring-page">
      <div className="tailoring-copy">
        <span className="eyebrow">THE NOOR ATELIER</span>
        <h1>
          Good fit is
          <br />a feeling.
        </h1>
        <p>
          Tell us what you have in mind. We will take it from there, one careful
          fitting at a time.
        </p>
        <div className="tailoring-meta">
          {shopConfig.city.toUpperCase()} · BY APPOINTMENT
          <br />
          TUESDAY—SATURDAY
        </div>
      </div>
      <form className="tailoring-form" onSubmit={submit}>
        {whatsappSent ? (
          <div className="success-panel">
            <span className="eyebrow">APPOINTMENT REQUEST SENT</span>
            <h2>Your appointment request has been sent via WhatsApp.</h2>
            <p>Our team will be in touch to confirm your visit.</p>
            <button className="button button-dark" onClick={handleConfirmSent}>
              Yes, I sent it
            </button>
            <button className="button button-outline" onClick={() => setWhatsAppSent(false)}>
              Not yet — Go back
            </button>
          </div>
        ) : success ? (
          <div className="success-panel">
            <span className="eyebrow">REQUEST RECEIVED</span>
            <h2>We will call you shortly.</h2>
            <p>Our team will be in touch to confirm your visit.</p>
          </div>
        ) : (
          <>
            <div className="step-count">
              APPOINTMENT REQUEST <span>0{step} / 03</span>
            </div>
            {step === 1 && (
              <>
                <h2>What are we making?</h2>
                <label>
                  Garment
                  <select
                    value={values.garment}
                    onChange={(e) =>
                      setValues({ ...values, garment: e.target.value })
                    }
                  >
                    {[
                      "Suit",
                      "Sherwani",
                      "Kurta set",
                      "Indo-Western",
                      "Something else",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Occasion
                  <select
                    value={values.occasion}
                    onChange={(e) =>
                      setValues({ ...values, occasion: e.target.value })
                    }
                  >
                    {[
                      "Wedding",
                      "Festive celebration",
                      "Work",
                      "A special day",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {step === 2 && (
              <>
                <h2>How should we begin?</h2>
                <label>
                  Would you like to visit the store?
                  <select
                    value={values.visit}
                    onChange={(e) =>
                      setValues({ ...values, visit: e.target.value })
                    }
                  >
                    <option value="in-store">Yes, visit the atelier</option>
                    <option value="call">Not yet, call me first</option>
                  </select>
                </label>
                <label>
                  Preferred date
                  <input
                    type="date"
                    value={values.date}
                    onChange={(e) =>
                      setValues({ ...values, date: e.target.value })
                    }
                  />
                </label>
                <label>
                  Fabric preference (optional)
                  <input
                    placeholder="For example, lightweight wool"
                    value={values.notes}
                    onChange={(e) =>
                      setValues({ ...values, notes: e.target.value })
                    }
                  />
                </label>
              </>
            )}
            {step === 3 && (
              <>
                <h2>How can we reach you?</h2>
                <label>
                  Your name
                  <input
                    value={values.name}
                    onChange={(e) =>
                      setValues({ ...values, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  Phone number
                  <input
                    value={values.phone}
                    onChange={(e) =>
                      setValues({ ...values, phone: e.target.value })
                    }
                  />
                </label>
              </>
            )}
            {error && <p className="form-error">{error}</p>}
            <button className="button button-dark" type="submit" disabled={submitting}>
              {submitting
                ? "Sending…"
                : step === 3
                  ? "Request appointment"
                  : "Continue"}{" "}
              ↗
            </button>
            {step > 1 && (
              <button
                type="button"
                className="back-step"
                onClick={() => setStep(step - 1)}
              >
                ← Back
              </button>
            )}
          </>
        )}
      </form>
    </main>
  );
}
function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "whatsapp">("idle");
  const [error, setError] = useState("");
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim() || !values.message.trim()) {
      setError("Please add your name and a short message.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await sendContactMessage(values);
      
      // Also open WhatsApp
      const message = buildContactWhatsAppMessage({
        name: values.name,
        message: values.message,
      });
      
      const { url, isPlaceholder } = buildWhatsAppUrl(message);
      if (isPlaceholder) {
        setStatus("sent");
        setValues({ name: "", email: "", message: "" });
        return;
      }
      
      setStatus("whatsapp");
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(errorMessage(err, "We could not send your message. Please try again."));
      setStatus("idle");
    }
  }
  
  function handleConfirmSent() {
    setStatus("sent");
    setValues({ name: "", email: "", message: "" });
  }

  if (status === "sent") {
    return (
      <div className="success-panel">
        <span className="eyebrow">MESSAGE RECEIVED</span>
        <h2>Thank you. We will reply shortly.</h2>
      </div>
    );
  }
  
  if (status === "whatsapp") {
    return (
      <div className="success-panel">
        <span className="eyebrow">MESSAGE SENT VIA WHATSAPP</span>
        <h2>Your message has been sent via WhatsApp.</h2>
        <p>Our team will reply to you there.</p>
        <button className="button button-dark" onClick={handleConfirmSent}>
          Yes, I sent it
        </button>
        <button className="button button-outline" onClick={() => setStatus("idle")}>
          Not yet — Go back
        </button>
      </div>
    );
  }
  
  return (
    <form className="checkout-form" onSubmit={submit}>
      <h2>Send us a note</h2>
      {(["name", "email", "message"] as const).map((field) => (
        <label key={field}>
          {field === "name"
            ? "Full name"
            : field === "email"
            ? "Email address"
            : "How can we help?"}
          {field === "message" ? (
            <textarea
              required
              rows={4}
              value={values[field]}
              onChange={(e) => setValues({ ...values, [field]: e.target.value })}
            />
          ) : (
            <input
              required
              value={values[field]}
              onChange={(e) => setValues({ ...values, [field]: e.target.value })}
            />
          )}
        </label>
      ))}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-dark" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message ↗"}
      </button>
    </form>
  );
}
function ContentPage({ type }: { type: string }) {
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([]);
  useEffect(() => {
    if (type === "faq") getFaqs().then(setFaqs);
  }, [type]);
  const details: Record<
    string,
    { label: string; title: string; copy: string }
  > = {
    about: {
      label: "OUR HOUSE",
      title: "A tailoring house.",
      copy: "Noor began with a simple belief: a well-made garment should feel like it belongs to you. From our New Delhi atelier, we bring considered cloth, patient craft and a modern understanding of fit to the clothes men wear for their most meaningful days.",
    },
    contact: {
      label: "COME BY",
      title: "A conversation is a good place to start.",
      copy: `${shopConfig.addressLines.join('\n')}\n${shopConfig.openingHours}\n${shopConfig.phone}`,
    },
    faq: {
      label: "GOOD TO KNOW",
      title: "A few things you may be wondering.",
      copy: "",
    },
    shipping: {
      label: "DELIVERY & RETURNS",
      title: "The practical details.",
      copy: "Ready-to-wear pieces dispatch in 2–4 working days. Delivery is complimentary on orders over ₹20,000. Unworn pieces with tags can be returned within 7 days. Custom-tailored pieces are final sale.",
    },
    privacy: {
      label: "YOUR PRIVACY",
      title: "Your details stay yours.",
      copy: "We use the information you share only to fulfil your order, respond to your enquiry and improve your experience with Noor Tailor. We do not sell your personal information.",
    },
    terms: {
      label: "THE TERMS",
      title: "A few clear terms.",
      copy: "Prices are listed in Indian Rupees. Product colours may vary slightly by screen. Custom tailoring is confirmed during a fitting and requires a separate timeline. All orders are subject to availability.",
    },
  };
  const data = details[type] || details.about;
  return (
    <main className="page-shell content-page">
      <span className="eyebrow">{data.label}</span>
      <h1>{data.title}</h1>
      <p className="content-copy">{data.copy}</p>
      {type === "faq" && (
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      )}
      {type === "about" && (
        <div className="about-values">
          <div>
            <span>01</span>
            <h2>Made with patience.</h2>
            <p>
              Good work takes the time it takes. Every piece is cut and finished
              with care.
            </p>
          </div>
          <div>
            <span>02</span>
            <h2>Fit for real life.</h2>
            <p>
              We believe elegance should still let you sit, move, dance and
              celebrate.
            </p>
          </div>
          <div>
            <span>03</span>
            <h2>Always personal.</h2>
            <p>
              Come as you are. We will help you find the version that feels like
              you.
            </p>
          </div>
        </div>
      )}
      {type === "contact" && (
        <div className="contact-actions">
          <a
            href={`tel:${shopConfig.phone.replaceAll(" ", "")}`}
            className="button button-dark"
          >
            Call the atelier ↗
          </a>
          <a
            href={buildWhatsAppUrl(`Hello ${shopConfig.name}, I would like to get in touch.`).url}
            className="button button-outline"
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp ↗
          </a>
          <div className="map-placeholder">
            {shopConfig.city.toUpperCase()} · {shopConfig.addressLines[0].toUpperCase()}
          </div>
          <ContactForm />
        </div>
      )}
      {type === "shipping" && (
        <Link to="/shop" className="text-link">
          Explore the collection ↗
        </Link>
      )}
    </main>
  );
}
function SizeGuide() {
  return (
    <main className="page-shell content-page">
      <span className="eyebrow">FIND YOUR FIT</span>
      <h1>
        A good fit begins
        <br />
        with good measurements.
      </h1>
      <p className="content-copy">
        Measure over light clothing. Keep the tape level and comfortably loose.
        If you sit between sizes, our atelier can guide you.
      </p>
      <div className="size-guide-table">
        <table>
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest</th>
              <th>Waist</th>
              <th>Shoulder</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["S", "36–38", "30–32", "16.5"],
              ["M", "38–40", "32–34", "17"],
              ["L", "40–42", "34–36", "17.5"],
              ["XL", "42–44", "36–38", "18"],
              ["XXL", "44–46", "38–40", "18.5"],
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((x) => (
                  <td key={x}>{x}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link className="text-link" to="/tailoring">
        Book a fitting ↗
      </Link>
    </main>
  );
}
function NotFound() {
  return (
    <main className="page-shell confirmation">
      <span className="eyebrow">404 / PAGE NOT FOUND</span>
      <h1>
        We took a<br />
        wrong turn.
      </h1>
      <Link className="button button-dark" to="/">
        Return home ↗
      </Link>
    </main>
  );
}
function VisitBanner() {
  return (
    <section className="visit-banner">
      <div>
        <span className="eyebrow light">A GOOD PLACE TO BEGIN</span>
        <h2>
          Come in for a<br />
          conversation.
        </h2>
        <p>{shopConfig.addressLines.join(', ')}</p>
      </div>
      <Link className="button button-light" to="/contact">
        Find the atelier ↗
      </Link>
    </section>
  );
}
function Shell() {
  const { toast, cart } = useStore();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const section =
      location.pathname.split("/").filter(Boolean).at(-1) || "home";
    const title =
      section === "home"
        ? `${shopConfig.name} — ${shopConfig.tagline}`
        : `${section.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())} | ${shopConfig.name}`;
    document.title = title;
    const description = document.querySelector("meta[name=description]");
    description?.setAttribute(
      "content",
      `Explore ${section.replaceAll("-", " ")} at ${shopConfig.name}, ${shopConfig.city}. Considered menswear and made-to-measure tailoring.`,
    );
  }, [location.pathname]);
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<Confirmation />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/tailoring" element={<Tailoring />} />
        <Route path="/size-guide" element={<SizeGuide />} />
        {["about", "contact", "faq", "shipping", "privacy", "terms"].map(
          (type) => (
            <Route
              key={type}
              path={`/${type}`}
              element={<ContentPage type={type} />}
            />
          ),
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      {toast && (
        <div className="toast" role="status">
          {toast} <Link to="/cart">View bag ↗</Link>
        </div>
      )}
      {cart.length > 0 && (
        <Link className="mobile-bag" to="/cart">
          Bag · {cart.reduce((s, x) => s + x.quantity, 0)}
        </Link>
      )}
      {/* Floating WhatsApp button */}
      <a
        className="floating-whatsapp"
        href={buildWhatsAppUrl(`Hello ${shopConfig.name}, I would like to get in touch.`).url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.466-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.454.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 9.86 9.86 0 01-.147-.3c-.245.14-.347.298-.57.447-.199.149-.549.224-1.147.074-.72-.173-1.291-.694-1.612-1.291-.215-.417-.134-1.114.174-1.641.45-.767 2.266-2.977 3.646-4.544.372-.42.743-.71 1.114-.916 1.275-.671 1.568-.79 3.074-.79 1.52 0 2.833.15 3.95.597 1.097.436 1.977 1.33 2.291 2.18.33.887.3 1.79.086 2.492-.2.68-.722.85-1.47.85H3.857v1.08c0 .57.008 1.164.086 1.52.148.67.618 1.09 1.195 1.174.916.134 2.813.118 3.978-.16 1.408-.337 2.08-.967 2.352-1.58.272-.624.272-1.213.215-1.39-.149-.45-.549-.435-.887-.373-.42.042-.946.404-1.194.758-.273.368-.71.52-1.425.749-.526.174-2.22.57-3.308.916-.94.287-1.73.326-2.32.173-.995-.259-1.853-1.036-2.378-1.885-.267-.427-.273-.799-.273-1.164 0-.365.018-.694.19-.916.346-.447 1.675-1.54 2.977-2.823 1.288-1.267 2.589-2.454 3.405-3.367.54-.605.67-.67.967-.67.33 0 .513.07.767.124.254.05.597.215 1.016.347.788.25 1.956.97 2.842 2.107.916 1.195 1.29 2.107 1.36 2.378.019.056.075.085.134.085.04 0 .057-.01.117-.056.42-.334.85-.79 1.073-1.267.224-.474.238-1.12.104-1.573-.06-.214-.148-.347-.42-.434-.316-.104-.61-.124-.782-.124-.364 0-.555.085-.767.198-.212.114-.42.316-.42.543 0 .042 0 .085.01.127.074.297.41.57.556.94.372.372.513.52.995.645.482.124.915.25 1.228.347 2.395.735 4.057 2.843 4.057 4.786 0 .787-.198 1.573-.57 2.32-.358.734-1.413 1.37-2.722 1.612-.45.099-.845.19-.995.19h-.004a10.01 10.01 0 01-3.676-.105 10.17 10.17 0 01-2.266-.57 10.47 10.47 0 01-2.117-1.355"/></svg>
      </a>
    </>
  );
}
export default function App() {
  return <Shell />;
}
