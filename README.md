# Rose Archer — storefront

*Dressed for the nights that count.*

A production-ready static storefront for Rose Archer: occasion dresses and
going-out tops in small limited drops, UK sizes 6–16. Built as plain
HTML/CSS/JS with no framework and no build step, so it can be hosted anywhere
(Netlify, GitHub Pages, S3, a plain folder on any server) and later ported
section-by-section into a Shopify theme.

## Running it

There is nothing to install. Open `index.html` in a browser, or serve the
folder for correct routing of relative links:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## File structure

```
├── index.html        Homepage — editorial collage hero, founding edit
│                     (numbered index with hover-swap preview on desktop,
│                     card grid below 960px), categories, signature strip,
│                     reviews, story, email capture
├── collection.html   Collection template — filter bar (size / colour / price),
│                     sort dropdown, responsive grid.
│                     Accepts ?cat=dresses or ?cat=tops to pre-filter.
├── product.html      Product detail template — gallery, selectors, accordions,
│                     trust line, "Complete the look".
│                     Accepts ?p=vesper | chapel | encore | aria; the static
│                     markup is the Vesper, as a no-JS fallback.
├── css/
│   └── styles.css    Single stylesheet, organised into numbered, commented
│                     sections. All colours come from custom properties.
├── js/
│   └── main.js       All interactions, vanilla JS: mobile menu, bag drawer,
│                     quick add, gallery, selectors, accordions, filters,
│                     sorting, newsletter. Product data lives at the top in
│                     the PRODUCTS object.
└── README.md
```

The bag is deliberately **in-memory only** (no `localStorage`): it resets on
page load. When this is ported to Shopify, the bag drawer wires to the Cart
AJAX API instead.

## Swapping the SVG placeholders for real photography

Every product image is an inline SVG line illustration standing in for a
photograph. Each one lives inside a `<figure class="product-media">`, and the
figure — not the artwork — carries the background tone
(`media--blush`, `media--blush-soft`, `media--bone`).

To use a real photo, replace the `<svg>…</svg>` element inside the figure with
an `<img>` and delete nothing else:

```html
<!-- before -->
<figure class="product-media media--blush">
  <svg viewBox="0 0 360 480" role="img" aria-label="Line illustration of the Vesper dress …">
    <use href="#illo-vesper"/>
  </svg>
</figure>

<!-- after -->
<figure class="product-media media--blush">
  <img src="images/vesper-front.jpg" alt="The Vesper dress in oxblood satin, front view" loading="lazy">
</figure>
```

The CSS already styles `.product-media > img` identically to the SVG
(3:4 crop, `object-fit: cover`, hover scale), so photos drop straight in.
Shoot or crop to a 3:4 portrait ratio for best results.

Two further places to update once all photography exists:

1. **The sprite** — each page opens with an `<svg style="display:none">` block
   of `<symbol>` definitions. Once no `<use>` references remain on a page,
   delete that page's sprite block.
2. **JS-rendered images** — the product gallery, "Complete the look" and bag
   drawer thumbnails are rendered by `js/main.js` from the `views` array in
   the `PRODUCTS` object. Swap each view's `symbol` reference for an image
   path and change `mediaSVG()` / `bagLineEl()` to emit `<img>` tags (both
   are small, single-purpose functions marked in the file).

## Changing colours & fonts

The whole palette is defined once, at the top of `css/styles.css`:

```css
:root {
  --bone:            #F6F2EA;  /* main background */
  --bone-light:      #FBF8F2;  /* cards & panels */
  --espresso:        #2B211B;  /* text & logo */
  --oxblood:         #5E2129;  /* signature accent */
  --oxblood-pressed: #471820;  /* hover states */
  --rose:            #C9909A;  /* eyebrows — large/decorative text only */
  --blush:           #EBD8D4;  /* gradient panels */
  --blush-soft:      #F2E6E2;  /* gradient panels, softer stop */
  --smoke:           #8D8680;  /* dividers & large secondary text only */
}
```

Change a value there and it changes everywhere — buttons, links, focus rings,
gradients, the bag drawer, the lot. Two contrast notes, also commented in the
CSS: `--rose` and `--smoke` do **not** meet WCAG AA against bone at body-text
sizes, so keep them to large or decorative type.

Fonts are declared alongside the palette:

```css
--font-display: "Cormorant Garamond", "Times New Roman", serif;
--font-body:    "Jost", "Century Gothic", sans-serif;
```

To change typefaces, update the Google Fonts `<link>` in the `<head>` of each
of the three pages and then edit these two properties. Letterspacing for the
wordmark and UI (`--track-logo`, `--track-ui`) sits next to them.

## Accessibility notes

- Semantic landmarks, one `h1` per page, ordered headings.
- Alt text on every meaningful image; decorative artwork is `aria-hidden`.
- Focus states are visible everywhere, in oxblood (bone on dark surfaces).
- The mobile menu and bag drawer trap focus, close on `Esc`, and return focus
  to their trigger.
- `prefers-reduced-motion` removes all movement, keeping state changes.
  The scroll-reveal fades are only armed when the user has *not* asked for
  reduced motion (and IntersectionObserver exists); otherwise content is
  simply visible.
- Breakpoints at 520px, 760px and 960px, mobile-first.

## Design notes

The homepage uses three editorial patterns adapted from 21st.dev references,
rebuilt in vanilla HTML/CSS to stay on-palette and dependency-free:

- **Collage hero** — a main framed panel with a smaller overlapping detail
  frame over a soft blush wash, plus a vertical drop caption.
- **Quiet-luxury index** (`.edit-showcase`, ≥960px) — the founding edit as a
  numbered list; hovering or focusing a row cross-fades the featured panel.
  Below 960px the standard card grid shows instead.
- **Editorial finishing** — index numbers on product cards, a hairline
  ornament under centred section heads, and an invitation-style hairline
  border inside the oxblood signature strip.

## Porting to Shopify later

- Each commented section of the pages maps to a Shopify **section**; the
  product cards map to a snippet.
- `PRODUCTS` in `js/main.js` is the shape of the data Liquid will supply
  (`product.title`, `product.price`, `product.options`, metafields for the
  measurements table).
- The bag drawer's `addToBag / renderBag` functions are the seam where the
  Cart AJAX API replaces the in-memory array.
