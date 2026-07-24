# Rose Archer — After Dark (Shopify theme)

An Online Store 2.0 theme port of the Rose Archer storefront. It carries the
same "After Dark" design (the CSS is shared with the static site) and renders
real Shopify data — products, variants, collections, cart, search.

The static site at the repo root remains the design reference; this folder is
the uploadable theme.

## Uploading it

You need the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) and a
store (a free development store works).

```bash
cd shopify-theme
shopify theme dev        # live preview against your store
shopify theme check      # lint (recommended before push)
shopify theme push       # upload as a new unpublished theme
```

Or zip the **contents** of `shopify-theme/` (so `layout/`, `templates/`, etc.
are at the zip root) and upload via **Online Store → Themes → Add theme →
Upload zip**.

## Structure

```
shopify-theme/
├── layout/
│   ├── theme.liquid        Main wrapper — injects the palette from settings,
│   │                       loads fonts + theme.css, renders section groups,
│   │                       the cart drawer and global.js
│   └── password.liquid     Coming-soon / password page layout
├── templates/              JSON templates (OS 2.0) + Liquid where required
│   ├── index.json          Homepage — orders the home sections
│   ├── product.json        → main-product + complete-the-look
│   ├── collection.json     → main-collection (native filters + sort)
│   ├── cart.json, page.json, search.json, blog.json, article.json,
│   ├── list-collections.json, 404.json
│   ├── gift_card.liquid, password.liquid
│   └── customers/          login, register, account, order, addresses,
│                           reset_password, activate_account
├── sections/
│   ├── header-group.json / footer-group.json   Layout section groups
│   ├── announcement-bar, header, footer
│   ├── hero, founding-edit, category-panels, signature-strip, reviews,
│   │   brand-story, newsletter                 Homepage sections
│   ├── main-product, main-collection, main-cart, complete-the-look
│   └── main-page/-search/-404/-blog/-article/-list-collections
├── snippets/
│   ├── product-card.liquid       Reusable card (image → illustration → tint)
│   ├── garment-illustrations.liquid   SVG placeholder sprite
│   ├── cart-drawer.liquid        Slide-out bag
│   └── price.liquid
├── config/
│   ├── settings_schema.json      Theme settings (palette, cart)
│   └── settings_data.json        Defaults + "After Dark" preset
├── locales/
│   └── en.default.json
└── assets/
    ├── theme.css                 Shared with the static site + theme extras
    └── global.js                 Menu, bag (Cart AJAX), variants, accordions,
                                  reveals, showcase, facet auto-submit
```

## What the design expects from your products

The card and product templates use real Shopify data, and read a few optional
**metafields** (namespace `custom`) to reproduce the reference content. All
have fallbacks, so the theme works without them:

| Metafield | Type | Used for |
|---|---|---|
| `custom.subtitle` | single line text | Card + product eyebrow (e.g. "Oxblood satin · cowl neck") |
| `custom.illustration` | single line text (`vesper`/`chapel`/`encore`/`aria`) | Placeholder line-art when a product has no image |
| `custom.card_tone` | single line text (`media--blush`/`media--blush-soft`/`media--parchment`) | Card background tint |
| `custom.flag` | single line text | Corner flag (e.g. "The signature") |
| `custom.size_chart` | rich text | Garment measurements table in Size & fit |
| `custom.fit_intro` | single line text | Fit note above the table |
| `custom.model_note` | single line text | "Olivia is 5′7″ and wears a UK 8" |
| `custom.fabric_care` | rich text | Fabric & care accordion |

Product **options** should be named **Colour** and **Size** — the product
template renders a "Colour" option as swatches (using Shopify's native colour
swatch if set) and any "Size" option as pills. Enable **Size / Colour / Price**
filters in *Admin → Products → Filters* to power the collection toolbar.

## Colours & fonts

The palette lives in **Theme editor → Theme settings → Colours** and is injected
into `:root` in `layout/theme.liquid`; `assets/theme.css` consumes those
variables, so a colour change reflows the whole theme. Fonts (Fraunces + Outfit)
load from Google Fonts in `theme.liquid` — swap the `<link>` and the two
`--font` variables to change them.

## Notes & limitations

- The bag drawer uses the **Cart AJAX API**; add-to-cart also works without JS
  via the underlying `<form>` (progressive enhancement).
- "Complete the look" falls back to same-collection products; wire it to
  Shopify's product-recommendations endpoint for smarter results if wanted.
- This theme has not been run through `shopify theme check` in this environment
  (no CLI/store available here) — run it once against your store before
  publishing. Structure, JSON, schema blocks and all internal references have
  been validated.
