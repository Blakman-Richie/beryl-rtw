import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Boxes,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  Eye,
  GripVertical,
  Heart,
  ImagePlus,
  LayoutDashboard,
  Layers3,
  Menu,
  Megaphone,
  Package,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { supabase } from "./supabase";

const AnalyticsCharts = lazy(() => import("./AnalyticsCharts"));

type Product = {
  id: number;
  name: string;
  type: string;
  price: string;
  usd: string;
  tag: string;
  image: string;
  color: string;
  stock?: number;
  status?: string;
  description?: string;
};
type OrderStatus =
  "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
type Order = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: string;
  total: number;
  status: OrderStatus;
  created_at: string;
};
type Discount = {
  id: number;
  code: string;
  kind: "percent" | "fixed";
  amount: number;
  expires_at?: string;
  usage_limit?: number;
  uses?: number;
  active: boolean;
};
type SectionKind =
  | "hero"
  | "categories"
  | "products"
  | "promo"
  | "story"
  | "newsletter"
  | "content"
  | "discover"
  | "testimonials"
  | "video"
  | "gallery"
  | "faq"
  | "countdown"
  | "size-guide"
  | "journal";
type StoreSection = {
  id: string;
  type: SectionKind;
  title: string;
  eyebrow: string;
  description: string;
  cta: string;
  visible: boolean;
  theme?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
  columns?: number;
  layout?: "split" | "stacked" | "image-left" | "image-right" | "full-bleed";
  buttonLink?: string;
  videoUrl?: string;
  images?: string[];
  contentItems?: Array<{ heading: string; text: string; image?: string }>;
  mobileImage?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  scheduledAt?: string;
  countdownTo?: string;
  columnItems?: Array<{
    heading: string;
    text: string;
    button: string;
    link: string;
  }>;
};

const makeColumnItems = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    heading: `Column ${index + 1}`,
    text: "Add your own content here.",
    button: index === 0 ? "Explore" : "",
    link: "#shop",
  }));

const defaultHeroImage =
  "https://i.pinimg.com/originals/ae/31/d3/ae31d32476ad40160b2961bc0bd85b48.jpg";

const starterProducts: Product[] = [
  {
    id: 1,
    name: "Abeni Midi Dress",
    type: "Dresses",
    price: "₦68,000",
    usd: "$46",
    tag: "New arrival",
    image:
      "https://i.pinimg.com/originals/5e/a1/a3/5ea1a3f9b546b64268c019420b9dec4e.png",
    color: "Cobalt · coral Ankara",
    stock: 8,
    status: "active",
    description: "A fitted midi dress made for easy, confident days.",
  },
  {
    id: 2,
    name: "The Naya Set",
    type: "Sets",
    price: "₦82,000",
    usd: "$56",
    tag: "Best seller",
    image:
      "https://i.pinimg.com/736x/c9/18/01/c91801c158eac12765057920e58a5f34.jpg",
    color: "Indigo · red geometric",
    stock: 5,
    status: "active",
    description: "A polished two-piece set with room to move.",
  },
  {
    id: 3,
    name: "Mira Wrap Skirt",
    type: "Skirts",
    price: "₦43,000",
    usd: "$30",
    tag: "Limited",
    image:
      "https://mistasilver.wordpress.com/wp-content/uploads/2015/10/wpid-ezinne-chinkata-on-what-to-wear-for-heineken-lagos-fashion-week-bellanaija-october2015006.jpg",
    color: "Turquoise · plum wax print",
    stock: 3,
    status: "active",
    description: "A sculptural wrap skirt in a vivid wax print.",
  },
  {
    id: 4,
    name: "Zuri Statement Top",
    type: "Tops",
    price: "₦39,000",
    usd: "$27",
    tag: "New arrival",
    image:
      "https://www.maeotti.com/cdn/shop/files/3W1A1099-Edit__2_1080x.jpg?v=1776802139",
    color: "Scarlet · saffron Ankara",
    stock: 10,
    status: "active",
    description: "An expressive top that turns a simple look into a moment.",
  },
  {
    id: 5,
    name: "Ife Wide-Leg Set",
    type: "Sets",
    price: "₦88,000",
    usd: "$60",
    tag: "Limited",
    image:
      "https://i.pinimg.com/originals/ae/31/d3/ae31d32476ad40160b2961bc0bd85b48.jpg",
    color: "Orange · navy print",
    stock: 2,
    status: "active",
    description: "Wide-leg tailoring balanced with a bright, joyful print.",
  },
  {
    id: 6,
    name: "Sade Day Dress",
    type: "Dresses",
    price: "₦61,000",
    usd: "$42",
    tag: "Bestseller",
    image:
      "https://images.ctfassets.net/7bobsix9kke6/1D4OA5xtYKxbHYJYfMNkau/7a9b9d04b2495bb296a8776605bd1d5e/stylegoestochurch_91806993_151752566367367_4535886086198977974_n.jpg",
    color: "Emerald · gold Ankara",
    stock: 7,
    status: "active",
    description: "A day-to-evening dress for the woman who does both.",
  },
];

const defaultSections: StoreSection[] = [
  {
    id: "hero",
    type: "hero",
    title: "Ankara, reimagined.",
    eyebrow: "The first edit · 2026",
    description:
      "Premium ready-to-wear pieces for work, weekends and everywhere in between.",
    cta: "Shop new arrivals",
    visible: true,
    theme: "cobalt",
    image: defaultHeroImage,
    buttonLink: "/shop",
  },
  {
    id: "categories",
    type: "categories",
    title: "Shop by category",
    eyebrow: "Find your favourite",
    description: "Dresses, sets, tops and skirts chosen for a modern wardrobe.",
    cta: "Explore all",
    visible: true,
    theme: "cream",
  },
  {
    id: "products",
    type: "products",
    title: "Trending now",
    eyebrow: "The Beryl edit",
    description: "Small-batch pieces, ready to wear and ready to be noticed.",
    cta: "View the collection",
    visible: true,
    theme: "cream",
  },
  {
    id: "promo",
    type: "promo",
    title: "Colour belongs in your everyday.",
    eyebrow: "Made in Lagos · worn worldwide",
    description:
      "Fresh prints, thoughtful silhouettes and a little more joy in the getting dressed.",
    cta: "Discover the story",
    visible: true,
    theme: "lime",
    buttonLink: "/about",
  },
  {
    id: "story",
    type: "story",
    title: "More than a print. A point of view.",
    eyebrow: "The Beryl woman",
    description:
      "Elevated Ankara ready-to-wear for women who want their wardrobe to say something beautiful.",
    cta: "Meet Beryl RTW",
    visible: true,
    theme: "paper",
  },
  {
    id: "newsletter",
    type: "newsletter",
    title: "New drops. No noise.",
    eyebrow: "Stay close",
    description: "Get the collection first, plus styling notes from Beryl.",
    cta: "Join the list",
    visible: true,
    theme: "ink",
  },
];

const defaultAboutSections: StoreSection[] = [
  {
    id: "about-hero",
    type: "hero",
    title: "More than a print. A point of view.",
    eyebrow: "Meet Beryl RTW",
    description:
      "Beryl RTW creates elevated Ankara ready-to-wear for women who want colour, confidence and effortless polish in every room.",
    cta: "Shop the collection",
    visible: true,
    theme: "cobalt",
    image: defaultHeroImage,
    buttonLink: "/",
    layout: "image-right",
  },
  {
    id: "about-belief",
    type: "content",
    title: "Colour, cut, confidence.",
    eyebrow: "What we believe",
    description:
      "Ankara is a language of joy. We translate its boldest rhythms into thoughtful silhouettes that move with real life.",
    cta: "Shop new arrivals",
    buttonLink: "/",
    visible: true,
    theme: "lime",
    image:
      "https://images.ctfassets.net/7bobsix9kke6/1D4OA5xtYKxbHYJYfMNkau/7a9b9d04b2495bb296a8776605bd1d5e/stylegoestochurch_91806993_151752566367367_4535886086198977974_n.jpg",
    columns: 3,
    layout: "split",
    columnItems: [
      {
        heading: "Made in Lagos",
        text: "Designed with a distinctly Nigerian eye for colour, detail and occasion.",
        button: "",
        link: "#",
      },
      {
        heading: "Ready to live in",
        text: "Pieces that work for the office, Sunday plans, dinner and the days between.",
        button: "",
        link: "#",
      },
      {
        heading: "Small-batch by design",
        text: "Limited runs keep every print considered and every wardrobe personal.",
        button: "",
        link: "#",
      },
    ],
  },
  {
    id: "about-story",
    type: "story",
    title: "Designed for the many places you go.",
    eyebrow: "The Beryl woman",
    description:
      "From Lagos to London and everywhere in between, Beryl RTW is a wardrobe of expressive pieces made to meet your life beautifully.",
    cta: "Explore the edit",
    buttonLink: "/",
    visible: true,
    theme: "paper",
  },
  {
    id: "about-testimonials",
    type: "testimonials",
    title: "Worn, loved, lived in.",
    eyebrow: "Notes from our community",
    description: "The best part of Beryl is seeing each piece become her own.",
    cta: "Find your piece",
    buttonLink: "/",
    visible: true,
    theme: "cream",
    contentItems: [
      {
        heading: "Amara, Lagos",
        text: "The fit was beautiful and the fabric looked even better in person.",
      },
      {
        heading: "Kemi, London",
        text: "A real statement piece that still felt easy enough for every day.",
      },
      {
        heading: "Dami, Abuja",
        text: "My order arrived neatly packed and exactly as pictured.",
      },
    ],
  },
  {
    id: "about-newsletter",
    type: "newsletter",
    title: "Stay close to the studio.",
    eyebrow: "New drops · styling notes",
    description: "Get first access to new Ankara edits and stories from Beryl.",
    cta: "Join the list",
    visible: true,
    theme: "ink",
  },
];

const sectionMeta: Record<
  SectionKind,
  { label: string; icon: typeof Sparkles; help: string }
> = {
  hero: {
    label: "Hero banner",
    icon: Sparkles,
    help: "The first large message customers see.",
  },
  categories: {
    label: "Category shortcuts",
    icon: Boxes,
    help: "Quick routes to shop by product type.",
  },
  products: {
    label: "Product collection",
    icon: Package,
    help: "A grid of live products from your catalogue.",
  },
  promo: {
    label: "Promotion banner",
    icon: Megaphone,
    help: "A visual campaign or seasonal message.",
  },
  story: {
    label: "Brand story",
    icon: Store,
    help: "Your mission and point of view.",
  },
  newsletter: {
    label: "Email signup",
    icon: Users,
    help: "A simple way to build your customer list.",
  },
  content: {
    label: "Custom row",
    icon: Layers3,
    help: "A flexible row with your own words, image, colour and button.",
  },
  discover: {
    label: "Discover swipe deck",
    icon: Heart,
    help: "A swipeable way for customers to find their next favourite.",
  },
  testimonials: {
    label: "Testimonials",
    icon: Heart,
    help: "Customer reviews that build confidence.",
  },
  video: {
    label: "Video hero",
    icon: ImagePlus,
    help: "A campaign film or styling video.",
  },
  gallery: {
    label: "Lookbook gallery",
    icon: Boxes,
    help: "A multi-image Instagram or lookbook grid.",
  },
  faq: {
    label: "FAQ",
    icon: CircleHelp,
    help: "Answers about fit, delivery and care.",
  },
  countdown: {
    label: "Countdown banner",
    icon: Sparkles,
    help: "A timed launch, sale or limited drop.",
  },
  "size-guide": {
    label: "Size guide",
    icon: ClipboardList,
    help: "Fit notes customers can check before buying.",
  },
  journal: {
    label: "Journal teaser",
    icon: Layers3,
    help: "Stories, styling notes and search-friendly editorial links.",
  },
};
const sectionIsLive = (item: StoreSection) =>
  item.visible &&
  (!item.scheduledAt || new Date(item.scheduledAt).getTime() <= Date.now());
const getSection = (items: StoreSection[], type: SectionKind) =>
  items.find((item) => item.type === type && sectionIsLive(item));
const aboutCarrierId = "__about_page__";
const stripAboutCarrier = (items: StoreSection[]) =>
  items.filter((item) => item.id !== aboutCarrierId);
const decodeAboutCarrier = (items: StoreSection[]) => {
  const carrier = items.find((item) => item.id === aboutCarrierId);
  if (!carrier?.images?.[0]) return null;
  try {
    const parsed = JSON.parse(carrier.images[0]);
    return Array.isArray(parsed) ? (parsed as StoreSection[]) : null;
  } catch {
    return null;
  }
};
const makeAboutCarrier = (items: StoreSection[]): StoreSection => ({
  id: aboutCarrierId,
  type: "content",
  title: "About page data",
  eyebrow: "System data",
  description:
    "Stores the About page layout when the optional page column is unavailable.",
  cta: "",
  visible: false,
  images: [JSON.stringify(items)],
});
const priceNumber = (value: string) =>
  Number(value.replace(/[^0-9]/g, "")) || 0;
function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="market-icon-button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function ProductCard({
  product,
  onAdd,
  onView,
  onDetails,
  onWish,
  wished,
}: {
  product: Product;
  onAdd: (product: Product) => void;
  onView: (product: Product) => void;
  onDetails: (product: Product) => void;
  onWish: (product: Product) => void;
  wished: boolean;
}) {
  return (
    <article
      className="market-product-card"
      role="button"
      tabIndex={0}
      onClick={() => onDetails(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onDetails(product);
      }}
    >
      <div className="market-product-image">
        <img
          src={product.image || defaultHeroImage}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = defaultHeroImage;
          }}
        />
        <span>{product.tag}</span>
        <button
          className={
            wished ? "market-product-wish saved" : "market-product-wish"
          }
          onClick={(event) => {
            event.stopPropagation();
            onWish(product);
          }}
          aria-label={
            wished
              ? `Remove ${product.name} from saved pieces`
              : `Save ${product.name}`
          }
        >
          <Heart size={18} fill={wished ? "currentColor" : "none"} />
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onAdd(product);
          }}
          aria-label={`Add ${product.name} to bag`}
        >
          <Plus size={19} />
        </button>
      </div>
      <div className="market-product-copy">
        <h3>{product.name}</h3>
        <p>{product.color}</p>
        <strong>{product.price}</strong>
        <small>
          {product.usd} · {product.stock || 0} left
        </small>
      </div>
    </article>
  );
}

function ProductQuickView({
  product,
  onClose,
  onAdd,
  onWish,
  wished,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product) => void;
  onWish: (product: Product) => void;
  wished: boolean;
}) {
  return (
    <div
      className="quick-view-wrap"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <button
        className="quick-view-scrim"
        onClick={onClose}
        aria-label="Close product details"
      />
      <section className="quick-view">
        <button
          className="quick-view-close"
          onClick={onClose}
          aria-label="Close product details"
        >
          <X />
        </button>
        <img
          src={product.image || defaultHeroImage}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = defaultHeroImage;
          }}
        />
        <div>
          <p>
            {product.type} · {product.tag}
          </p>
          <h2>{product.name}</h2>
          <strong>{product.price}</strong>
          <small>
            {product.usd} · {product.stock || 0} pieces available
          </small>
          <span>{product.description || product.color}</span>
          <div className="quick-view-actions">
            <button onClick={() => onAdd(product)}>
              Add to bag <ShoppingBag size={17} />
            </button>
            <button
              className={wished ? "saved" : ""}
              onClick={() => onWish(product)}
            >
              <Heart size={17} fill={wished ? "currentColor" : "none"} />{" "}
              {wished ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductDetailPage({
  product,
  related,
  onBack,
  onAdd,
  onWish,
  onDetails,
  wished,
}: {
  product: Product;
  related: Product[];
  onBack: () => void;
  onAdd: (product: Product) => void;
  onWish: (product: Product) => void;
  onDetails: (product: Product) => void;
  wished: boolean;
}) {
  return (
    <>
      <section className="market-product-detail">
        <button className="market-detail-back" onClick={onBack}>
          <ChevronLeft size={16} /> Back to shop
        </button>
        <div className="market-detail-grid">
          <div className="market-detail-image">
            <img
              src={product.image || defaultHeroImage}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.src = defaultHeroImage;
              }}
            />
          </div>
          <div className="market-detail-copy">
            <p>
              {product.type} / {product.tag}
            </p>
            <h1>{product.name}</h1>
            <strong>{product.price}</strong>
            <small>
              {product.usd} / {product.stock || 0} pieces available
            </small>
            <p className="market-detail-description">
              {product.description || product.color}
            </p>
            <div className="market-detail-actions">
              <button onClick={() => onAdd(product)}>Add to bag</button>
              <button onClick={() => onWish(product)}>
                <Heart size={17} fill={wished ? "currentColor" : "none"} />
                {wished ? "Saved" : "Save piece"}
              </button>
            </div>
            <a
              className="market-detail-whatsapp"
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "2349069495391"}?text=${encodeURIComponent(`Hello Beryl RTW, I would like to order the ${product.name}.`)}`}
              target="_blank"
              rel="noreferrer"
            >
              Ask about fit or availability on WhatsApp
            </a>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="market-detail-related">
          <div className="market-section-title">
            <div>
              <p>You may also like</p>
              <h2>More from the edit</h2>
            </div>
          </div>
          <div className="market-product-grid">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAdd={onAdd}
                onView={() => undefined}
                onDetails={onDetails}
                onWish={onWish}
                wished={false}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function CategoryPage({
  type,
  products,
  onBack,
  onAdd,
  onDetails,
  onWish,
  wishlist,
}: {
  type: string;
  products: Product[];
  onBack: () => void;
  onAdd: (product: Product) => void;
  onDetails: (product: Product) => void;
  onWish: (product: Product) => void;
  wishlist: number[];
}) {
  const collection = products.filter(
    (product) =>
      product.type.toLowerCase() === type.toLowerCase() &&
      product.status !== "archived",
  );
  return (
    <section className="market-category-page">
      <button className="market-detail-back" onClick={onBack}>
        <ChevronLeft size={16} /> Back to home
      </button>
      <p className="market-category-page-kicker">The Beryl edit</p>
      <h1>{type}</h1>
      <p className="market-category-page-intro">
        Thoughtful Ankara pieces for work, weekends and everywhere in between.
      </p>
      {collection.length ? (
        <div className="market-product-grid">
          {collection.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
              onView={() => undefined}
              onDetails={onDetails}
              onWish={onWish}
              wished={wishlist.includes(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="market-empty-results">
          <Package size={28} />
          <h3>New {type.toLowerCase()} are coming soon.</h3>
          <button onClick={onBack}>Browse the full collection</button>
        </div>
      )}
    </section>
  );
}

function DiscoverDeck({
  products,
  onLike,
  onSkip,
  onView,
  onAdd,
  onClose,
}: {
  products: Product[];
  onLike: (product: Product) => void;
  onSkip: (product: Product) => void;
  onView: (product: Product) => void;
  onAdd: (product: Product) => void;
  onClose?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<Product[]>([]);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-10, 0, 10]);
  const current = products[index];
  const choose = (direction: "like" | "skip") => {
    if (!current) return;
    if (direction === "like") {
      setLiked((items) => [...items, current]);
      onLike(current);
    } else onSkip(current);
    setIndex((value) => value + 1);
    x.set(0);
  };
  if (!current) {
    return (
      <section className="discover-summary">
        <p>Discover complete</p>
        <h1>Your picks</h1>
        <span>
          {liked.length
            ? "Save them for later or add one to your bag."
            : "No pressure—come back when you feel like exploring."}
        </span>
        <div>
          {liked.map((product) => (
            <article key={product.id}>
              <img src={product.image || defaultHeroImage} alt="" />
              <b>{product.name}</b>
              <button onClick={() => onAdd(product)}>Add to bag</button>
            </article>
          ))}
        </div>
        <button
          onClick={() => {
            setIndex(0);
            setLiked([]);
          }}
        >
          Start again
        </button>
        {onClose && (
          <button className="discover-close" onClick={onClose}>
            Back to shop
          </button>
        )}
      </section>
    );
  }
  return (
    <section className="discover-deck" aria-label="Discover Beryl RTW">
      <header>
        <div>
          <p>Discover</p>
          <h1>Find your next favourite.</h1>
        </div>
        {onClose && (
          <button onClick={onClose}>
            Back to shop <X size={17} />
          </button>
        )}
      </header>
      <div className="discover-stage">
        <div className="discover-card ghost">
          <span>Keep exploring</span>
        </div>
        <motion.article
          className="discover-card"
          style={{ x, rotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.85}
          onDragEnd={(_, info) => {
            if (info.offset.x > 110) choose("like");
            if (info.offset.x < -110) choose("skip");
          }}
          onClick={() => onView(current)}
        >
          <img src={current.image || defaultHeroImage} alt={current.name} />
          <div>
            <p>
              {current.type} · {current.tag}
            </p>
            <h2>{current.name}</h2>
            <span>{current.description || current.color}</span>
            <strong>{current.price}</strong>
          </div>
        </motion.article>
      </div>
      <div className="discover-actions">
        <button onClick={() => choose("skip")} aria-label="Skip this piece">
          <X size={23} />
        </button>
        <button
          className="discover-add"
          onClick={() => onAdd(current)}
          aria-label="Add to bag"
        >
          <ShoppingBag size={20} />
        </button>
        <button
          className="discover-like"
          onClick={() => choose("like")}
          aria-label="Like this piece"
        >
          <Heart size={23} fill="currentColor" />
        </button>
      </div>
      <small>
        {index + 1} of {products.length} · Swipe right to save, left to skip
      </small>
    </section>
  );
}

function ShopPage({
  products,
  onBack,
  onAdd,
  onDetails,
  onWish,
  onLike,
  onSkip,
  wishlist,
}: {
  products: Product[];
  onBack: () => void;
  onAdd: (product: Product) => void;
  onDetails: (product: Product) => void;
  onWish: (product: Product) => void;
  onLike: (product: Product) => void;
  onSkip: (product: Product) => void;
  wishlist: number[];
}) {
  const params = new URLSearchParams(window.location.search);
  const [category, setCategory] = useState(params.get("category") || "All");
  const [swipeOpen, setSwipeOpen] = useState(false);
  const [query, setQuery] = useState(params.get("q") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const types = ["All", "Dresses", "Sets", "Tops", "Skirts", "Jumpsuits"];
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const price = priceNumber(product.price);
      const searchable = [
        product.name,
        product.type,
        product.tag,
        product.color,
      ]
        .join(" ")
        .toLowerCase();
      return (
        product.status !== "archived" &&
        (category === "All" || product.type === category) &&
        (!query || searchable.includes(query.toLowerCase())) &&
        (!minPrice || price >= Number(minPrice)) &&
        (!maxPrice || price <= Number(maxPrice)) &&
        (!inStockOnly || (product.stock || 0) > 0)
      );
    });
    return [...filtered].sort((a, b) => {
      if (sort === "low") return priceNumber(a.price) - priceNumber(b.price);
      if (sort === "high") return priceNumber(b.price) - priceNumber(a.price);
      if (sort === "stock") return (b.stock || 0) - (a.stock || 0);
      return b.id - a.id;
    });
  }, [category, inStockOnly, maxPrice, minPrice, products, query, sort]);
  const reset = () => {
    setCategory("All");
    setQuery("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSort("newest");
  };
  return (
    <section className="market-shop-page">
      <div className="market-shop-page-topline">
        <button onClick={onBack}>
          <ChevronLeft size={16} /> Back to home
        </button>
        <span>Shop Beryl RTW</span>
      </div>
      <header className="market-shop-page-head">
        <div>
          <p>The Beryl edit</p>
          <h1>Shop the collection.</h1>
          <span>
            Swipe through every Ankara piece, or use the filters to find the one
            that feels like you.
          </span>
        </div>
        <div className="market-shop-page-head-actions">
          <strong>{filteredProducts.length} pieces</strong>
          <button onClick={() => setSwipeOpen(true)}>
            <Heart size={16} fill="currentColor" /> Open swipe mode
          </button>
        </div>
      </header>
      <div className="market-shop-filters">
        <label className="market-shop-search">
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Dresses, sets, colour..."
          />
        </label>
        <label>
          Minimum price (₦)
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="0"
          />
        </label>
        <label>
          Maximum price (₦)
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Any"
          />
        </label>
        <label>
          Sort by
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Latest drop</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="stock">Most pieces available</option>
          </select>
        </label>
        <label className="market-shop-check">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
          />
          In stock only
        </label>
        <button className="market-shop-reset" onClick={reset}>
          Clear filters
        </button>
      </div>
      <div className="market-shop-category-pills" aria-label="Shop categories">
        {types.map((type) => (
          <button
            key={type}
            className={category === type ? "active" : ""}
            onClick={() => setCategory(type)}
          >
            {type === "Sets" ? "Two-piece sets" : type}
          </button>
        ))}
      </div>
      {swipeOpen && (
        <div className="shop-swipe-modal">
          <button
            className="shop-swipe-modal-scrim"
            onClick={() => setSwipeOpen(false)}
            aria-label="Close swipe mode"
          />
          <div className="shop-swipe-modal-card">
            <DiscoverDeck
              key={[
                category,
                query,
                minPrice,
                maxPrice,
                sort,
                inStockOnly,
              ].join("-")}
              products={filteredProducts}
              onLike={onLike}
              onSkip={onSkip}
              onView={onDetails}
              onAdd={onAdd}
              onClose={() => setSwipeOpen(false)}
            />
          </div>
        </div>
      )}
      <div className="market-shop-results-head">
        <div>
          <p>Browse the edit</p>
          <h2>Every piece, your way.</h2>
        </div>
        <span>{filteredProducts.length} available now</span>
      </div>
      {filteredProducts.length ? (
        <div className="market-product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
              onView={onDetails}
              onDetails={onDetails}
              onWish={onWish}
              wished={wishlist.includes(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="market-empty-results">
          <Search size={28} />
          <h3>No pieces matched those filters.</h3>
          <button onClick={reset}>Clear filters</button>
        </div>
      )}
    </section>
  );
}

const defaultBlockItems = (type: SectionKind) => {
  if (type === "faq")
    return [
      {
        heading: "How does sizing work?",
        text: "Use the size guide and product fit notes. If you are between sizes, send us a WhatsApp message before ordering.",
      },
      {
        heading: "Do you ship internationally?",
        text: "Yes. We deliver across Nigeria and can arrange worldwide shipping.",
      },
      {
        heading: "How should I care for Ankara?",
        text: "Wash gently inside-out in cool water and press on a low setting.",
      },
    ];
  if (type === "testimonials")
    return [
      {
        heading: "Amara, Lagos",
        text: "The fit was beautiful and the fabric looked even better in person.",
      },
      {
        heading: "Kemi, London",
        text: "A real statement piece that still felt easy enough for every day.",
      },
      {
        heading: "Dami, Abuja",
        text: "My order arrived neatly packed and exactly as pictured.",
      },
    ];
  if (type === "size-guide")
    return [
      { heading: "XS–S", text: "Bust 32–35 in · Waist 25–28 in" },
      { heading: "M", text: "Bust 36–38 in · Waist 29–31 in" },
      { heading: "L–XL", text: "Bust 39–43 in · Waist 32–36 in" },
    ];
  return [
    {
      heading: "A Beryl note",
      text: "Style, stories and print inspiration from the studio.",
    },
    {
      heading: "Wear it your way",
      text: "Easy ways to make a standout piece feel like you.",
    },
    {
      heading: "The making of a drop",
      text: "A closer look at print, fit and thoughtful finishing.",
    },
  ];
};

function CountdownBanner({ target }: { target?: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const remaining = Math.max(0, new Date(target || now).getTime() - now);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  return (
    <strong className="feature-countdown">
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </strong>
  );
}

function StorefrontFeatureBlock({
  section,
  onFollow,
}: {
  section: StoreSection;
  onFollow: (link?: string) => void;
}) {
  const items = section.contentItems?.length
    ? section.contentItems
    : defaultBlockItems(section.type);
  const className = `market-feature-block ${section.type} ${section.hideOnMobile ? "hide-on-mobile" : ""} ${section.hideOnDesktop ? "hide-on-desktop" : ""}`;
  const style = {
    backgroundColor: section.backgroundColor,
    color: section.textColor,
  };
  if (section.type === "video")
    return (
      <section className={className} style={style}>
        <div className="feature-video">
          <video
            controls
            poster={section.image || defaultHeroImage}
            src={section.videoUrl}
          />
          <div>
            <p>{section.eyebrow}</p>
            <h2>{section.title}</h2>
            <span>{section.description}</span>
            {section.cta && (
              <button onClick={() => onFollow(section.buttonLink)}>
                {section.cta} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </section>
    );
  if (section.type === "gallery") {
    const images = [section.image, ...(section.images || [])].filter(
      Boolean,
    ) as string[];
    return (
      <section className={className} style={style}>
        <div className="feature-heading">
          <p>{section.eyebrow}</p>
          <h2>{section.title}</h2>
          <span>{section.description}</span>
        </div>
        <div className="feature-gallery">
          {images.length
            ? images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt="Beryl RTW lookbook"
                />
              ))
            : items.map((item, index) => (
                <article key={index}>
                  <b>{item.heading}</b>
                  <span>{item.text}</span>
                </article>
              ))}
        </div>
      </section>
    );
  }
  if (section.type === "faq")
    return (
      <section className={className} style={style}>
        <div className="feature-heading">
          <p>{section.eyebrow}</p>
          <h2>{section.title}</h2>
          <span>{section.description}</span>
        </div>
        <div className="feature-faq">
          {items.map((item, index) => (
            <details key={index}>
              <summary>
                {item.heading}
                <Plus size={16} />
              </summary>
              <p>{item.text}</p>
            </details>
          ))}
        </div>
      </section>
    );
  if (section.type === "countdown")
    return (
      <section className={className} style={style}>
        <p>{section.eyebrow}</p>
        <h2>{section.title}</h2>
        <span>{section.description}</span>
        <CountdownBanner target={section.countdownTo} />
        {section.cta && (
          <button onClick={() => onFollow(section.buttonLink)}>
            {section.cta} <ArrowRight size={16} />
          </button>
        )}
      </section>
    );
  if (section.type === "size-guide")
    return (
      <section className={className} style={style}>
        <div className="feature-heading">
          <p>{section.eyebrow}</p>
          <h2>{section.title}</h2>
          <span>{section.description}</span>
        </div>
        <div className="feature-size-grid">
          {items.map((item, index) => (
            <article key={index}>
              <b>{item.heading}</b>
              <span>{item.text}</span>
            </article>
          ))}
        </div>
      </section>
    );
  return (
    <section className={className} style={style}>
      <div className="feature-heading">
        <p>{section.eyebrow}</p>
        <h2>{section.title}</h2>
        <span>{section.description}</span>
      </div>
      <div className="feature-cards">
        {items.map((item, index) => (
          <article key={index}>
            {section.type === "testimonials" && (
              <span className="feature-stars">★★★★★</span>
            )}
            <h3>{item.heading}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      {section.cta && (
        <button onClick={() => onFollow(section.buttonLink)}>
          {section.cta} <ArrowRight size={16} />
        </button>
      )}
    </section>
  );
}

function AboutPage({
  sections,
  products,
  onBack,
  onFollow,
  onCategory,
  onAdd,
  onDetails,
  onWish,
  wishlist,
}: {
  sections: StoreSection[];
  products: Product[];
  onBack: () => void;
  onFollow: (link?: string) => void;
  onCategory: (type: string) => void;
  onAdd: (product: Product) => void;
  onDetails: (product: Product) => void;
  onWish: (product: Product) => void;
  wishlist: number[];
}) {
  const [submitted, setSubmitted] = useState(false);
  const liveSections = sections.filter(sectionIsLive);
  const hero = liveSections.find((section) => section.type === "hero");
  const bodySections = liveSections.filter(
    (section) => section.id !== hero?.id,
  );
  const activeProducts = products.filter(
    (product) => product.status !== "archived",
  );
  return (
    <div className="market-about-page">
      <div className="market-about-topline">
        <button onClick={onBack}>
          <ChevronLeft size={16} /> Back to shop
        </button>
        <span>About Beryl RTW</span>
      </div>
      {hero ? (
        <section
          className={`market-hero market-about-hero ${hero.layout || "image-right"}`}
          style={{ backgroundColor: hero.backgroundColor }}
        >
          <div className="market-hero-copy" style={{ color: hero.textColor }}>
            <p>{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <span>{hero.description}</span>
            {hero.cta && (
              <button onClick={() => onFollow(hero.buttonLink || "/")}>
                {hero.cta} <ArrowRight size={16} />
              </button>
            )}
          </div>
          <div className="market-hero-art">
            <img
              src={hero.image || defaultHeroImage}
              alt="Beryl RTW Ankara ready-to-wear"
            />
          </div>
        </section>
      ) : (
        <section className="market-about-empty">
          <p>Meet Beryl RTW</p>
          <h1>Our story is still being written.</h1>
          <button onClick={onBack}>Shop the collection</button>
        </section>
      )}
      {bodySections.map((section) => {
        if (section.type === "categories")
          return (
            <section
              className="market-categories market-about-categories"
              key={section.id}
            >
              <div className="market-section-title">
                <div>
                  <p>{section.eyebrow}</p>
                  <h2>{section.title}</h2>
                  <span>{section.description}</span>
                </div>
              </div>
              <div className="market-category-row">
                {["Dresses", "Sets", "Tops", "Skirts", "Jumpsuits"].map(
                  (type, index) => (
                    <button key={type} onClick={() => onCategory(type)}>
                      <img
                        className="market-category-photo"
                        src={
                          products.find((product) => product.type === type)
                            ?.image || defaultHeroImage
                        }
                        alt=""
                        aria-hidden="true"
                      />
                      <b>{type}</b>
                      <small>Shop now</small>
                    </button>
                  ),
                )}
              </div>
            </section>
          );
        if (section.type === "products")
          return (
            <section className="market-shop market-about-shop" key={section.id}>
              <div className="market-section-title">
                <div>
                  <p>{section.eyebrow}</p>
                  <h2>{section.title}</h2>
                  <span>{section.description}</span>
                </div>
              </div>
              <div className="market-product-grid">
                {activeProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={onAdd}
                    onView={onDetails}
                    onDetails={onDetails}
                    onWish={onWish}
                    wished={wishlist.includes(product.id)}
                  />
                ))}
              </div>
            </section>
          );
        if (section.type === "promo")
          return (
            <section className="market-promo" key={section.id}>
              <div className="market-promo-image">
                <img
                  src={section.image || defaultHeroImage}
                  alt="Beryl RTW campaign"
                />
              </div>
              <div>
                <p>{section.eyebrow}</p>
                <h2>{section.title}</h2>
                <span>{section.description}</span>
                {section.cta && (
                  <button onClick={() => onFollow(section.buttonLink || "/")}>
                    {section.cta} <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </section>
          );
        if (section.type === "story")
          return (
            <section
              className="market-story market-about-story"
              key={section.id}
              style={{
                backgroundColor: section.backgroundColor,
                color: section.textColor,
              }}
            >
              <div>
                <p>{section.eyebrow}</p>
                <h2>{section.title}</h2>
              </div>
              <p>{section.description}</p>
              {section.cta && (
                <button onClick={() => onFollow(section.buttonLink || "/")}>
                  {section.cta} <ArrowRight size={16} />
                </button>
              )}
            </section>
          );
        if (section.type === "content")
          return (
            <section
              className={`market-custom-row ${section.layout || "split"}`}
              key={section.id}
              style={{
                backgroundColor: section.backgroundColor || "#f5f1e9",
                color: section.textColor || "#10251b",
              }}
            >
              {section.image && (
                <img src={section.image} alt={section.title || "Beryl RTW"} />
              )}
              <div>
                <p>{section.eyebrow}</p>
                <h2>{section.title}</h2>
                <span>{section.description}</span>
                <div
                  className="market-custom-columns"
                  style={{
                    gridTemplateColumns: `repeat(${section.columns || 1}, minmax(0, 1fr))`,
                  }}
                >
                  {(section.columnItems || []).map((item, index) => (
                    <article key={`${section.id}-${index}`}>
                      {item.heading && <h3>{item.heading}</h3>}
                      {item.text && <p>{item.text}</p>}
                      {item.button && (
                        <button onClick={() => onFollow(item.link)}>
                          {item.button} <ArrowRight size={16} />
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        if (section.type === "newsletter")
          return (
            <section className="market-newsletter" key={section.id}>
              <p>{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <span>{section.description}</span>
              {submitted ? (
                <strong>You're on the list — welcome to Beryl RTW.</strong>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <input
                    aria-label="Email address"
                    type="email"
                    required
                    placeholder="Your email address"
                  />
                  <button>{section.cta || "Join the list"}</button>
                </form>
              )}
            </section>
          );
        if (
          [
            "discover",
            "testimonials",
            "video",
            "gallery",
            "faq",
            "countdown",
            "size-guide",
            "journal",
          ].includes(section.type)
        )
          return (
            <StorefrontFeatureBlock
              key={section.id}
              section={section}
              onFollow={onFollow}
            />
          );
        return null;
      })}
    </div>
  );
}

function Storefront({
  products,
  sections,
  aboutSections,
  logo,
  announcement,
}: {
  products: Product[];
  sections: StoreSection[];
  aboutSections: StoreSection[];
  logo: string;
  announcement: string;
}) {
  const [cart, setCart] = useState<Product[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("beryl-wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(() => {
    const match = window.location.pathname.match(/^\/products\/(\d+)/);
    return match
      ? products.find((product) => product.id === Number(match[1])) || null
      : null;
  });
  const [categoryRoute, setCategoryRoute] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/category\/([^/]+)/);
    if (!match) return null;
    const category = match[1].replace(/-/g, " ");
    return category.charAt(0).toUpperCase() + category.slice(1);
  });
  const [aboutRoute, setAboutRoute] = useState(() =>
    ["/about", "/our-story"].includes(window.location.pathname),
  );
  const [shopRoute, setShopRoute] = useState(
    () => window.location.pathname === "/shop",
  );
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [visitorSessionId] = useState(() => {
    const existing = localStorage.getItem("beryl-visitor-session");
    if (existing) return existing;
    const next = crypto.randomUUID();
    localStorage.setItem("beryl-visitor-session", next);
    return next;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState(
    "Hello Beryl RTW, I would like to ask about your collection.",
  );
  const [notice, setNotice] = useState("");
  const hero = getSection(sections, "hero");
  const categories = getSection(sections, "categories");
  const productSection = getSection(sections, "products");
  const promo = getSection(sections, "promo");
  const story = getSection(sections, "story");
  const newsletter = getSection(sections, "newsletter");
  const featureSections = sections.filter(
    (section) =>
      [
        "testimonials",
        "video",
        "gallery",
        "faq",
        "countdown",
        "size-guide",
        "journal",
      ].includes(section.type) && sectionIsLive(section),
  );
  const types = ["All", "Dresses", "Sets", "Tops", "Skirts", "Jumpsuits"];
  useEffect(() => {
    const timer = window.setTimeout(
      () => setSearchQuery(searchInput.trim().toLowerCase()),
      260,
    );
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    localStorage.setItem("beryl-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    const syncRoute = () => {
      const match = window.location.pathname.match(/^\/products\/(\d+)/);
      setDetailProduct(
        match
          ? products.find((product) => product.id === Number(match[1])) || null
          : null,
      );
      const categoryMatch =
        window.location.pathname.match(/^\/category\/([^/]+)/);
      if (categoryMatch) {
        const category = categoryMatch[1].replace(/-/g, " ");
        const nextCategory =
          category.charAt(0).toUpperCase() + category.slice(1);
        setCategoryRoute(nextCategory);
        setFilter(nextCategory);
        setAboutRoute(false);
        setShopRoute(false);
      } else if (["/about", "/our-story"].includes(window.location.pathname)) {
        setAboutRoute(true);
        setShopRoute(false);
        setDetailProduct(null);
        setCategoryRoute(null);
      } else if (window.location.pathname === "/shop") {
        setShopRoute(true);
        setAboutRoute(false);
        setDetailProduct(null);
        setCategoryRoute(null);
      } else if (!match) {
        setAboutRoute(false);
        setShopRoute(false);
        setCategoryRoute(null);
        setFilter("All");
      } else {
        setAboutRoute(false);
        setShopRoute(false);
        setCategoryRoute(null);
      }
    };
    window.addEventListener("popstate", syncRoute);
    syncRoute();
    return () => window.removeEventListener("popstate", syncRoute);
  }, [products]);
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const productPrice = priceNumber(product.price);
      const searchMatch =
        !searchQuery ||
        [product.name, product.type, product.tag, product.color]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery);
      return (
        (filter === "All" || product.type === filter) &&
        product.status !== "archived" &&
        searchMatch &&
        (!minPrice || productPrice >= Number(minPrice)) &&
        (!maxPrice || productPrice <= Number(maxPrice)) &&
        (!inStockOnly || (product.stock || 0) > 0)
      );
    });
    return [...filtered].sort((a, b) => {
      if (sort === "low") return priceNumber(a.price) - priceNumber(b.price);
      if (sort === "high") return priceNumber(b.price) - priceNumber(a.price);
      if (sort === "best")
        return Number(/best/i.test(b.tag)) - Number(/best/i.test(a.tag));
      return b.id - a.id;
    });
  }, [filter, products, searchQuery, minPrice, maxPrice, inStockOnly, sort]);
  const add = (product: Product) => {
    setCart((current) => [...current, product]);
    setBagOpen(true);
    setNotice(`${product.name} added to bag`);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };
  const openShop = (type = "All", queryValue = "") => {
    setShopRoute(true);
    setAboutRoute(false);
    setDetailProduct(null);
    setCategoryRoute(null);
    const params = new URLSearchParams();
    if (type !== "All") params.set("category", type);
    if (queryValue.trim()) params.set("q", queryValue.trim());
    const queryString = params.toString();
    const path = "/shop" + (queryString ? "?" + queryString : "");
    window.history.pushState({}, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };
  const followLink = (link?: string) => {
    if (!link || link === "#shop" || link === "/shop" || link === "shop") {
      openShop();
      return;
    }
    if (["/about", "/our-story", "about", "our-story"].includes(link)) {
      openAbout();
      return;
    }
    if (link.startsWith("#")) return jump(link.slice(1));
    window.location.assign(link);
  };
  const openAbout = () => {
    setShopRoute(false);
    setDetailProduct(null);
    setCategoryRoute(null);
    setAboutRoute(true);
    window.history.pushState({}, "", "/about");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };
  const openProductDetails = (product: Product) => {
    setShopRoute(false);
    setAboutRoute(false);
    setCategoryRoute(null);
    window.history.pushState({}, "", `/products/${product.id}`);
    setDetailProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openCategory = (type: string) => {
    setShopRoute(false);
    setAboutRoute(false);
    setDetailProduct(null);
    setCategoryRoute(type === "All" ? null : type);
    setFilter(type);
    window.history.pushState(
      {},
      "",
      type === "All"
        ? "/"
        : `/category/${type.toLowerCase().replace(/\s+/g, "-")}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => jump("shop"), 80);
  };
  const closeProductDetails = () => {
    window.history.pushState({}, "", "/");
    setDetailProduct(null);
    setCategoryRoute(null);
    setAboutRoute(false);
    setShopRoute(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeAbout = () => {
    window.history.pushState({}, "", "/");
    setAboutRoute(false);
    setShopRoute(false);
    setFilter("All");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeShop = () => {
    window.history.pushState({}, "", "/");
    setShopRoute(false);
    setFilter("All");
    setSearchInput("");
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSort("newest");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleWishlist = (product: Product) => {
    setWishlist((current) => {
      const saved = current.includes(product.id);
      const next = saved
        ? current.filter((id) => id !== product.id)
        : [...current, product.id];
      const database = supabase;
      if (database) {
        void database.auth.getUser().then(({ data }) => {
          if (!data.user) return;
          if (saved)
            return database
              .from("wishlist_items")
              .delete()
              .eq("customer_id", data.user.id)
              .eq("product_id", product.id);
          return database
            .from("wishlist_items")
            .upsert({ customer_id: data.user.id, product_id: product.id });
        });
      }
      setNotice(
        saved
          ? `${product.name} removed from saved pieces`
          : `${product.name} saved for later`,
      );
      window.setTimeout(() => setNotice(""), 2200);
      return next;
    });
  };
  const recordSwipe = (product: Product, direction: "like" | "skip") => {
    if (supabase)
      void supabase.from("swipe_events").insert({
        product_id: product.id,
        session_id: visitorSessionId,
        direction,
      });
  };
  const likeFromDiscover = (product: Product) => {
    if (!wishlist.includes(product.id)) toggleWishlist(product);
    recordSwipe(product, "like");
  };
  const savedProducts = products.filter((product) =>
    wishlist.includes(product.id),
  );
  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setFilter("All");
    setSearchInput("");
  };
  const cartTotal = cart.reduce(
    (sum, product) => sum + priceNumber(product.price),
    0,
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Beryl RTW",
        description: "Elevated Ankara ready-to-wear designed in Lagos.",
        url: window.location.origin,
      },
      {
        "@type": "ItemList",
        name: "Beryl RTW collection",
        itemListElement: products
          .filter((product) => product.status !== "archived")
          .map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              name: product.name,
              description: product.description || product.color,
              image: product.image || defaultHeroImage,
              brand: { "@type": "Brand", name: "Beryl RTW" },
              offers: {
                "@type": "Offer",
                priceCurrency: "NGN",
                price: priceNumber(product.price),
                availability:
                  (product.stock || 0) > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
              },
            },
          })),
      },
    ],
  };
  return (
    <div className="market-storefront">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {notice && (
        <div className="market-toast" role="status">
          {notice}
        </div>
      )}
      <div className="market-utility">
        <div className="market-utility-marquee" aria-label={announcement}>
          <div className="market-utility-marquee-content">
            <span>{announcement}</span>
            <span aria-hidden="true">{announcement}</span>
          </div>
        </div>
        <span className="market-utility-secondary">
          Delivery across Nigeria · Worldwide shipping
        </span>
      </div>
      <header className="market-header">
        <button
          className="market-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <a className="market-brand" href="/">
          {logo ? (
            <img src={logo} alt="Beryl RTW" />
          ) : (
            <>
              Beryl <b>RTW</b>
            </>
          )}
        </a>
        <div className="market-search">
          <Search size={18} />
          <input
            aria-label="Search the collection"
            placeholder="Search dresses, sets and more"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setSearchQuery(searchInput.trim().toLowerCase());
                openShop("All", searchInput);
              }
            }}
          />
          <button
            onClick={() => {
              setSearchQuery(searchInput.trim().toLowerCase());
              openShop("All", searchInput);
            }}
          >
            Search
          </button>
        </div>
        <div className="market-actions">
          <IconButton
            label="Chat with Beryl RTW on WhatsApp"
            onClick={() => setChatOpen((value) => !value)}
          >
            <Users size={20} />
          </IconButton>
          <IconButton
            label="Saved pieces"
            onClick={() => setWishlistOpen(true)}
          >
            <Heart size={20} fill={wishlist.length ? "currentColor" : "none"} />
          </IconButton>
          <button className="market-cart" onClick={() => setBagOpen(true)}>
            <ShoppingBag size={19} /> Bag <b>{cart.length}</b>
          </button>
        </div>
      </header>
      {chatOpen && (
        <aside className="market-chat-popover" aria-label="Chat with Beryl RTW">
          <h3>Talk to Beryl</h3>
          <p>Questions about fit, fabric or delivery? We reply on WhatsApp.</p>
          <textarea
            value={chatMessage}
            onChange={(event) => setChatMessage(event.target.value)}
            aria-label="WhatsApp message"
          />
          <div className="market-chat-popover-actions">
            <button onClick={() => setChatOpen(false)}>Close</button>
            <button
              onClick={() => {
                const number =
                  import.meta.env.VITE_WHATSAPP_NUMBER || "2349069495391";
                window.open(
                  `https://wa.me/${number}?text=${encodeURIComponent(chatMessage)}`,
                  "_blank",
                  "noopener,noreferrer",
                );
                setChatOpen(false);
              }}
            >
              Open WhatsApp
            </button>
          </div>
        </aside>
      )}
      <nav className={menuOpen ? "market-nav open" : "market-nav"}>
        <button className="market-nav-shop" onClick={() => openShop()}>
          Shop now
        </button>
        <button
          onClick={() => {
            openCategory("Dresses");
          }}
        >
          Dresses
        </button>
        <button
          onClick={() => {
            openCategory("Sets");
          }}
        >
          Two-piece sets
        </button>
        <button
          onClick={() => {
            openCategory("Tops");
          }}
        >
          Tops
        </button>
        <button onClick={openAbout}>Our story</button>
        <button className="market-nav-sale" onClick={() => jump("shop")}>
          New drop
        </button>
        <button
          onClick={() => {
            setDiscoverOpen(true);
            setMenuOpen(false);
          }}
        >
          Discover
        </button>
      </nav>
      {bagOpen && (
        <>
          <button
            className="market-scrim"
            onClick={() => setBagOpen(false)}
            aria-label="Close bag"
          />
          <aside className="market-bag">
            <div className="market-bag-head">
              <div>
                <span>Your shopping bag</span>
                <h2>
                  {cart.length} beautiful{" "}
                  {cart.length === 1 ? "piece" : "pieces"}
                </h2>
              </div>
              <button onClick={() => setBagOpen(false)} aria-label="Close bag">
                <X />
              </button>
            </div>
            {cart.length ? (
              <>
                <div className="market-bag-items">
                  {cart.map((product, index) => (
                    <div key={`${product.id}-${index}`}>
                      <img src={product.image} alt="" />
                      <section>
                        <h3>{product.name}</h3>
                        <p>{product.price}</p>
                        <button
                          onClick={() =>
                            setCart((current) =>
                              current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                        >
                          Remove
                        </button>
                      </section>
                    </div>
                  ))}
                </div>
                <div className="market-total">
                  <span>Estimated total</span>
                  <strong>₦{cartTotal.toLocaleString()}</strong>
                </div>
                <a
                  className="market-checkout"
                  href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "2349069495391"}?text=${encodeURIComponent(`Hello Beryl RTW, I would like to order: ${cart.map((item) => item.name).join(", ")}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Continue on WhatsApp <ArrowRight size={17} />
                </a>
              </>
            ) : (
              <div className="market-bag-empty">
                <ShoppingBag size={30} />
                <p>Your bag is ready when you are.</p>
                <button
                  onClick={() => {
                    setBagOpen(false);
                    openShop();
                  }}
                >
                  Start shopping
                </button>
              </div>
            )}
          </aside>
        </>
      )}
      {wishlistOpen && (
        <>
          <button
            className="market-scrim"
            onClick={() => setWishlistOpen(false)}
            aria-label="Close saved pieces"
          />
          <aside className="market-bag market-wishlist">
            <div className="market-bag-head">
              <div>
                <span>Saved pieces</span>
                <h2>
                  {savedProducts.length}{" "}
                  {savedProducts.length === 1 ? "favourite" : "favourites"}
                </h2>
              </div>
              <button
                onClick={() => setWishlistOpen(false)}
                aria-label="Close saved pieces"
              >
                <X />
              </button>
            </div>
            {savedProducts.length ? (
              <div className="market-bag-items">
                {savedProducts.map((product) => (
                  <div key={product.id}>
                    <img src={product.image || defaultHeroImage} alt="" />
                    <section>
                      <h3>{product.name}</h3>
                      <p>{product.price}</p>
                      <button onClick={() => toggleWishlist(product)}>
                        Remove
                      </button>
                      <button
                        onClick={() => {
                          setWishlistOpen(false);
                          setQuickView(product);
                        }}
                      >
                        View details
                      </button>
                    </section>
                  </div>
                ))}
              </div>
            ) : (
              <div className="market-bag-empty">
                <Heart size={30} />
                <p>Save pieces you love and find them here.</p>
                <button onClick={() => setWishlistOpen(false)}>
                  Keep browsing
                </button>
              </div>
            )}
          </aside>
        </>
      )}
      {quickView && (
        <ProductQuickView
          product={quickView}
          onClose={() => setQuickView(null)}
          onAdd={add}
          onWish={toggleWishlist}
          wished={wishlist.includes(quickView.id)}
        />
      )}
      {discoverOpen && (
        <div className="discover-overlay">
          <DiscoverDeck
            products={products.filter(
              (product) => product.status !== "archived",
            )}
            onLike={likeFromDiscover}
            onSkip={(product) => recordSwipe(product, "skip")}
            onView={setQuickView}
            onAdd={add}
            onClose={() => setDiscoverOpen(false)}
          />
        </div>
      )}
      <main id="top">
        {shopRoute ? (
          <ShopPage
            products={products}
            onBack={closeShop}
            onAdd={add}
            onDetails={openProductDetails}
            onWish={toggleWishlist}
            onLike={likeFromDiscover}
            onSkip={(product) => recordSwipe(product, "skip")}
            wishlist={wishlist}
          />
        ) : aboutRoute ? (
          <AboutPage
            sections={aboutSections}
            products={products}
            onBack={closeAbout}
            onFollow={followLink}
            onCategory={openCategory}
            onAdd={add}
            onDetails={openProductDetails}
            onWish={toggleWishlist}
            wishlist={wishlist}
          />
        ) : detailProduct ? (
          <ProductDetailPage
            product={detailProduct}
            related={products
              .filter(
                (product) =>
                  product.id !== detailProduct.id &&
                  product.status !== "archived" &&
                  (product.type === detailProduct.type ||
                    product.color === detailProduct.color),
              )
              .slice(0, 4)}
            onBack={closeProductDetails}
            onAdd={add}
            onWish={toggleWishlist}
            onDetails={openProductDetails}
            wished={wishlist.includes(detailProduct.id)}
          />
        ) : categoryRoute ? (
          <CategoryPage
            type={categoryRoute}
            products={products}
            onBack={closeProductDetails}
            onAdd={add}
            onDetails={openProductDetails}
            onWish={toggleWishlist}
            wishlist={wishlist}
          />
        ) : (
          hero && (
            <section
              className={`market-hero ${hero.layout || "image-right"} ${hero.hideOnMobile ? "hide-on-mobile" : ""} ${hero.hideOnDesktop ? "hide-on-desktop" : ""}`}
              style={{ backgroundColor: hero.backgroundColor }}
            >
              <div
                className="market-hero-copy"
                style={{ color: hero.textColor }}
              >
                <p>{hero.eyebrow}</p>
                <h1>{hero.title}</h1>
                <span>{hero.description}</span>
                <button onClick={() => followLink(hero.buttonLink)}>
                  {hero.cta}
                </button>
                <div className="market-hero-proof">
                  <span>
                    <b>Secure checkout</b> Reserve on WhatsApp
                  </span>
                  <span>
                    <b>Made in Lagos</b> Worn everywhere
                  </span>
                </div>
              </div>
              <div className="market-hero-art">
                <picture>
                  {hero.mobileImage && (
                    <source
                      media="(max-width: 700px)"
                      srcSet={hero.mobileImage}
                    />
                  )}
                  <img
                    src={hero.image || defaultHeroImage}
                    alt="Beryl RTW Ankara collection"
                  />
                </picture>
                <div className="market-hero-sticker">
                  New
                  <br />
                  <em>drop</em>
                </div>
              </div>
            </section>
          )
        )}
        {!shopRoute && !aboutRoute && !detailProduct && !categoryRoute && (
          <>
            {categories && (
              <section className="market-categories">
                <div className="market-section-title">
                  <div>
                    <p>{categories.eyebrow}</p>
                    <h2>{categories.title}</h2>
                  </div>
                  <button
                    onClick={() => {
                      openCategory("All");
                    }}
                  >
                    {categories.cta}
                  </button>
                </div>
                <div className="market-category-row">
                  {types.slice(1).map((type, index) => (
                    <button
                      key={type}
                      onClick={() => {
                        openCategory(type);
                      }}
                    >
                      <img
                        className="market-category-photo"
                        src={
                          products.find((product) => product.type === type)
                            ?.image || defaultHeroImage
                        }
                        alt=""
                        aria-hidden="true"
                      />
                      <span className={`market-category-icon cat-${index + 1}`}>
                        {index === 0
                          ? "⌁"
                          : index === 1
                            ? "✦"
                            : index === 2
                              ? "◒"
                              : "◌"}
                      </span>
                      <b>{type}</b>
                      <small>Shop now</small>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section
              className="market-trust-row"
              aria-label="Beryl RTW promises"
            >
              <article>
                <strong>Premium Ankara</strong>
                <span>Rich, expressive fabrics selected for lasting wear.</span>
              </article>
              <article>
                <strong>Limited pieces</strong>
                <span>
                  Small-batch drops made to feel personal, never mass-made.
                </span>
              </article>
              <article>
                <strong>Perfect fit</strong>
                <span>
                  Thoughtful cuts and an easy fit guide for every silhouette.
                </span>
              </article>
              <article>
                <strong>Easy returns</strong>
                <span>Simple support when a piece is not quite right.</span>
              </article>
              <article>
                <strong>Here for you</strong>
                <span>
                  Excellent customer care before and after your order.
                </span>
              </article>
            </section>
            {productSection && (
              <section className="market-shop" id="shop">
                <div className="market-section-title">
                  <div>
                    <p>{productSection.eyebrow}</p>
                    <h2>{productSection.title}</h2>
                    <span>{productSection.description}</span>
                  </div>
                  <div className="market-controls">
                    <button
                      onClick={() => {
                        setFilterOpen((value) => !value);
                        setSortOpen(false);
                      }}
                      aria-expanded={filterOpen}
                    >
                      <SlidersHorizontal size={15} /> Filter
                    </button>
                    <button
                      onClick={() => {
                        setSortOpen((value) => !value);
                        setFilterOpen(false);
                      }}
                      aria-expanded={sortOpen}
                    >
                      <ChevronDown size={15} /> Sort
                    </button>
                  </div>
                </div>
                {filterOpen && (
                  <div className="market-filter-panel">
                    <label>
                      Minimum price (₦)
                      <input
                        type="number"
                        min="0"
                        value={minPrice}
                        onChange={(event) => setMinPrice(event.target.value)}
                        placeholder="0"
                      />
                    </label>
                    <label>
                      Maximum price (₦)
                      <input
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(event) => setMaxPrice(event.target.value)}
                        placeholder="Any"
                      />
                    </label>
                    <label className="market-check">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(event) =>
                          setInStockOnly(event.target.checked)
                        }
                      />{" "}
                      In stock only
                    </label>
                    <button
                      onClick={() => {
                        resetFilters();
                        setFilterOpen(false);
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
                {sortOpen && (
                  <div
                    className="market-sort-panel"
                    role="listbox"
                    aria-label="Sort products"
                  >
                    {[
                      { value: "newest", label: "Newest" },
                      { value: "low", label: "Price: low to high" },
                      { value: "high", label: "Price: high to low" },
                      { value: "best", label: "Best-selling" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={sort === option.value ? "active" : ""}
                        onClick={() => {
                          setSort(option.value);
                          setSortOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="market-filter-row">
                  {types.map((type) => (
                    <button
                      className={filter === type ? "active" : ""}
                      key={type}
                      onClick={() => setFilter(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="market-product-grid">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={add}
                      onView={setQuickView}
                      onDetails={openProductDetails}
                      onWish={toggleWishlist}
                      wished={wishlist.includes(product.id)}
                    />
                  ))}
                </div>
                {!visibleProducts.length && (
                  <div className="market-empty-results">
                    <Search size={28} />
                    <h3>No pieces matched that search.</h3>
                    <button onClick={resetFilters}>
                      Clear search and filters
                    </button>
                  </div>
                )}
              </section>
            )}
            {promo && (
              <section className="market-promo">
                <div className="market-promo-image">
                  <img
                    src={promo.image || defaultHeroImage}
                    alt="Beryl RTW campaign"
                    onError={(event) => {
                      event.currentTarget.src = defaultHeroImage;
                    }}
                  />
                </div>
                <div>
                  <p>{promo.eyebrow}</p>
                  <h2>{promo.title}</h2>
                  <span>{promo.description}</span>
                  <button
                    onClick={() => followLink(promo.buttonLink || "/about")}
                  >
                    {promo.cta}
                  </button>
                </div>
              </section>
            )}
            {story && (
              <section className="market-story" id="story">
                <div>
                  <p>{story.eyebrow}</p>
                  <h2>{story.title}</h2>
                </div>
                <p>{story.description}</p>
                <button onClick={openAbout}>{story.cta}</button>
              </section>
            )}
            {sections
              .filter(
                (section) => section.type === "content" && section.visible,
              )
              .map((section) => (
                <section
                  className={`market-custom-row ${section.layout || "split"}`}
                  key={section.id}
                  style={{
                    backgroundColor: section.backgroundColor || "#f5f1e9",
                    color: section.textColor || "#10251b",
                  }}
                >
                  {section.image && (
                    <img
                      src={section.image}
                      alt={section.title || "Beryl RTW"}
                    />
                  )}
                  <div>
                    <p>{section.eyebrow}</p>
                    <h2>{section.title}</h2>
                    <span>{section.description}</span>
                    <div
                      className="market-custom-columns"
                      style={{
                        gridTemplateColumns: `repeat(${section.columns || 1}, minmax(0, 1fr))`,
                      }}
                    >
                      {(section.columnItems?.length
                        ? section.columnItems
                        : [
                            {
                              heading: "",
                              text: "",
                              button: section.cta,
                              link: section.buttonLink || "#shop",
                            },
                          ]
                      ).map((item, index) => (
                        <article key={`${section.id}-${index}`}>
                          {item.heading && <h3>{item.heading}</h3>}
                          {item.text && <p>{item.text}</p>}
                          {item.button && (
                            <button onClick={() => followLink(item.link)}>
                              {item.button} <ArrowRight size={17} />
                            </button>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            {featureSections.map((section) => (
              <StorefrontFeatureBlock
                key={section.id}
                section={section}
                onFollow={followLink}
              />
            ))}
            {newsletter && (
              <section className="market-newsletter">
                <p>{newsletter.eyebrow}</p>
                <h2>{newsletter.title}</h2>
                <span>{newsletter.description}</span>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setNotice("You are on the list — welcome to Beryl RTW.");
                    event.currentTarget.reset();
                  }}
                >
                  <input
                    aria-label="Email address"
                    type="email"
                    required
                    placeholder="Your email address"
                  />
                  <button>{newsletter.cta}</button>
                </form>
              </section>
            )}
            <section
              className="market-instagram"
              aria-label="Beryl RTW on Instagram"
            >
              <div className="market-instagram-head">
                <h2>Seen in the wild.</h2>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  @berylrtw on Instagram
                </a>
              </div>
              <div className="market-instagram-grid">
                {products.slice(0, 6).map((product) => (
                  <img
                    key={`ig-${product.id}`}
                    src={product.image || defaultHeroImage}
                    alt={product.name}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="market-footer">
        <a className="market-brand" href="/">
          {logo ? (
            <img src={logo} alt="Beryl RTW" />
          ) : (
            <>
              Beryl <b>RTW</b>
            </>
          )}
        </a>
        <p>
          Elevated Ankara ready-to-wear.
          <br />
          Designed in Lagos. Worn everywhere.
        </p>
        <span className="market-tagline">Elegance · Excellence · Modest</span>
        <div>
          <button onClick={() => jump("shop")}>Shop</button>
          <button onClick={openAbout}>About</button>
        </div>
        <small>© 2026 Beryl RTW</small>
      </footer>
    </div>
  );
}

function SortableSection({
  section,
  selected,
  onSelect,
  onToggle,
}: {
  section: StoreSection;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const meta = sectionMeta[section.type];
  const Icon = meta.icon;
  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`builder-section-row ${selected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
      onClick={onSelect}
    >
      <span
        className="builder-grip"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${meta.label}`}
      >
        <GripVertical size={17} />
      </span>
      <span className="builder-section-icon">
        <Icon size={17} />
      </span>
      <span>
        <b>{meta.label}</b>
        <small>
          {section.visible ? "Visible on website" : "Hidden from website"}
        </small>
      </span>
      <span
        className={section.visible ? "builder-live-dot on" : "builder-live-dot"}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      />
    </button>
  );
}

function StorefrontBuilder({
  sections,
  onChange,
  onSave,
  pageLabel = "Homepage",
  previewPath = "/",
}: {
  sections: StoreSection[];
  onChange: (items: StoreSection[]) => void;
  onSave: () => Promise<void>;
  pageLabel?: string;
  previewPath?: string;
}) {
  const [selectedId, setSelectedId] = useState(sections[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const selected =
    sections.find((section) => section.id === selectedId) || sections[0];
  const updateSection = (patch: Partial<StoreSection>) => {
    if (!selected) return;
    onChange(
      sections.map((section) =>
        section.id === selected.id ? { ...section, ...patch } : section,
      ),
    );
  };
  const reorder = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);
    onChange(arrayMove(sections, oldIndex, newIndex));
  };
  const addSection = (type: SectionKind) => {
    const meta = sectionMeta[type];
    const id = `${type}-${Date.now()}`;
    const section: StoreSection = {
      id,
      type,
      title: meta.label,
      eyebrow: "New section",
      description: meta.help,
      cta: "Learn more",
      visible: true,
      theme: "cream",
      columns: type === "content" ? 2 : undefined,
      columnItems: type === "content" ? makeColumnItems(2) : undefined,
      layout: type === "content" ? "split" : undefined,
      buttonLink: "#shop",
      contentItems: ["testimonials", "faq", "size-guide", "journal"].includes(
        type,
      )
        ? defaultBlockItems(type)
        : undefined,
      images:
        type === "gallery"
          ? [
              defaultHeroImage,
              "https://i.pinimg.com/736x/c9/18/01/c91801c158eac12765057920e58a5f34.jpg",
              "https://images.ctfassets.net/7bobsix9kke6/1D4OA5xtYKxbHYJYfMNkau/7a9b9d04b2495bb296a8776605bd1d5e/stylegoestochurch_91806993_151752566367367_4535886086198977974_n.jpg",
            ]
          : undefined,
      countdownTo:
        type === "countdown"
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 16)
          : undefined,
    };
    onChange([...sections, section]);
    setSelectedId(id);
  };
  const removeSelected = () => {
    if (!selected) return;
    const remaining = sections.filter((section) => section.id !== selected.id);
    onChange(remaining);
    setSelectedId(remaining[0]?.id || "");
  };
  const duplicateSelected = () => {
    if (!selected) return;
    const copy = {
      ...selected,
      id: `${selected.type}-${Date.now()}`,
      title: `${selected.title} copy`,
      scheduledAt: undefined,
    };
    onChange([...sections, copy]);
    setSelectedId(copy.id);
  };
  const revertToPublished = () => {
    try {
      const published = JSON.parse(
        localStorage.getItem("beryl-last-published-layout") || "",
      );
      if (
        Array.isArray(published) &&
        published.length &&
        window.confirm("Revert this canvas to the last published version?")
      ) {
        onChange(published as StoreSection[]);
        setSelectedId(published[0].id);
      }
    } catch {
      window.alert(
        "There is no previously published layout saved on this device yet.",
      );
    }
  };
  const uploadSectionImage = async (
    file?: File,
    field: "image" | "mobileImage" = "image",
  ) => {
    if (!file || !selected) return;
    if (supabase) {
      const path = `storefront/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`;
      const { error } = await supabase.storage
        .from("brand-assets")
        .upload(path, file);
      if (error) {
        window.alert(`Photo upload failed: ${error.message}`);
        return;
      }
      const { data } = supabase.storage.from("brand-assets").getPublicUrl(path);
      updateSection({ [field]: data.publicUrl });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateSection({ [field]: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return (
    <div className="builder-layout">
      <section className="builder-rail">
        <div className="builder-rail-head">
          <div>
            <p>Storefront</p>
            <h2>Page builder</h2>
          </div>
          <span>Live editing</span>
        </div>
        <p className="builder-help">
          Drag sections to rearrange the {pageLabel.toLowerCase()}. Click one to
          change its words, visibility and style.
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={reorder}
        >
          <SortableContext
            items={sections.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                selected={section.id === selectedId}
                onSelect={() => setSelectedId(section.id)}
                onToggle={() =>
                  onChange(
                    sections.map((item) =>
                      item.id === section.id
                        ? { ...item, visible: !item.visible }
                        : item,
                    ),
                  )
                }
              />
            ))}
          </SortableContext>
        </DndContext>
        <div className="builder-add">
          <p>Add a block</p>
          <div>
            {(Object.keys(sectionMeta) as SectionKind[]).map((type) => {
              const Icon = sectionMeta[type].icon;
              return (
                <button key={type} onClick={() => addSection(type)}>
                  <Plus size={14} />
                  <Icon size={15} /> {sectionMeta[type].label}
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <section className="builder-canvas">
        <div className="builder-toolbar">
          <div>
            <span className="builder-online" /> {pageLabel} ·{" "}
            {sections.filter((section) => section.visible).length} blocks live
          </div>
          <div>
            <button onClick={revertToPublished}>
              <ChevronLeft size={16} /> Revert
            </button>
            <button
              onClick={() =>
                window.open(previewPath, "_blank", "noopener,noreferrer")
              }
            >
              <Eye size={16} /> Preview
            </button>
            <button
              className="builder-save"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await onSave();
                setSaving(false);
              }}
            >
              <Upload size={16} /> {saving ? "Saving…" : "Publish changes"}
            </button>
          </div>
        </div>
        <div className="builder-phone">
          <div className="builder-phone-top">
            <b>
              Beryl <em>RTW</em>
            </b>
            <span>
              <Search size={14} />
              <ShoppingBag size={14} />
            </span>
          </div>
          {sections
            .filter((section) => section.visible)
            .map((section) => (
              <button
                className={`builder-preview-block ${section.type} ${section.id === selectedId ? "active" : ""}`}
                key={section.id}
                onClick={() => setSelectedId(section.id)}
                style={{
                  backgroundColor: section.backgroundColor,
                  color: section.textColor,
                }}
              >
                {section.type === "hero" && (
                  <>
                    {section.image && (
                      <img
                        className="builder-preview-hero-image"
                        src={section.image}
                        alt="Hero preview"
                      />
                    )}
                    <small>{section.eyebrow}</small>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                    <span>
                      {section.cta} <ArrowRight size={13} />
                    </span>
                  </>
                )}
                {section.type === "categories" && (
                  <>
                    <small>{section.eyebrow}</small>
                    <h3>{section.title}</h3>
                    <div className="builder-preview-cats">
                      <i>Dress</i>
                      <i>Sets</i>
                      <i>Tops</i>
                    </div>
                  </>
                )}
                {section.type === "products" && (
                  <>
                    <small>{section.eyebrow}</small>
                    <h3>{section.title}</h3>
                    <div className="builder-preview-products">
                      <i />
                      <i />
                      <i />
                    </div>
                  </>
                )}
                {section.type === "promo" && (
                  <>
                    <small>{section.eyebrow}</small>
                    <h2>{section.title}</h2>
                    <span>
                      {section.cta} <ArrowRight size={13} />
                    </span>
                  </>
                )}
                {section.type === "story" && (
                  <>
                    <small>{section.eyebrow}</small>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                  </>
                )}
                {section.type === "newsletter" && (
                  <>
                    <small>{section.eyebrow}</small>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                    <i className="builder-preview-input" />
                  </>
                )}
                {section.type === "content" && (
                  <>
                    {section.image && (
                      <img
                        className="builder-preview-content-image"
                        src={section.image}
                        alt="Content preview"
                      />
                    )}
                    <small>{section.eyebrow}</small>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                    <div
                      className="builder-preview-columns"
                      data-columns={section.columns || 2}
                    >
                      {Array.from({ length: section.columns || 2 }).map(
                        (_, index) => (
                          <i key={index} />
                        ),
                      )}
                    </div>
                    {section.cta && <span>{section.cta}</span>}
                  </>
                )}
                {section.type === "discover" && (
                  <>
                    <small>{section.eyebrow}</small>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                    <div className="builder-preview-swipe-card">
                      <Heart size={18} /> Swipe to discover
                    </div>
                  </>
                )}
                {[
                  "testimonials",
                  "video",
                  "gallery",
                  "faq",
                  "countdown",
                  "size-guide",
                  "journal",
                ].includes(section.type) && (
                  <>
                    {section.image && (
                      <img
                        className="builder-preview-content-image"
                        src={section.image}
                        alt="Block preview"
                      />
                    )}
                    <small>{section.eyebrow}</small>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                    <div className="builder-preview-feature">
                      {sectionMeta[section.type].label}
                    </div>
                  </>
                )}
              </button>
            ))}
        </div>
      </section>
      <aside className="builder-inspector">
        {selected && (
          <>
            <div className="builder-inspector-head">
              <div>
                <p>Block settings</p>
                <h2>{sectionMeta[selected.type].label}</h2>
              </div>
              <button
                onClick={() => updateSection({ visible: !selected.visible })}
              >
                {selected.visible ? "Hide" : "Show"}
              </button>
              <button onClick={duplicateSelected}>
                <Plus size={15} /> Duplicate
              </button>
              <button
                className="builder-delete"
                onClick={() => {
                  if (
                    window.confirm("Remove this block from the landing page?")
                  ) {
                    removeSelected();
                  }
                }}
              >
                <Trash2 size={15} /> Remove
              </button>
            </div>
            <label>
              Eyebrow
              <input
                value={selected.eyebrow}
                onChange={(event) =>
                  updateSection({ eyebrow: event.target.value })
                }
              />
            </label>
            <label>
              Heading
              <textarea
                value={selected.title}
                onChange={(event) =>
                  updateSection({ title: event.target.value })
                }
                rows={3}
              />
            </label>
            <label>
              Description
              <textarea
                value={selected.description}
                onChange={(event) =>
                  updateSection({ description: event.target.value })
                }
                rows={4}
              />
            </label>
            {!["newsletter"].includes(selected.type) && (
              <>
                <label>
                  Button label
                  <input
                    value={selected.cta}
                    onChange={(event) =>
                      updateSection({ cta: event.target.value })
                    }
                  />
                </label>
                <label>
                  Button link
                  <input
                    value={selected.buttonLink || "#shop"}
                    onChange={(event) =>
                      updateSection({ buttonLink: event.target.value })
                    }
                    placeholder="#shop or https://..."
                  />
                </label>
              </>
            )}
            <label className="builder-photo-control">
              {selected.type === "hero" ? "Large hero photo" : "Section photo"}
              {selected.image && (
                <img src={selected.image} alt="Section preview" />
              )}
              <span>
                <Upload size={15} /> Upload or replace photo
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  uploadSectionImage(event.target.files?.[0])
                }
              />
            </label>
            <label>
              Photo link
              <input
                value={selected.image || ""}
                onChange={(event) =>
                  updateSection({ image: event.target.value })
                }
                placeholder="Paste an image link"
              />
            </label>
            <label className="builder-photo-control">
              Mobile-only photo <small>(optional)</small>
              {selected.mobileImage && (
                <img src={selected.mobileImage} alt="Mobile section preview" />
              )}
              <span>
                <Upload size={15} /> Upload mobile photo
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  uploadSectionImage(event.target.files?.[0], "mobileImage")
                }
              />
            </label>
            <div className="builder-visibility-controls">
              <label>
                <input
                  type="checkbox"
                  checked={selected.hideOnMobile || false}
                  onChange={(event) =>
                    updateSection({ hideOnMobile: event.target.checked })
                  }
                />{" "}
                Hide on mobile
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selected.hideOnDesktop || false}
                  onChange={(event) =>
                    updateSection({ hideOnDesktop: event.target.checked })
                  }
                />{" "}
                Hide on desktop
              </label>
            </div>
            {selected.type === "hero" && (
              <label>
                Hero layout
                <select
                  value={selected.layout || "image-right"}
                  onChange={(event) =>
                    updateSection({
                      layout: event.target.value as StoreSection["layout"],
                    })
                  }
                >
                  <option value="image-right">Image on the right</option>
                  <option value="image-left">Image on the left</option>
                  <option value="full-bleed">Full-bleed photo</option>
                  <option value="stacked">Stacked</option>
                </select>
              </label>
            )}
            {selected.type === "video" && (
              <label>
                Video link
                <input
                  value={selected.videoUrl || ""}
                  onChange={(event) =>
                    updateSection({ videoUrl: event.target.value })
                  }
                  placeholder="MP4 or video embed URL"
                />
              </label>
            )}
            {selected.type === "gallery" && (
              <label>
                Gallery photos <small>(one link per line)</small>
                <textarea
                  rows={5}
                  value={(selected.images || []).join("\n")}
                  onChange={(event) =>
                    updateSection({
                      images: event.target.value
                        .split("\n")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Paste photo links, one on each line"
                />
              </label>
            )}
            {selected.type === "countdown" && (
              <label>
                Countdown ends
                <input
                  type="datetime-local"
                  value={selected.countdownTo || ""}
                  onChange={(event) =>
                    updateSection({ countdownTo: event.target.value })
                  }
                />
              </label>
            )}
            <label>
              Schedule publish <small>(optional)</small>
              <input
                type="datetime-local"
                value={selected.scheduledAt || ""}
                onChange={(event) =>
                  updateSection({ scheduledAt: event.target.value })
                }
              />
            </label>
            {selected.type === "content" && (
              <>
                <label>
                  Row layout
                  <select
                    value={selected.layout || "split"}
                    onChange={(event) =>
                      updateSection({
                        layout: event.target.value as StoreSection["layout"],
                      })
                    }
                  >
                    <option value="split">Text and image</option>
                    <option value="image-left">Image on the left</option>
                    <option value="image-right">Image on the right</option>
                    <option value="stacked">Stacked on mobile</option>
                  </select>
                </label>
                <label>
                  Columns
                  <select
                    value={selected.columns || 2}
                    onChange={(event) => {
                      const count = Number(event.target.value);
                      const current =
                        selected.columnItems ||
                        makeColumnItems(selected.columns || 2);
                      updateSection({
                        columns: count,
                        columnItems: [
                          ...current,
                          ...makeColumnItems(count),
                        ].slice(0, count),
                      });
                    }}
                  >
                    <option value="1">1 column</option>
                    <option value="2">2 columns</option>
                    <option value="3">3 columns</option>
                    <option value="4">4 columns</option>
                  </select>
                </label>
                <div className="builder-column-editor">
                  <b>Edit each column</b>
                  {(
                    selected.columnItems ||
                    makeColumnItems(selected.columns || 2)
                  ).map((column, index) => (
                    <fieldset key={index}>
                      <legend>Column {index + 1}</legend>
                      <input
                        value={column.heading}
                        onChange={(event) => {
                          const items = [
                            ...(selected.columnItems ||
                              makeColumnItems(selected.columns || 2)),
                          ];
                          items[index] = {
                            ...items[index],
                            heading: event.target.value,
                          };
                          updateSection({ columnItems: items });
                        }}
                        placeholder="Column heading"
                      />
                      <textarea
                        rows={2}
                        value={column.text}
                        onChange={(event) => {
                          const items = [
                            ...(selected.columnItems ||
                              makeColumnItems(selected.columns || 2)),
                          ];
                          items[index] = {
                            ...items[index],
                            text: event.target.value,
                          };
                          updateSection({ columnItems: items });
                        }}
                        placeholder="Column text"
                      />
                      <input
                        value={column.button}
                        onChange={(event) => {
                          const items = [
                            ...(selected.columnItems ||
                              makeColumnItems(selected.columns || 2)),
                          ];
                          items[index] = {
                            ...items[index],
                            button: event.target.value,
                          };
                          updateSection({ columnItems: items });
                        }}
                        placeholder="Button label (optional)"
                      />
                      <input
                        value={column.link}
                        onChange={(event) => {
                          const items = [
                            ...(selected.columnItems ||
                              makeColumnItems(selected.columns || 2)),
                          ];
                          items[index] = {
                            ...items[index],
                            link: event.target.value,
                          };
                          updateSection({ columnItems: items });
                        }}
                        placeholder="#shop or https://..."
                      />
                    </fieldset>
                  ))}
                </div>
              </>
            )}
            {["testimonials", "faq", "size-guide", "journal"].includes(
              selected.type,
            ) && (
              <div className="builder-column-editor">
                <b>Edit cards and answers</b>
                {(
                  selected.contentItems || defaultBlockItems(selected.type)
                ).map((item, index) => (
                  <fieldset key={index}>
                    <legend>Item {index + 1}</legend>
                    <input
                      value={item.heading}
                      onChange={(event) => {
                        const items = [
                          ...(selected.contentItems ||
                            defaultBlockItems(selected.type)),
                        ];
                        items[index] = {
                          ...items[index],
                          heading: event.target.value,
                        };
                        updateSection({ contentItems: items });
                      }}
                      placeholder="Heading"
                    />
                    <textarea
                      rows={3}
                      value={item.text}
                      onChange={(event) => {
                        const items = [
                          ...(selected.contentItems ||
                            defaultBlockItems(selected.type)),
                        ];
                        items[index] = {
                          ...items[index],
                          text: event.target.value,
                        };
                        updateSection({ contentItems: items });
                      }}
                      placeholder="Text"
                    />
                  </fieldset>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    updateSection({
                      contentItems: [
                        ...(selected.contentItems ||
                          defaultBlockItems(selected.type)),
                        {
                          heading: "New item",
                          text: "Write your content here.",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={14} /> Add item
                </button>
              </div>
            )}
            <div className="builder-colour-grid">
              <label>
                Background colour
                <input
                  type="color"
                  value={selected.backgroundColor || "#f5f1e9"}
                  onChange={(event) =>
                    updateSection({ backgroundColor: event.target.value })
                  }
                />
              </label>
              <label>
                Text colour
                <input
                  type="color"
                  value={selected.textColor || "#10251b"}
                  onChange={(event) =>
                    updateSection({ textColor: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Colour mood
              <select
                value={selected.theme || "cream"}
                onChange={(event) =>
                  updateSection({ theme: event.target.value })
                }
              >
                <option value="cream">Soft cream</option>
                <option value="cobalt">Cobalt blue</option>
                <option value="lime">Electric lime</option>
                <option value="ink">Deep ink</option>
              </select>
            </label>
            <div className="builder-tip">
              <CircleHelp size={16} />
              <span>
                <b>Simple rule</b> Keep a hero, product collection and checkout
                path visible so shoppers can always buy.
              </span>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function ProductEditor({
  product,
  onClose,
  onSave,
  onArchive,
}: {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  onArchive: (product: Product) => Promise<void>;
}) {
  const [draft, setDraft] = useState(product);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const update = (key: keyof Product, value: string | number) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const uploadImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      if (supabase) {
        const path = `product-images/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`;
        const { error } = await supabase.storage
          .from("brand-assets")
          .upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage
          .from("brand-assets")
          .getPublicUrl(path);
        update("image", data.publicUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => update("image", String(reader.result));
        reader.readAsDataURL(file);
      }
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="editor-sheet-wrap">
      <button
        className="editor-sheet-scrim"
        onClick={onClose}
        aria-label="Close product editor"
      />
      <form
        className="editor-sheet"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          await onSave(draft);
          setSaving(false);
          onClose();
        }}
      >
        <div className="editor-sheet-head">
          <div>
            <p>{product.id ? "Edit product" : "New product"}</p>
            <h2>{draft.name || "Untitled piece"}</h2>
          </div>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="product-photo-input">
          {draft.image ? (
            <img src={draft.image} alt="Product preview" />
          ) : (
            <ImagePlus size={28} />
          )}
          <label>
            <Upload size={15} />{" "}
            {uploading ? "Uploading…" : "Upload product photo"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => uploadImage(event.target.files?.[0])}
            />
          </label>
        </div>
        <label>
          Product name
          <input
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            required
          />
        </label>
        <div className="editor-grid">
          <label>
            Category
            <select
              value={draft.type}
              onChange={(event) => update("type", event.target.value)}
            >
              <option>Dresses</option>
              <option>Sets</option>
              <option>Tops</option>
              <option>Skirts</option>
              <option>Jumpsuits</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={draft.status || "active"}
              onChange={(event) => update("status", event.target.value)}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="sold-out">Sold out</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            Naira price
            <input
              value={draft.price}
              onChange={(event) => update("price", event.target.value)}
              required
            />
          </label>
          <label>
            USD price
            <input
              value={draft.usd}
              onChange={(event) => update("usd", event.target.value)}
            />
          </label>
          <label>
            Stock available
            <input
              type="number"
              min="0"
              value={draft.stock ?? 0}
              onChange={(event) => update("stock", Number(event.target.value))}
            />
          </label>
          <label>
            Badge
            <input
              value={draft.tag}
              onChange={(event) => update("tag", event.target.value)}
              placeholder="New arrival"
            />
          </label>
        </div>
        <label>
          Image link <small>(optional when a photo is uploaded)</small>
          <input
            value={draft.image}
            onChange={(event) => update("image", event.target.value)}
          />
        </label>
        <label>
          Colourway
          <input
            value={draft.color}
            onChange={(event) => update("color", event.target.value)}
          />
        </label>
        <label>
          Short product description
          <textarea
            rows={4}
            value={draft.description || ""}
            onChange={(event) => update("description", event.target.value)}
          />
        </label>
        <div className="editor-actions">
          {product.name && product.status !== "archived" && (
            <button
              className="editor-delete"
              type="button"
              disabled={saving}
              onClick={async () => {
                if (!window.confirm(`Remove ${product.name} from the store?`))
                  return;
                setSaving(true);
                await onArchive(product);
                setSaving(false);
                onClose();
              }}
            >
              <Trash2 size={16} /> Remove from store
            </button>
          )}
          <button className="editor-save" disabled={saving}>
            {saving ? "Saving…" : "Save product"} <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}

function ProductManager({
  products,
  onSave,
  onArchive,
}: {
  products: Product[];
  onSave: (product: Product) => Promise<void>;
  onArchive: (product: Product) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All products");
  const [editing, setEditing] = useState<Product | null>(null);
  const filtered = products.filter(
    (product) =>
      (filter === "All products"
        ? product.status !== "archived"
        : filter === "Archived"
          ? product.status === "archived"
          : product.type === filter) &&
      product.name.toLowerCase().includes(query.toLowerCase()),
  );
  const newProduct = (): Product => ({
    id: Date.now(),
    name: "",
    type: "Dresses",
    price: "₦0",
    usd: "$0",
    tag: "New arrival",
    image: "",
    color: "",
    stock: 0,
    status: "draft",
    description: "",
  });
  return (
    <>
      <div className="merchant-page-head">
        <div>
          <p>Catalog</p>
          <h1>Products</h1>
          <span>Manage inventory, photos, pricing and what customers see.</span>
        </div>
        <button
          className="merchant-primary"
          onClick={() => setEditing(newProduct())}
        >
          <Plus size={18} /> Add product
        </button>
      </div>
      <section className="product-command">
        <div className="product-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your products"
          />
        </div>
        <div>
          {[
            "All products",
            "Dresses",
            "Sets",
            "Tops",
            "Skirts",
            "Jumpsuits",
            "Archived",
          ].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <section className="merchant-products-grid">
        {filtered.map((product) => (
          <article key={product.id}>
            <div>
              <img
                src={product.image || defaultHeroImage}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = defaultHeroImage;
                }}
              />
              <span
                className={
                  product.status === "active" ? "status-live" : "status-draft"
                }
              >
                {product.status || "active"}
              </span>
              <button
                className="product-card-edit"
                onClick={() => setEditing(product)}
              >
                Edit
              </button>
            </div>
            <section>
              <p>{product.type}</p>
              <h2>{product.name}</h2>
              <strong>{product.price}</strong>
              <span>
                {product.stock ?? 0} in stock · {product.tag}
              </span>
            </section>
          </article>
        ))}
      </section>
      {!filtered.length && (
        <div className="merchant-empty">
          <Package size={32} />
          <h2>No products match this filter.</h2>
          <p>Try a different search, or add a new piece.</p>
        </div>
      )}
      {editing && (
        <ProductEditor
          product={editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
          onArchive={onArchive}
        />
      )}
    </>
  );
}

function Dashboard({
  products,
  onNavigate,
}: {
  products: Product[];
  onNavigate: (page: string) => void;
}) {
  const stock = products.reduce(
    (sum, product) => sum + (product.stock || 0),
    0,
  );
  return (
    <>
      <div className="merchant-page-head">
        <div>
          <p>Today</p>
          <h1>Good afternoon, Beryl.</h1>
          <span>Here is a clear view of the store before you begin.</span>
        </div>
        <button
          className="merchant-secondary"
          onClick={() => onNavigate("Landing page")}
        >
          <Eye size={17} /> View storefront
        </button>
      </div>
      <section className="merchant-stats">
        <article>
          <span>Today’s sales</span>
          <strong>₦0</strong>
          <small>Orders will appear here after checkout is connected.</small>
        </article>
        <article>
          <span>Live products</span>
          <strong>
            {products.filter((product) => product.status !== "draft").length}
          </strong>
          <small>Across your current collection.</small>
        </article>
        <article>
          <span>Pieces in stock</span>
          <strong>{stock}</strong>
          <small>Review low-stock pieces before your next drop.</small>
        </article>
        <article>
          <span>Store health</span>
          <strong className="good">Ready</strong>
          <small>Catalogue, brand and storefront controls are active.</small>
        </article>
      </section>
      <section className="merchant-dashboard-grid">
        <article className="merchant-card merchant-next">
          <div>
            <p>Your next best step</p>
            <h2>Arrange the homepage for your next collection.</h2>
            <span>
              Use the visual builder to move sections around—no code, no
              developer required.
            </span>
            <button onClick={() => onNavigate("Landing page")}>
              Open page builder <ArrowRight size={16} />
            </button>
          </div>
          <Layers3 size={54} />
        </article>
        <article className="merchant-card">
          <div className="merchant-card-head">
            <div>
              <p>Inventory snapshot</p>
              <h2>Keep an eye on stock</h2>
            </div>
            <button onClick={() => onNavigate("Products")}>
              Manage products <ArrowRight size={14} />
            </button>
          </div>
          {products.slice(0, 4).map((product) => (
            <div className="inventory-row" key={product.id}>
              <img src={product.image} alt="" />
              <span>
                <b>{product.name}</b>
                <small>{product.type}</small>
              </span>
              <strong>{product.stock ?? 0} left</strong>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}

function OrdersManager({
  orders,
  onCreate,
  onStatus,
}: {
  orders: Order[];
  onCreate: (order: Omit<Order, "id" | "created_at">) => Promise<void>;
  onStatus: (order: Order, status: OrderStatus) => Promise<void>;
}) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    items: "",
    total: "",
    status: "pending" as OrderStatus,
  });
  return (
    <>
      <div className="merchant-page-head">
        <div>
          <p>Order centre</p>
          <h1>Orders</h1>
          <span>
            Log WhatsApp orders here and keep every customer update in one
            place.
          </span>
        </div>
        <button className="merchant-primary" onClick={() => setCreating(true)}>
          <Plus size={18} /> Log order
        </button>
      </div>
      <section className="merchant-table-card">
        <div className="merchant-table-head">
          <b>{orders.length} orders</b>
          <span>Pending → Confirmed → Shipped → Delivered</span>
        </div>
        <div className="merchant-order-table">
          {orders.length ? (
            orders.map((order) => (
              <article key={order.id}>
                <span>
                  <b>#{order.id}</b>
                  <small>
                    {new Date(order.created_at).toLocaleDateString()}
                  </small>
                </span>
                <span>
                  <b>{order.customer_name}</b>
                  <small>{order.customer_email}</small>
                </span>
                <span>{order.items}</span>
                <strong>₦{Number(order.total).toLocaleString()}</strong>
                <select
                  value={order.status}
                  onChange={(event) =>
                    onStatus(order, event.target.value as OrderStatus)
                  }
                >
                  {[
                    "pending",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </article>
            ))
          ) : (
            <div className="merchant-empty">
              <ClipboardList size={32} />
              <h2>No orders yet.</h2>
              <p>When a customer confirms an order on WhatsApp, add it here.</p>
            </div>
          )}
        </div>
      </section>
      {creating && (
        <div className="editor-sheet-wrap">
          <button
            className="editor-sheet-scrim"
            onClick={() => setCreating(false)}
            aria-label="Close order form"
          />
          <form
            className="editor-sheet compact"
            onSubmit={async (event) => {
              event.preventDefault();
              await onCreate({ ...draft, total: Number(draft.total || 0) });
              setCreating(false);
            }}
          >
            <div className="editor-sheet-head">
              <div>
                <p>Manual order</p>
                <h2>Log a WhatsApp order</h2>
              </div>
              <button type="button" onClick={() => setCreating(false)}>
                <X />
              </button>
            </div>
            <label>
              Customer name
              <input
                value={draft.customer_name}
                onChange={(event) =>
                  setDraft({ ...draft, customer_name: event.target.value })
                }
                required
              />
            </label>
            <label>
              Customer email
              <input
                type="email"
                value={draft.customer_email}
                onChange={(event) =>
                  setDraft({ ...draft, customer_email: event.target.value })
                }
                required
              />
            </label>
            <label>
              Phone / WhatsApp
              <input
                value={draft.customer_phone}
                onChange={(event) =>
                  setDraft({ ...draft, customer_phone: event.target.value })
                }
              />
            </label>
            <label>
              Items ordered
              <textarea
                rows={3}
                value={draft.items}
                onChange={(event) =>
                  setDraft({ ...draft, items: event.target.value })
                }
                required
              />
            </label>
            <div className="editor-grid">
              <label>
                Total (₦)
                <input
                  type="number"
                  min="0"
                  value={draft.total}
                  onChange={(event) =>
                    setDraft({ ...draft, total: event.target.value })
                  }
                  required
                />
              </label>
              <label>
                Current status
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      status: event.target.value as OrderStatus,
                    })
                  }
                >
                  {[
                    "pending",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
            <button className="editor-save">
              Save order <ArrowRight size={17} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function CustomersManager({ orders }: { orders: Order[] }) {
  const customers = Object.values(
    orders.reduce<
      Record<
        string,
        {
          name: string;
          email: string;
          phone?: string;
          count: number;
          total: number;
          latest: string;
        }
      >
    >((all, order) => {
      const key = order.customer_email.toLowerCase();
      const existing = all[key] || {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        count: 0,
        total: 0,
        latest: order.created_at,
      };
      existing.count += 1;
      existing.total += Number(order.total);
      if (new Date(order.created_at) > new Date(existing.latest))
        existing.latest = order.created_at;
      all[key] = existing;
      return all;
    }, {}),
  );
  return (
    <>
      <div className="merchant-page-head">
        <div>
          <p>Customer list</p>
          <h1>Customers</h1>
          <span>
            Every customer who has ordered through Beryl RTW, with their
            purchase history.
          </span>
        </div>
      </div>
      <section className="merchant-table-card">
        <div className="merchant-table-head">
          <b>{customers.length} customers</b>
          <span>Built automatically from orders</span>
        </div>
        <div className="merchant-customer-grid">
          {customers.length ? (
            customers.map((customer) => (
              <article key={customer.email}>
                <div>
                  <span>{customer.name.slice(0, 1).toUpperCase()}</span>
                  <section>
                    <h2>{customer.name}</h2>
                    <p>{customer.email}</p>
                    {customer.phone && <small>{customer.phone}</small>}
                  </section>
                </div>
                <footer>
                  <span>
                    {customer.count} order{customer.count === 1 ? "" : "s"}
                  </span>
                  <strong>₦{customer.total.toLocaleString()}</strong>
                </footer>
              </article>
            ))
          ) : (
            <div className="merchant-empty">
              <Users size={32} />
              <h2>Your customer list will grow here.</h2>
              <p>Log the first WhatsApp order to start building it.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function MarketingManager({
  discounts,
  onCreate,
  announcement,
  setAnnouncement,
}: {
  discounts: Discount[];
  onCreate: (discount: Omit<Discount, "id" | "uses">) => Promise<void>;
  announcement: string;
  setAnnouncement: (value: string) => void;
}) {
  const [draft, setDraft] = useState({
    code: "",
    kind: "percent" as Discount["kind"],
    amount: "",
    expires_at: "",
    usage_limit: "",
  });
  return (
    <>
      <div className="merchant-page-head">
        <div>
          <p>Campaigns</p>
          <h1>Marketing</h1>
          <span>
            Create offers and keep the store announcement fresh without touching
            code.
          </span>
        </div>
      </div>
      <section className="marketing-grid">
        <article>
          <p>Announcement bar</p>
          <h2>What shoppers see first</h2>
          <textarea
            rows={4}
            value={announcement}
            onChange={(event) => setAnnouncement(event.target.value)}
          />
          <button
            className="merchant-primary"
            onClick={() =>
              localStorage.setItem("beryl-announcement", announcement)
            }
          >
            Save announcement
          </button>
        </article>
        <article>
          <p>New promotion</p>
          <h2>Create a discount code</h2>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await onCreate({
                code: draft.code.toUpperCase(),
                kind: draft.kind,
                amount: Number(draft.amount),
                expires_at: draft.expires_at || undefined,
                usage_limit: draft.usage_limit
                  ? Number(draft.usage_limit)
                  : undefined,
                active: true,
              });
              setDraft({
                code: "",
                kind: "percent",
                amount: "",
                expires_at: "",
                usage_limit: "",
              });
            }}
          >
            <input
              placeholder="BERYL10"
              value={draft.code}
              onChange={(event) =>
                setDraft({ ...draft, code: event.target.value })
              }
              required
            />
            <div>
              <select
                value={draft.kind}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    kind: event.target.value as Discount["kind"],
                  })
                }
              >
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed naira amount</option>
              </select>
              <input
                type="number"
                min="1"
                placeholder="Amount"
                value={draft.amount}
                onChange={(event) =>
                  setDraft({ ...draft, amount: event.target.value })
                }
                required
              />
            </div>
            <input
              type="datetime-local"
              value={draft.expires_at}
              onChange={(event) =>
                setDraft({ ...draft, expires_at: event.target.value })
              }
            />
            <input
              type="number"
              min="1"
              placeholder="Usage limit (optional)"
              value={draft.usage_limit}
              onChange={(event) =>
                setDraft({ ...draft, usage_limit: event.target.value })
              }
            />
            <button className="merchant-primary">
              Create code <ArrowRight size={16} />
            </button>
          </form>
        </article>
      </section>
      <section className="merchant-table-card">
        <div className="merchant-table-head">
          <b>Active codes</b>
          <span>Use these in your campaign messages</span>
        </div>
        <div className="discount-list">
          {discounts.length ? (
            discounts.map((discount) => (
              <article key={discount.id}>
                <b>{discount.code}</b>
                <span>
                  {discount.kind === "percent"
                    ? `${discount.amount}% off`
                    : `₦${discount.amount.toLocaleString()} off`}
                </span>
                <small>
                  {discount.expires_at
                    ? `Ends ${new Date(discount.expires_at).toLocaleDateString()}`
                    : "No expiry"}{" "}
                  · {discount.uses || 0} uses
                </small>
              </article>
            ))
          ) : (
            <div className="merchant-empty">
              <Megaphone size={32} />
              <h2>No promotion codes yet.</h2>
              <p>Create one for your next drop or customer thank-you offer.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function AnalyticsDashboard({
  orders,
  products,
  swipeEvents,
}: {
  orders: Order[];
  products: Product[];
  swipeEvents: Array<{
    product_id: number;
    direction: string;
    created_at: string;
  }>;
}) {
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total), 0);
  const chartData = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    const key = date.toLocaleDateString("en-GB", { weekday: "short" });
    return {
      day: key,
      revenue: orders
        .filter(
          (order) =>
            new Date(order.created_at).toDateString() === date.toDateString(),
        )
        .reduce((sum, order) => sum + Number(order.total), 0),
    };
  });
  const likes = products
    .map((product) => ({
      name: product.name,
      likes: swipeEvents.filter(
        (event) =>
          event.product_id === product.id && event.direction === "like",
      ).length,
    }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);
  return (
    <>
      <div className="merchant-page-head">
        <div>
          <p>Reporting</p>
          <h1>Analytics</h1>
          <span>
            A practical view of sales, customer orders and which pieces shoppers
            love.
          </span>
        </div>
      </div>
      <section className="merchant-stats">
        <article>
          <span>Total revenue</span>
          <strong>₦{revenue.toLocaleString()}</strong>
          <small>Excludes cancelled orders.</small>
        </article>
        <article>
          <span>Orders</span>
          <strong>{orders.length}</strong>
          <small>
            {orders.filter((order) => order.status === "pending").length}{" "}
            awaiting confirmation.
          </small>
        </article>
        <article>
          <span>Average order</span>
          <strong>
            ₦
            {orders.length
              ? Math.round(revenue / orders.length).toLocaleString()
              : "0"}
          </strong>
          <small>Across logged orders.</small>
        </article>
        <article>
          <span>Product likes</span>
          <strong>
            {swipeEvents.filter((event) => event.direction === "like").length}
          </strong>
          <small>Signals from Discover.</small>
        </article>
      </section>
      <section className="analytics-grid">
        <article>
          <p>Revenue this week</p>
          <h2>Sales trend</h2>
          <Suspense
            fallback={
              <div className="analytics-chart-loading">
                Loading sales chart…
              </div>
            }
          >
            <AnalyticsCharts data={chartData} />
          </Suspense>
        </article>
        <article>
          <p>Discover engagement</p>
          <h2>Most liked pieces</h2>
          <div className="analytics-likes">
            {likes.map((item) => (
              <div key={item.name}>
                <span>{item.name}</span>
                <b>{item.likes} likes</b>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function PlaceholderPage({
  title,
  icon: Icon,
  description,
}: {
  title: string;
  icon: typeof ClipboardList;
  description: string;
}) {
  return (
    <div className="merchant-placeholder">
      <div>
        <Icon size={34} />
        <p>Coming next</p>
        <h1>{title}</h1>
        <span>{description}</span>
        <section>
          <b>Already in place</b>
          <ul>
            <li>Secure admin account</li>
            <li>Live catalogue control</li>
            <li>WhatsApp order flow</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
function BrandSettings({
  logo,
  setLogo,
  announcement,
  setAnnouncement,
}: {
  logo: string;
  setLogo: (next: string) => Promise<void>;
  announcement: string;
  setAnnouncement: (next: string) => void;
}) {
  const [notice, setNotice] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    if (supabase) {
      const path = `logos/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`;
      const { error } = await supabase.storage
        .from("brand-assets")
        .upload(path, file);
      if (error) {
        setNotice(error.message);
        return;
      }
      const { data } = supabase.storage.from("brand-assets").getPublicUrl(path);
      await setLogo(data.publicUrl);
    } else {
      const reader = new FileReader();
      reader.onload = () => setLogo(String(reader.result));
      reader.readAsDataURL(file);
    }
    setNotice("Brand logo updated.");
  };
  return (
    <>
      <div className="merchant-page-head">
        <div>
          <p>Store settings</p>
          <h1>Brand and customer experience</h1>
          <span>
            These details shape what customers see across the storefront.
          </span>
        </div>
      </div>
      <section className="settings-grid">
        <article>
          <p>Brand logo</p>
          <h2>Make the header yours</h2>
          <div className="logo-drop">
            {logo ? (
              <img src={logo} alt="Beryl RTW logo" />
            ) : (
              <Store size={34} />
            )}
            <label>
              <Upload size={15} /> Upload logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={(event) => upload(event.target.files?.[0])}
              />
            </label>
          </div>
        </article>
        <article>
          <p>Top announcement</p>
          <h2>Share a useful message</h2>
          <textarea
            value={announcement}
            onChange={(event) => setAnnouncement(event.target.value)}
            rows={4}
          />
          <button
            className="merchant-primary"
            onClick={() =>
              setNotice(
                "Announcement saved to this browser. Publish the page builder to make it live everywhere.",
              )
            }
          >
            Save message
          </button>
        </article>
        <article>
          <p>Admin access</p>
          <h2>Give your team safe access</h2>
          <span>
            Invite another admin securely through Supabase. Never give anyone
            the database password.
          </span>
          <a
            href="https://supabase.com/dashboard/project/sizrynbmhetayvyjivby/auth/users"
            target="_blank"
            rel="noreferrer"
          >
            Manage admin users <ArrowRight size={15} />
          </a>
        </article>
        <article>
          <p>Security</p>
          <h2>Change admin password</h2>
          <span>
            Choose a new password while you are signed in. Use at least 8
            characters.
          </span>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (!supabase) return;
              if (newPassword.length < 8) {
                setNotice("Use at least 8 characters for the new password.");
                return;
              }
              if (newPassword !== confirmPassword) {
                setNotice("The passwords do not match.");
                return;
              }
              setPasswordSaving(true);
              const { error } = await supabase.auth.updateUser({
                password: newPassword,
              });
              setPasswordSaving(false);
              if (error) {
                setNotice(error.message);
                return;
              }
              setNewPassword("");
              setConfirmPassword("");
              setNotice("Admin password changed successfully.");
            }}
          >
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              required
            />
            <input
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              required
            />
            <button className="merchant-primary" disabled={passwordSaving}>
              {passwordSaving ? "Saving..." : "Change password"}
            </button>
          </form>
        </article>
      </section>
      {notice && <div className="merchant-notice">{notice}</div>}
    </>
  );
}
function MerchantAdmin({
  products,
  setProducts,
  sections,
  setSections,
  aboutSections,
  setAboutSections,
  logo,
  setLogo,
  announcement,
  setAnnouncement,
  goStore,
}: {
  products: Product[];
  setProducts: (
    update: Product[] | ((current: Product[]) => Product[]),
  ) => void;
  sections: StoreSection[];
  setSections: (items: StoreSection[]) => void;
  aboutSections: StoreSection[];
  setAboutSections: (items: StoreSection[]) => void;
  logo: string;
  setLogo: (next: string) => Promise<void>;
  announcement: string;
  setAnnouncement: (next: string) => void;
  goStore: () => void;
}) {
  const [page, setPage] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [swipeEvents, setSwipeEvents] = useState<
    Array<{ product_id: number; direction: string; created_at: string }>
  >([]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getUser()
      .then(({ data }) => setSessionEmail(data.user?.email || "Beryl admin"));
  }, []);
  useEffect(() => {
    if (!supabase) return;
    void Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("swipe_events")
        .select("product_id,direction,created_at")
        .order("created_at", { ascending: false }),
    ]).then(([ordersResult, discountsResult, swipesResult]) => {
      if (ordersResult.data) setOrders(ordersResult.data as Order[]);
      if (discountsResult.data)
        setDiscounts(discountsResult.data as Discount[]);
      if (swipesResult.data)
        setSwipeEvents(
          swipesResult.data as Array<{
            product_id: number;
            direction: string;
            created_at: string;
          }>,
        );
    });
  }, []);
  const saveProduct = async (product: Product) => {
    setProducts((current) =>
      current.some((item) => item.id === product.id)
        ? current.map((item) => (item.id === product.id ? product : item))
        : [...current, product],
    );
    if (supabase) await supabase.from("products").upsert(product);
  };
  const archiveProduct = async (product: Product) => {
    const archived = { ...product, status: "archived" };
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? archived : item)),
    );
    if (supabase) {
      const { error } = await supabase.from("products").upsert(archived);
      if (error) throw error;
    }
  };
  const saveLayout = async () => {
    const cleanSections = stripAboutCarrier(sections);
    localStorage.setItem(
      "beryl-storefront-layout",
      JSON.stringify(cleanSections),
    );
    localStorage.setItem(
      "beryl-last-published-layout",
      JSON.stringify(cleanSections),
    );
    if (supabase) {
      const { data } = await supabase
        .from("storefront_layout")
        .select("sections")
        .eq("id", 1)
        .maybeSingle();
      const carrier = Array.isArray(data?.sections)
        ? (data.sections as StoreSection[]).find(
            (item) => item.id === aboutCarrierId,
          )
        : null;
      await supabase.from("storefront_layout").upsert({
        id: 1,
        sections: carrier ? [...cleanSections, carrier] : cleanSections,
        updated_at: new Date().toISOString(),
      });
    }
  };
  const saveAboutLayout = async () => {
    localStorage.setItem("beryl-about-layout", JSON.stringify(aboutSections));
    localStorage.setItem(
      "beryl-last-published-about-layout",
      JSON.stringify(aboutSections),
    );
    if (!supabase) return;
    const { error } = await supabase.from("storefront_layout").upsert({
      id: 1,
      about_sections: aboutSections,
      updated_at: new Date().toISOString(),
    });
    if (!error) return;
    const { data } = await supabase
      .from("storefront_layout")
      .select("sections")
      .eq("id", 1)
      .maybeSingle();
    const existing = Array.isArray(data?.sections) ? data.sections : sections;
    await supabase.from("storefront_layout").upsert({
      id: 1,
      sections: [
        ...stripAboutCarrier(existing as StoreSection[]),
        makeAboutCarrier(aboutSections),
      ],
      updated_at: new Date().toISOString(),
    });
  };
  const createOrder = async (order: Omit<Order, "id" | "created_at">) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("orders")
      .insert(order)
      .select()
      .single();
    if (error) throw error;
    if (data) setOrders((current) => [data as Order, ...current]);
  };
  const updateOrderStatus = async (order: Order, status: OrderStatus) => {
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id ? { ...item, status } : item,
      ),
    );
    if (supabase) {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", order.id);
      if (error) throw error;
    }
  };
  const createDiscount = async (discount: Omit<Discount, "id" | "uses">) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("discounts")
      .insert(discount)
      .select()
      .single();
    if (error) throw error;
    if (data) setDiscounts((current) => [data as Discount, ...current]);
  };
  const nav = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Products", icon: Package },
    { label: "Landing page", icon: Layers3 },
    { label: "About page", icon: Store },
    { label: "Orders", icon: ClipboardList },
    { label: "Customers", icon: Users },
    { label: "Marketing", icon: Megaphone },
    { label: "Analytics", icon: LayoutDashboard },
    { label: "Settings", icon: Settings2 },
  ];
  return (
    <div className={`merchant-admin ${collapsed ? "collapsed" : ""}`}>
      <aside className="merchant-sidebar">
        <div className="merchant-sidebar-brand">
          <a href="#admin">
            Beryl <b>RTW</b>
          </a>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Collapse menu"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <div className="merchant-store-chip">
          <span>
            <Store size={15} />
          </span>
          <div>
            <b>Beryl RTW</b>
            <small>Store is live</small>
          </div>
        </div>
        <nav>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={page === item.label ? "active" : ""}
                onClick={() => setPage(item.label)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="merchant-sidebar-foot">
          <button onClick={goStore}>
            <Eye size={17} />
            <span>View storefront</span>
          </button>
          <div>
            <span>{sessionEmail.slice(0, 1).toUpperCase()}</span>
            <p>
              <b>{sessionEmail || "Beryl admin"}</b>
              <small>Store administrator</small>
            </p>
          </div>
        </div>
      </aside>
      <main className="merchant-main">
        <header className="merchant-mobile-head">
          <button onClick={() => setCollapsed(!collapsed)}>
            <Menu size={21} />
          </button>
          <b>Beryl RTW</b>
          <button onClick={goStore}>
            <Eye size={18} />
          </button>
        </header>
        {page === "Dashboard" && (
          <Dashboard products={products} onNavigate={setPage} />
        )}
        {page === "Products" && (
          <ProductManager
            products={products}
            onSave={saveProduct}
            onArchive={archiveProduct}
          />
        )}
        {page === "Landing page" && (
          <>
            <div className="merchant-page-head builder-page-head">
              <div>
                <p>Visual editor</p>
                <h1>Design your landing page</h1>
                <span>
                  Arrange the homepage, edit the content and publish it
                  yourself.
                </span>
              </div>
            </div>
            <StorefrontBuilder
              sections={sections}
              onChange={setSections}
              onSave={saveLayout}
              pageLabel="Homepage"
              previewPath="/"
            />
          </>
        )}
        {page === "About page" && (
          <>
            <div className="merchant-page-head builder-page-head">
              <div>
                <p>Visual editor</p>
                <h1>Design your About page</h1>
                <span>
                  Tell your story, share your values and publish it yourself.
                </span>
              </div>
            </div>
            <StorefrontBuilder
              sections={aboutSections}
              onChange={setAboutSections}
              onSave={saveAboutLayout}
              pageLabel="About page"
              previewPath="/about"
            />
          </>
        )}
        {page === "Orders" && (
          <OrdersManager
            orders={orders}
            onCreate={createOrder}
            onStatus={updateOrderStatus}
          />
        )}
        {page === "Customers" && <CustomersManager orders={orders} />}
        {page === "Marketing" && (
          <MarketingManager
            discounts={discounts}
            onCreate={createDiscount}
            announcement={announcement}
            setAnnouncement={setAnnouncement}
          />
        )}
        {page === "Analytics" && (
          <AnalyticsDashboard
            orders={orders}
            products={products}
            swipeEvents={swipeEvents}
          />
        )}
        {page === "Settings" && (
          <BrandSettings
            logo={logo}
            setLogo={setLogo}
            announcement={announcement}
            setAnnouncement={setAnnouncement}
          />
        )}
      </main>
    </div>
  );
}
function AuthScreen({ goStore }: { goStore: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!supabase) return;
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) setError(authError.message);
    else window.location.reload();
  };
  return (
    <main className="merchant-auth">
      <button onClick={goStore}>
        <ChevronLeft size={17} /> Back to store
      </button>
      <form onSubmit={signIn}>
        <p>Beryl RTW merchant studio</p>
        <h1>Welcome back.</h1>
        <span>
          Sign in to manage the collection, homepage and customer experience.
        </span>
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <div className="merchant-auth-error">{error}</div>}
        <button>
          Sign in <ArrowRight size={17} />
        </button>
      </form>
    </main>
  );
}
function PasswordSetup() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    const { error: updateError } = await supabase!.auth.updateUser({
      password,
    });
    if (updateError) return setError(updateError.message);
    window.history.replaceState({}, "", "/admin");
    window.location.reload();
  };
  return (
    <main className="merchant-auth">
      <form onSubmit={save}>
        <p>Beryl RTW merchant studio</p>
        <h1>Set your password.</h1>
        <span>Create a private password for this admin account.</span>
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
            minLength={8}
          />
        </label>
        {error && <div className="merchant-auth-error">{error}</div>}
        <button>
          Continue to studio <ArrowRight size={17} />
        </button>
      </form>
    </main>
  );
}

export default function App() {
  const authType = new URLSearchParams(
    window.location.hash.replace(/^#/, ""),
  ).get("type");
  const [admin, setAdmin] = useState(
    () =>
      window.location.pathname.startsWith("/admin") ||
      ["invite", "recovery"].includes(authType || ""),
  );
  const [sessionReady, setSessionReady] = useState(!supabase);
  const [signedIn, setSignedIn] = useState(false);
  const [catalogue, setCatalogue] = useState<Product[]>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("beryl-catalogue") || "") ||
        starterProducts
      );
    } catch {
      return starterProducts;
    }
  });
  const [sections, setSections] = useState<StoreSection[]>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("beryl-storefront-layout") || "") ||
        defaultSections
      );
    } catch {
      return defaultSections;
    }
  });
  const [aboutSections, setAboutSections] = useState<StoreSection[]>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("beryl-about-layout") || "") ||
        defaultAboutSections
      );
    } catch {
      return defaultAboutSections;
    }
  });
  const [logo, setLogoState] = useState(
    () => localStorage.getItem("beryl-logo") || "",
  );
  const [announcement, setAnnouncement] = useState(
    () =>
      localStorage.getItem("beryl-announcement") ||
      "Free Lagos delivery on orders over ₦150,000 · Worldwide shipping available",
  );
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
      setSessionReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSignedIn(Boolean(session)),
    );
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data?.length) {
          const remoteProducts = data as Product[];
          const starterIds = new Set(
            starterProducts.map((product) => product.id),
          );
          const mergedCatalogue = [
            ...starterProducts.map(
              (product) =>
                remoteProducts.find((remote) => remote.id === product.id) ||
                product,
            ),
            ...remoteProducts.filter((product) => !starterIds.has(product.id)),
          ];
          setCatalogue(mergedCatalogue);
          localStorage.setItem(
            "beryl-catalogue",
            JSON.stringify(mergedCatalogue),
          );
        }
      });
    supabase
      .from("brand_settings")
      .select("logo_url,announcement")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.logo_url) {
          setLogoState(data.logo_url);
          localStorage.setItem("beryl-logo", data.logo_url);
        }
        if (data?.announcement) {
          setAnnouncement(data.announcement);
          localStorage.setItem("beryl-announcement", data.announcement);
        }
      });
    supabase
      .from("storefront_layout")
      .select("sections,about_sections")
      .eq("id", 1)
      .maybeSingle()
      .then(async ({ data, error }) => {
        let row = data as {
          sections?: StoreSection[];
          about_sections?: StoreSection[];
        } | null;
        if (error) {
          const fallback = await supabase
            .from("storefront_layout")
            .select("sections")
            .eq("id", 1)
            .maybeSingle();
          row = fallback.data as { sections?: StoreSection[] } | null;
        }
        const remoteSections = Array.isArray(row?.sections) ? row.sections : [];
        const cleanSections = stripAboutCarrier(remoteSections);
        const carrierAbout = decodeAboutCarrier(remoteSections);
        if (cleanSections.length) {
          setSections(cleanSections);
          localStorage.setItem(
            "beryl-storefront-layout",
            JSON.stringify(cleanSections),
          );
        }
        const remoteAbout = Array.isArray(row?.about_sections)
          ? row.about_sections
          : carrierAbout;
        if (remoteAbout?.length) {
          setAboutSections(remoteAbout);
          localStorage.setItem(
            "beryl-about-layout",
            JSON.stringify(remoteAbout),
          );
        }
      });
  }, []);
  const setProducts = (
    update: Product[] | ((current: Product[]) => Product[]),
  ) =>
    setCatalogue((current) => {
      const next = typeof update === "function" ? update(current) : update;
      localStorage.setItem("beryl-catalogue", JSON.stringify(next));
      return next;
    });
  const updateLogo = async (next: string) => {
    setLogoState(next);
    if (next) localStorage.setItem("beryl-logo", next);
    else localStorage.removeItem("beryl-logo");
    if (supabase && next)
      await supabase.from("brand_settings").upsert({
        id: 1,
        logo_url: next,
        updated_at: new Date().toISOString(),
      });
  };
  const updateSections = (items: StoreSection[]) => {
    const cleanItems = stripAboutCarrier(items);
    setSections(cleanItems);
    localStorage.setItem("beryl-storefront-layout", JSON.stringify(cleanItems));
  };
  const updateAboutSections = (items: StoreSection[]) => {
    setAboutSections(items);
    localStorage.setItem("beryl-about-layout", JSON.stringify(items));
  };
  const updateAnnouncement = async (value: string) => {
    setAnnouncement(value);
    localStorage.setItem("beryl-announcement", value);
    if (supabase) {
      await supabase.from("brand_settings").upsert({
        id: 1,
        announcement: value,
        updated_at: new Date().toISOString(),
      });
    }
  };
  const goStore = () => {
    window.history.pushState({}, "", "/");
    setAdmin(false);
  };
  if (["invite", "recovery"].includes(authType || "")) return <PasswordSetup />;
  if (!admin)
    return (
      <Storefront
        products={catalogue}
        sections={sections}
        aboutSections={aboutSections}
        logo={logo}
        announcement={announcement}
      />
    );
  if (!sessionReady)
    return <main className="merchant-loading">Opening merchant studio…</main>;
  if (!signedIn) return <AuthScreen goStore={goStore} />;
  return (
    <MerchantAdmin
      products={catalogue}
      setProducts={setProducts}
      sections={sections}
      setSections={updateSections}
      aboutSections={aboutSections}
      setAboutSections={updateAboutSections}
      logo={logo}
      setLogo={updateLogo}
      announcement={announcement}
      setAnnouncement={updateAnnouncement}
      goStore={goStore}
    />
  );
}
