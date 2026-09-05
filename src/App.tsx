import { useEffect, useMemo, useState } from "react";
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
  Upload,
  Users,
  X,
} from "lucide-react";
import { supabase } from "./supabase";

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
type SectionKind =
  "hero" | "categories" | "products" | "promo" | "story" | "newsletter";
type StoreSection = {
  id: string;
  type: SectionKind;
  title: string;
  eyebrow: string;
  description: string;
  cta: string;
  visible: boolean;
  theme?: string;
};

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
};
const getSection = (items: StoreSection[], type: SectionKind) =>
  items.find((item) => item.type === type && item.visible);
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
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) {
  return (
    <article className="market-product-card">
      <div className="market-product-image">
        <img src={product.image} alt={product.name} />
        <span>{product.tag}</span>
        <button
          onClick={() => onAdd(product)}
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

function Storefront({
  products,
  sections,
  logo,
}: {
  products: Product[];
  sections: StoreSection[];
  logo: string;
}) {
  const [cart, setCart] = useState<Product[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const hero = getSection(sections, "hero") || defaultSections[0];
  const categories = getSection(sections, "categories");
  const productSection = getSection(sections, "products");
  const promo = getSection(sections, "promo");
  const story = getSection(sections, "story");
  const newsletter = getSection(sections, "newsletter");
  const types = ["All", "Dresses", "Sets", "Tops", "Skirts"];
  const visibleProducts = useMemo(
    () =>
      filter === "All"
        ? products
        : products.filter((product) => product.type === filter),
    [filter, products],
  );
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
  const cartTotal = cart.reduce(
    (sum, product) => sum + priceNumber(product.price),
    0,
  );
  return (
    <div className="market-storefront">
      {notice && (
        <div className="market-toast" role="status">
          {notice}
        </div>
      )}
      <div className="market-utility">
        <span>New customers get first access to the next drop</span>
        <span>Delivery across Nigeria · Worldwide shipping</span>
      </div>
      <header className="market-header">
        <button
          className="market-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <a className="market-brand" href="#top">
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
          />
          <button>Search</button>
        </div>
        <div className="market-actions">
          <IconButton label="Account">
            <Users size={20} />
          </IconButton>
          <IconButton label="Saved pieces">
            <Heart size={20} />
          </IconButton>
          <button className="market-cart" onClick={() => setBagOpen(true)}>
            <ShoppingBag size={19} /> Bag <b>{cart.length}</b>
          </button>
        </div>
      </header>
      <nav className={menuOpen ? "market-nav open" : "market-nav"}>
        <button onClick={() => jump("shop")}>Shop all</button>
        <button
          onClick={() => {
            setFilter("Dresses");
            jump("shop");
          }}
        >
          Dresses
        </button>
        <button
          onClick={() => {
            setFilter("Sets");
            jump("shop");
          }}
        >
          Two-piece sets
        </button>
        <button
          onClick={() => {
            setFilter("Tops");
            jump("shop");
          }}
        >
          Tops
        </button>
        <button onClick={() => jump("story")}>Our story</button>
        <button className="market-nav-sale" onClick={() => jump("shop")}>
          New drop
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
                    jump("shop");
                  }}
                >
                  Start shopping
                </button>
              </div>
            )}
          </aside>
        </>
      )}
      <main id="top">
        <section className="market-hero">
          <div className="market-hero-copy">
            <p>{hero.eyebrow}</p>
            <h1>{hero.title}</h1>
            <span>{hero.description}</span>
            <button onClick={() => jump("shop")}>
              {hero.cta} <ArrowRight size={18} />
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
            <img
              src="https://i.pinimg.com/originals/ae/31/d3/ae31d32476ad40160b2961bc0bd85b48.jpg"
              alt="Beryl RTW Ankara set"
            />
            <div className="market-hero-sticker">
              New
              <br />
              <em>drop</em>
            </div>
          </div>
        </section>
        {categories && (
          <section className="market-categories">
            <div className="market-section-title">
              <div>
                <p>{categories.eyebrow}</p>
                <h2>{categories.title}</h2>
              </div>
              <button
                onClick={() => {
                  setFilter("All");
                  jump("shop");
                }}
              >
                {categories.cta} <ArrowRight size={16} />
              </button>
            </div>
            <div className="market-category-row">
              {types.slice(1).map((type, index) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilter(type);
                    jump("shop");
                  }}
                >
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
                  <small>
                    Shop now <ArrowRight size={13} />
                  </small>
                </button>
              ))}
            </div>
          </section>
        )}
        {productSection && (
          <section className="market-shop" id="shop">
            <div className="market-section-title">
              <div>
                <p>{productSection.eyebrow}</p>
                <h2>{productSection.title}</h2>
                <span>{productSection.description}</span>
              </div>
              <div className="market-controls">
                <button>
                  <SlidersHorizontal size={15} /> Filter
                </button>
                <button>
                  <ChevronDown size={15} /> Sort
                </button>
              </div>
            </div>
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
                <ProductCard key={product.id} product={product} onAdd={add} />
              ))}
            </div>
          </section>
        )}
        {promo && (
          <section className="market-promo">
            <div className="market-promo-image">
              <img
                src="https://www.maeotti.com/cdn/shop/files/3W1A1099-Edit__2_1080x.jpg?v=1776802139"
                alt="Beryl RTW campaign"
              />
            </div>
            <div>
              <p>{promo.eyebrow}</p>
              <h2>{promo.title}</h2>
              <span>{promo.description}</span>
              <button onClick={() => jump("shop")}>
                {promo.cta} <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}
        {story && (
          <section className="market-story" id="story">
            <span>01</span>
            <div>
              <p>{story.eyebrow}</p>
              <h2>{story.title}</h2>
            </div>
            <p>{story.description}</p>
            <button onClick={() => jump("shop")}>
              {story.cta} <ArrowRight size={17} />
            </button>
          </section>
        )}
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
              <button>
                {newsletter.cta} <ArrowRight size={17} />
              </button>
            </form>
          </section>
        )}
      </main>
      <footer className="market-footer">
        <a className="market-brand" href="#top">
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
        <div>
          <button onClick={() => jump("shop")}>Shop</button>
          <button onClick={() => jump("story")}>About</button>
          <a href="/admin">Merchant studio</a>
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
}: {
  sections: StoreSection[];
  onChange: (items: StoreSection[]) => void;
  onSave: () => Promise<void>;
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
  const updateSection = (patch: Partial<StoreSection>) =>
    onChange(
      sections.map((section) =>
        section.id === selected.id ? { ...section, ...patch } : section,
      ),
    );
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
    };
    onChange([...sections, section]);
    setSelectedId(id);
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
          Drag sections to rearrange the homepage. Click one to change its
          words, visibility and style.
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
            {(Object.keys(sectionMeta) as SectionKind[])
              .filter(
                (type) => !sections.some((section) => section.type === type),
              )
              .map((type) => {
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
            <span className="builder-online" /> Homepage ·{" "}
            {sections.filter((section) => section.visible).length} blocks live
          </div>
          <div>
            <button>
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
              >
                {section.type === "hero" && (
                  <>
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
            {!["story", "newsletter"].includes(selected.type) && (
              <label>
                Button label
                <input
                  value={selected.cta}
                  onChange={(event) =>
                    updateSection({ cta: event.target.value })
                  }
                />
              </label>
            )}
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
}: {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
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
        <button className="editor-save" disabled={saving}>
          {saving ? "Saving…" : "Save product"} <ArrowRight size={17} />
        </button>
      </form>
    </div>
  );
}

function ProductManager({
  products,
  onSave,
}: {
  products: Product[];
  onSave: (product: Product) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All products");
  const [editing, setEditing] = useState<Product | null>(null);
  const filtered = products.filter(
    (product) =>
      (filter === "All products" || product.type === filter) &&
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
          {["All products", "Dresses", "Sets", "Tops", "Skirts"].map((item) => (
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
              <img src={product.image} alt={product.name} />
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
          onClick={() => onNavigate("Storefront")}
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
            <button onClick={() => onNavigate("Storefront")}>
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
  logo: string;
  setLogo: (next: string) => Promise<void>;
  announcement: string;
  setAnnouncement: (next: string) => void;
  goStore: () => void;
}) {
  const [page, setPage] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");
  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getUser()
      .then(({ data }) => setSessionEmail(data.user?.email || "Beryl admin"));
  }, []);
  const saveProduct = async (product: Product) => {
    setProducts((current) =>
      current.some((item) => item.id === product.id)
        ? current.map((item) => (item.id === product.id ? product : item))
        : [...current, product],
    );
    if (supabase) await supabase.from("products").upsert(product);
  };
  const saveLayout = async () => {
    localStorage.setItem("beryl-storefront-layout", JSON.stringify(sections));
    if (supabase)
      await supabase
        .from("storefront_layout")
        .upsert({ id: 1, sections, updated_at: new Date().toISOString() });
  };
  const nav = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Products", icon: Package },
    { label: "Storefront", icon: Layers3 },
    { label: "Orders", icon: ClipboardList },
    { label: "Customers", icon: Users },
    { label: "Marketing", icon: Megaphone },
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
          <ProductManager products={products} onSave={saveProduct} />
        )}
        {page === "Storefront" && (
          <>
            <div className="merchant-page-head builder-page-head">
              <div>
                <p>Visual editor</p>
                <h1>Design your storefront</h1>
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
            />
          </>
        )}
        {page === "Orders" && (
          <PlaceholderPage
            title="Orders centre"
            icon={ClipboardList}
            description="Your customer orders will land here once OPay checkout and its payment webhooks are connected."
          />
        )}
        {page === "Customers" && (
          <PlaceholderPage
            title="Customer list"
            icon={Users}
            description="This will become your customer directory when checkout collects customer details."
          />
        )}
        {page === "Marketing" && (
          <PlaceholderPage
            title="Marketing studio"
            icon={Megaphone}
            description="Build campaign emails, discounts and launch messages from one friendly workspace."
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
      .select("logo_url")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.logo_url) {
          setLogoState(data.logo_url);
          localStorage.setItem("beryl-logo", data.logo_url);
        }
      });
    supabase
      .from("storefront_layout")
      .select("sections")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.sections?.length) {
          setSections(data.sections as StoreSection[]);
          localStorage.setItem(
            "beryl-storefront-layout",
            JSON.stringify(data.sections),
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
    setSections(items);
    localStorage.setItem("beryl-storefront-layout", JSON.stringify(items));
  };
  const updateAnnouncement = (value: string) => {
    setAnnouncement(value);
    localStorage.setItem("beryl-announcement", value);
  };
  const goStore = () => {
    window.history.pushState({}, "", "/");
    setAdmin(false);
  };
  if (["invite", "recovery"].includes(authType || "")) return <PasswordSetup />;
  if (!admin)
    return <Storefront products={catalogue} sections={sections} logo={logo} />;
  if (!sessionReady)
    return <main className="merchant-loading">Opening merchant studio…</main>;
  if (!signedIn) return <AuthScreen goStore={goStore} />;
  return (
    <MerchantAdmin
      products={catalogue}
      setProducts={setProducts}
      sections={sections}
      setSections={updateSections}
      logo={logo}
      setLogo={updateLogo}
      announcement={announcement}
      setAnnouncement={updateAnnouncement}
      goStore={goStore}
    />
  );
}
