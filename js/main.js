/* ==========================================================================
   ROSE ARCHER — main.js
   All interactions, vanilla JS only:
     · mobile menu
     · bag drawer (in-memory state — resets on page load by design)
     · quick add on product cards
     · product page: gallery, colour/size selectors, accordions, add to bag
     · collection page: filtering & sorting
     · newsletter form
   ========================================================================== */

(function () {
  'use strict';

  var qs = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var qsa = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var FREE_SHIPPING_THRESHOLD = 50;

  /* ------------------------------------------------------------------------
     Product data
     Sizes are UK. Measurements are garment measurements in cm.
     ---------------------------------------------------------------------- */

  var PRODUCTS = {
    vesper: {
      id: 'vesper',
      name: 'The Vesper Dress',
      price: 64,
      category: 'dresses',
      meta: 'Oxblood satin · cowl neck · midi',
      tone: 'media--blush',
      colours: [
        { name: 'Oxblood', hex: '#5E2129' },
        { name: 'Espresso', hex: '#2B211B' }
      ],
      sizes: [6, 8, 10, 12, 14, 16],
      views: [
        { symbol: 'illo-vesper', label: 'Line illustration of the Vesper dress — a cowl-neck satin slip midi with thin straps, front view' },
        { symbol: 'illo-vesper-back', label: 'Line illustration of the Vesper dress, back view with a low draped back' },
        { symbol: 'illo-vesper-detail', label: 'Line illustration detail of the Vesper dress cowl neckline drape' }
      ],
      description: [
        'The dress the first drop was built around. Cut in a heavyweight satin with a soft, liquid fall, the Vesper drapes into a cowl at the neckline and skims — never clings — to a midi hem.',
        'Bias construction means it moves with you from dinner to the dance floor, and the double-lined bodice keeps everything exactly where you left it.'
      ],
      fit: {
        intro: 'True to size with a bias-cut skim. Between sizes, take the smaller for a closer fit through the hip.',
        model: 'Olivia is 5′7″ (170 cm) and wears a UK 8.',
        columns: ['Bust', 'Waist', 'Hip', 'Length'],
        rows: {
          6:  [82, 64, 90, 118],
          8:  [87, 69, 95, 119],
          10: [92, 74, 100, 120],
          12: [97, 79, 105, 121],
          14: [103, 85, 111, 122],
          16: [109, 91, 117, 123]
        }
      },
      fabric: [
        '96% polyester satin, 4% elastane. Fully lined bodice.',
        'A dense, matte-backed satin chosen for weight — it hangs, it doesn’t flutter. Cool hand wash or gentle machine cycle at 30°, inside out in a wash bag. Cool iron on reverse. Do not tumble dry.'
      ],
      related: ['chapel', 'encore', 'aria']
    },

    chapel: {
      id: 'chapel',
      name: 'The Chapel Dress',
      price: 68,
      category: 'dresses',
      meta: 'Bone satin · bias cut · column',
      tone: 'media--blush-soft',
      colours: [
        { name: 'Bone', hex: '#F6F2EA' }
      ],
      sizes: [6, 8, 10, 12, 14, 16],
      views: [
        { symbol: 'illo-chapel', label: 'Line illustration of the Chapel dress — a bias-cut satin column with a straight neckline, front view' },
        { symbol: 'illo-chapel-back', label: 'Line illustration of the Chapel dress, back view with a low open back' },
        { symbol: 'illo-chapel-detail', label: 'Line illustration detail of the Chapel dress bias seams and side slit' }
      ],
      description: [
        'A column of bone satin, cut on the bias so it pours rather than hangs. The neckline is dead straight, the back drops low, and a quiet slit at the side keeps the length walkable.',
        'This is the one for the occasions that ask a little more of you — the wedding, the anniversary, the dinner that matters.'
      ],
      fit: {
        intro: 'True to size. The bias cut gives natural give through the waist and hip; the column line is intentionally close.',
        model: 'Olivia is 5′7″ (170 cm) and wears a UK 8.',
        columns: ['Bust', 'Waist', 'Hip', 'Length'],
        rows: {
          6:  [82, 64, 90, 128],
          8:  [87, 69, 95, 129],
          10: [92, 74, 100, 130],
          12: [97, 79, 105, 131],
          14: [103, 85, 111, 132],
          16: [109, 91, 117, 133]
        }
      },
      fabric: [
        '96% polyester satin, 4% elastane. Half lined.',
        'Cool hand wash or gentle machine cycle at 30°, inside out in a wash bag. Cool iron on reverse. Do not tumble dry. Bone satin marks easily — keep it away from red wine until at least the second hour.'
      ],
      related: ['vesper', 'aria', 'encore']
    },

    encore: {
      id: 'encore',
      name: 'The Encore Top',
      price: 36,
      category: 'tops',
      meta: 'Espresso velvet · halter',
      tone: 'media--blush',
      colours: [
        { name: 'Espresso', hex: '#2B211B' }
      ],
      sizes: [6, 8, 10, 12, 14, 16],
      views: [
        { symbol: 'illo-encore', label: 'Line illustration of the Encore top — a velvet halterneck with a self-tie, front view' },
        { symbol: 'illo-encore-back', label: 'Line illustration of the Encore top, back view showing the open back and tie' },
        { symbol: 'illo-encore-detail', label: 'Line illustration detail of the Encore top halter tie at the nape' }
      ],
      description: [
        'A halterneck in crushed espresso velvet, tied at the nape and open at the back. The front is cut high enough for dinner with his parents, the back low enough for everything after.',
        'Wear it with tailored trousers now, and with everything else once you own it.'
      ],
      fit: {
        intro: 'True to size, with adjustment in the tie. The band sits at the natural waist.',
        model: 'Olivia is 5′7″ (170 cm) and wears a UK 8.',
        columns: ['Bust', 'Waist band', 'Length'],
        rows: {
          6:  [80, 62, 39],
          8:  [85, 67, 40],
          10: [90, 72, 41],
          12: [95, 77, 42],
          14: [101, 83, 43],
          16: [107, 89, 44]
        }
      },
      fabric: [
        '92% polyester velvet, 8% elastane.',
        'Cool hand wash only. Do not wring. Reshape and dry flat; steam — never iron — velvet. Do not tumble dry.'
      ],
      related: ['aria', 'vesper', 'chapel']
    },

    aria: {
      id: 'aria',
      name: 'The Aria Top',
      price: 38,
      category: 'tops',
      meta: 'Blush satin · corset · boned',
      tone: 'media--blush-soft',
      colours: [
        { name: 'Blush', hex: '#EBD8D4' }
      ],
      sizes: [6, 8, 10, 12, 14, 16],
      views: [
        { symbol: 'illo-aria', label: 'Line illustration of the Aria top — a boned satin corset with a sweetheart neckline, front view' },
        { symbol: 'illo-aria-back', label: 'Line illustration of the Aria top, back view showing the lace-up fastening' },
        { symbol: 'illo-aria-detail', label: 'Line illustration detail of the Aria top boning channels' }
      ],
      description: [
        'A proper corset, not a printed one. Eight boning channels shape the Aria from sweetheart neckline to dipped hem, and the lace-up back means it fits the body you have, not the body of the fit model.',
        'Blush satin, structured through the seams, soft against the skin.'
      ],
      fit: {
        intro: 'Runs snug by design — this is a structured piece. Size up if you prefer ease through the ribcage; the lacing gives up to 4 cm either way.',
        model: 'Olivia is 5′7″ (170 cm) and wears a UK 8.',
        columns: ['Bust', 'Waist', 'Length'],
        rows: {
          6:  [78, 61, 37],
          8:  [83, 66, 38],
          10: [88, 71, 39],
          12: [93, 76, 40],
          14: [99, 82, 41],
          16: [105, 88, 42]
        }
      },
      fabric: [
        'Shell: 97% polyester satin, 3% elastane. Boning: flexible polyester. Lining: 100% cotton against the skin.',
        'Spot clean where possible; otherwise cool hand wash, laces removed. Dry flat. Do not tumble dry, do not iron over the boning channels.'
      ],
      related: ['encore', 'vesper', 'chapel']
    }
  };

  var formatPrice = function (n) { return '£' + n; };

  /* ------------------------------------------------------------------------
     Panels: one scrim, shared open/close logic for menu + bag drawer
     ---------------------------------------------------------------------- */

  var scrim = qs('[data-scrim]');
  var openPanel = null;
  var lastFocused = null;

  function open(panel) {
    if (openPanel) close(true);
    openPanel = panel;
    lastFocused = document.activeElement;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (scrim) scrim.classList.add('is-visible');
    document.body.classList.add('is-locked');
    var focusable = qs('button, a, input', panel);
    if (focusable) focusable.focus();
  }

  function close(keepScrim) {
    if (!openPanel) return;
    openPanel.classList.remove('is-open');
    openPanel.setAttribute('aria-hidden', 'true');
    // If the closing panel was the mobile menu, sync the hamburger state
    if (openPanel.id === 'mobile-menu' && menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
    }
    openPanel = null;
    if (!keepScrim) {
      if (scrim) scrim.classList.remove('is-visible');
      document.body.classList.remove('is-locked');
      if (lastFocused) lastFocused.focus();
    }
  }

  if (scrim) scrim.addEventListener('click', function () { close(); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    // Keep tabbing inside an open panel
    if (e.key === 'Tab' && openPanel) {
      var items = qsa('button, a[href], input, select', openPanel).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ------------------------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------------------- */

  var mobileMenu = qs('#mobile-menu');
  var menuBtn = qs('[data-menu-open]');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      open(mobileMenu);
      menuBtn.setAttribute('aria-expanded', 'true');
    });
    // Close button and any in-menu links marked data-menu-close
    // (same-page anchors don't reload, so the menu must close itself)
    qsa('[data-menu-close]').forEach(function (el) {
      el.addEventListener('click', function () { close(); });
    });
  }

  /* ------------------------------------------------------------------------
     Bag — in-memory state only; deliberately no localStorage
     ---------------------------------------------------------------------- */

  var bag = []; // { id, size, colour, qty }

  var bagDrawer = qs('#bag-drawer');
  var bagItemsEl = qs('[data-bag-items]');
  var bagEmptyEl = qs('[data-bag-empty]');
  var bagFootEl = qs('[data-bag-foot]');
  var bagShippingEl = qs('[data-bag-shipping]');
  var bagSubtotalEl = qs('[data-bag-subtotal]');
  var bagCountEls = qsa('[data-bag-count]');

  function bagSubtotal() {
    return bag.reduce(function (sum, line) {
      return sum + PRODUCTS[line.id].price * line.qty;
    }, 0);
  }

  function bagCount() {
    return bag.reduce(function (sum, line) { return sum + line.qty; }, 0);
  }

  function addToBag(id, size, colour) {
    var existing = bag.filter(function (l) {
      return l.id === id && l.size === size && l.colour === colour;
    })[0];
    if (existing) {
      existing.qty += 1;
    } else {
      bag.push({ id: id, size: size, colour: colour, qty: 1 });
    }
    renderBag();
  }

  function bagLineEl(line, index) {
    var product = PRODUCTS[line.id];
    var li = document.createElement('li');
    li.className = 'bag-item';

    var media = document.createElement('div');
    media.className = 'bag-item-media';
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 360 480');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS(svgNS, 'use');
    use.setAttribute('href', '#' + product.views[0].symbol);
    svg.appendChild(use);
    media.appendChild(svg);

    var details = document.createElement('div');
    var name = document.createElement('p');
    name.className = 'bag-item-name';
    name.textContent = product.name;
    var meta = document.createElement('p');
    meta.className = 'bag-item-meta';
    meta.textContent = line.colour + ' · UK ' + line.size;

    var qty = document.createElement('div');
    qty.className = 'bag-qty';
    var minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('aria-label', 'Decrease quantity of ' + product.name);
    var count = document.createElement('span');
    count.textContent = line.qty;
    count.setAttribute('aria-live', 'polite');
    var plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Increase quantity of ' + product.name);

    minus.addEventListener('click', function () {
      line.qty -= 1;
      if (line.qty < 1) bag.splice(index, 1);
      renderBag();
    });
    plus.addEventListener('click', function () {
      line.qty += 1;
      renderBag();
    });

    qty.appendChild(minus);
    qty.appendChild(count);
    qty.appendChild(plus);

    details.appendChild(name);
    details.appendChild(meta);
    details.appendChild(qty);

    var side = document.createElement('div');
    var price = document.createElement('p');
    price.className = 'bag-item-price';
    price.textContent = formatPrice(product.price * line.qty);
    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'bag-item-remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', 'Remove ' + product.name + ' from bag');
    remove.addEventListener('click', function () {
      bag.splice(index, 1);
      renderBag();
    });
    side.appendChild(price);
    side.appendChild(remove);

    li.appendChild(media);
    li.appendChild(details);
    li.appendChild(side);
    return li;
  }

  function renderBag() {
    if (!bagItemsEl) return;

    bagItemsEl.innerHTML = '';
    bag.forEach(function (line, i) {
      bagItemsEl.appendChild(bagLineEl(line, i));
    });

    var count = bagCount();
    var subtotal = bagSubtotal();
    var isEmpty = bag.length === 0;

    if (bagEmptyEl) bagEmptyEl.hidden = !isEmpty;
    if (bagFootEl) bagFootEl.hidden = isEmpty;
    if (bagShippingEl) {
      bagShippingEl.hidden = isEmpty;
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        bagShippingEl.textContent = 'Your order ships free within the UK.';
      } else {
        bagShippingEl.textContent = 'You are ' + formatPrice(FREE_SHIPPING_THRESHOLD - subtotal) + ' from free UK shipping.';
      }
    }
    if (bagSubtotalEl) bagSubtotalEl.textContent = formatPrice(subtotal);

    bagCountEls.forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  qsa('[data-bag-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (bagDrawer) open(bagDrawer);
    });
  });

  qsa('[data-bag-close]').forEach(function (el) {
    el.addEventListener('click', function () { close(); });
  });

  renderBag();

  /* ------------------------------------------------------------------------
     Quick add on product cards (index & collection)
     First tap reveals the size row; choosing a size adds to the bag.
     ---------------------------------------------------------------------- */

  qsa('[data-quickadd]').forEach(function (widget) {
    var card = widget.closest('[data-product]');
    if (!card) return;
    var product = PRODUCTS[card.getAttribute('data-product')];
    if (!product) return;

    var toggle = qs('.quickadd-toggle', widget);
    var sizesRow = qs('.quickadd-sizes', widget);
    if (!toggle || !sizesRow) return;

    product.sizes.forEach(function (size) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = size;
      b.setAttribute('aria-label', 'Add ' + product.name + ', size UK ' + size + ', to bag');
      b.addEventListener('click', function () {
        addToBag(product.id, size, product.colours[0].name);
        sizesRow.hidden = true;
        toggle.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
        widget.classList.remove('is-open');
        if (bagDrawer) open(bagDrawer);
      });
      sizesRow.appendChild(b);
    });

    toggle.addEventListener('click', function () {
      toggle.hidden = true;
      sizesRow.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      widget.classList.add('is-open');
      var firstSize = qs('button', sizesRow);
      if (firstSize) firstSize.focus();
    });
  });

  /* ------------------------------------------------------------------------
     The founding edit: quiet-luxury index (homepage, ≥960px)
     Hovering or focusing a row swaps the featured panel beside the list.
     ---------------------------------------------------------------------- */

  var showcase = qs('[data-edit-showcase]');

  if (showcase) {
    var editRows = qsa('[data-edit-item]', showcase);
    var editPreviews = qsa('[data-edit-preview]', showcase);

    var activateEdit = function (id) {
      editRows.forEach(function (row) {
        row.classList.toggle('is-active', row.getAttribute('data-edit-item') === id);
      });
      editPreviews.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.getAttribute('data-edit-preview') === id);
      });
    };

    editRows.forEach(function (row) {
      var id = row.getAttribute('data-edit-item');
      row.addEventListener('mouseenter', function () { activateEdit(id); });
      row.addEventListener('focus', function () { activateEdit(id); });
    });
  }

  /* ------------------------------------------------------------------------
     Fade-up reveals on scroll
     Only armed when IntersectionObserver exists and the user hasn't asked
     for reduced motion; otherwise content is simply visible.
     ---------------------------------------------------------------------- */

  var revealTargets = qsa('[data-reveal]');

  if (
    revealTargets.length &&
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    document.body.classList.add('has-reveal');
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Accordions (product page)
     ---------------------------------------------------------------------- */

  qsa('.accordion-trigger').forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    var setOpen = function (isOpen) {
      trigger.setAttribute('aria-expanded', String(isOpen));
      panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : '0px';
    };

    // Open any accordion marked expanded in the HTML (Description, by default)
    setOpen(trigger.getAttribute('aria-expanded') === 'true');

    trigger.addEventListener('click', function () {
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });
  });

  // Re-measure open accordion panels when JS rewrites their contents
  function refreshAccordions() {
    qsa('.accordion-trigger[aria-expanded="true"]').forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  }

  /* ------------------------------------------------------------------------
     Product detail page
     product.html is a template: ?p=vesper|chapel|encore|aria selects the
     product. The static markup carries the Vesper as a no-JS fallback.
     ---------------------------------------------------------------------- */

  var productRoot = qs('[data-product-page]');

  if (productRoot) {
    var param = new URLSearchParams(window.location.search).get('p');
    var product = PRODUCTS[param] || PRODUCTS.vesper;

    var state = {
      colour: product.colours[0].name,
      size: null
    };

    document.title = product.name + ' — Rose Archer';

    var setText = function (attr, value) {
      var el = qs('[data-product-' + attr + ']', productRoot);
      if (el) el.textContent = value;
    };

    setText('name', product.name);
    setText('crumb', product.name);
    setText('price', formatPrice(product.price));
    setText('meta', product.meta);

    /* --- Gallery --- */
    var mainMedia = qs('[data-gallery-main]', productRoot);
    var thumbsWrap = qs('[data-gallery-thumbs]', productRoot);

    function mediaSVG(view, tone) {
      var figure = document.createElement('figure');
      figure.className = 'product-media ' + tone;
      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 360 480');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', view.label);
      var use = document.createElementNS(svgNS, 'use');
      use.setAttribute('href', '#' + view.symbol);
      svg.appendChild(use);
      figure.appendChild(svg);
      return figure;
    }

    function showView(index) {
      if (!mainMedia) return;
      mainMedia.innerHTML = '';
      mainMedia.appendChild(mediaSVG(product.views[index], product.tone));
      qsa('.gallery-thumb', thumbsWrap).forEach(function (t, i) {
        t.setAttribute('aria-current', String(i === index));
      });
    }

    if (mainMedia && thumbsWrap) {
      thumbsWrap.innerHTML = '';
      product.views.forEach(function (view, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gallery-thumb';
        btn.setAttribute('aria-label', 'View image ' + (i + 1) + ' of ' + product.views.length);
        btn.appendChild(mediaSVG({ symbol: view.symbol, label: '' }, product.tone));
        qs('svg', btn).setAttribute('aria-hidden', 'true');
        qs('svg', btn).removeAttribute('role');
        btn.addEventListener('click', function () { showView(i); });
        thumbsWrap.appendChild(btn);
      });
      showView(0);
    }

    /* --- Colour selector --- */
    var swatchList = qs('[data-swatches]', productRoot);
    var colourValue = qs('[data-colour-value]', productRoot);

    if (swatchList) {
      swatchList.innerHTML = '';
      product.colours.forEach(function (colour) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'swatch';
        b.style.backgroundColor = colour.hex;
        b.setAttribute('aria-label', 'Colour: ' + colour.name);
        b.setAttribute('aria-pressed', String(colour.name === state.colour));
        b.addEventListener('click', function () {
          state.colour = colour.name;
          if (colourValue) colourValue.textContent = colour.name;
          qsa('.swatch', swatchList).forEach(function (s) {
            s.setAttribute('aria-pressed', String(s === b));
          });
        });
        swatchList.appendChild(b);
      });
      if (colourValue) colourValue.textContent = state.colour;
    }

    /* --- Size selector --- */
    var sizeList = qs('[data-sizes]', productRoot);
    var sizeHint = qs('[data-size-hint]', productRoot);

    if (sizeList) {
      sizeList.innerHTML = '';
      product.sizes.forEach(function (size) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'size-option';
        b.textContent = 'UK ' + size;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          state.size = size;
          if (sizeHint) sizeHint.hidden = true;
          qsa('.size-option', sizeList).forEach(function (s) {
            s.setAttribute('aria-pressed', String(s === b));
          });
        });
        sizeList.appendChild(b);
      });
    }

    /* --- Add to bag --- */
    var addBtn = qs('[data-add-to-bag]', productRoot);
    var addConfirm = qs('[data-add-confirm]', productRoot);

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        if (state.size === null) {
          if (sizeHint) {
            sizeHint.hidden = false;
            sizeHint.textContent = 'Select a size first.';
          }
          return;
        }
        addToBag(product.id, state.size, state.colour);
        if (addConfirm) {
          addConfirm.hidden = false;
          addConfirm.textContent = 'Added — ' + product.name + ', ' + state.colour + ', UK ' + state.size + '.';
        }
        if (bagDrawer) open(bagDrawer);
      });
    }

    /* --- Accordion copy --- */
    var descEl = qs('[data-product-description]', productRoot);
    if (descEl) {
      descEl.innerHTML = '';
      product.description.forEach(function (text) {
        var p = document.createElement('p');
        p.textContent = text;
        descEl.appendChild(p);
      });
    }

    var fitIntro = qs('[data-fit-intro]', productRoot);
    if (fitIntro) fitIntro.textContent = product.fit.intro;

    var fitModel = qs('[data-fit-model]', productRoot);
    if (fitModel) fitModel.textContent = product.fit.model;

    var fitTable = qs('[data-fit-table]', productRoot);
    if (fitTable) {
      fitTable.innerHTML = '';
      var caption = document.createElement('caption');
      caption.textContent = 'Garment measurements, cm';
      fitTable.appendChild(caption);

      var thead = document.createElement('thead');
      var headRow = document.createElement('tr');
      var sizeTh = document.createElement('th');
      sizeTh.scope = 'col';
      sizeTh.textContent = 'UK size';
      headRow.appendChild(sizeTh);
      product.fit.columns.forEach(function (col) {
        var th = document.createElement('th');
        th.scope = 'col';
        th.textContent = col;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      fitTable.appendChild(thead);

      var tbody = document.createElement('tbody');
      product.sizes.forEach(function (size) {
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.scope = 'row';
        th.textContent = size;
        tr.appendChild(th);
        product.fit.rows[size].forEach(function (val) {
          var td = document.createElement('td');
          td.textContent = val;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      fitTable.appendChild(tbody);
    }

    var fabricEl = qs('[data-product-fabric]', productRoot);
    if (fabricEl) {
      fabricEl.innerHTML = '';
      product.fabric.forEach(function (text) {
        var p = document.createElement('p');
        p.textContent = text;
        fabricEl.appendChild(p);
      });
    }

    refreshAccordions();

    /* --- Complete the look --- */
    var relatedWrap = qs('[data-related]', productRoot.ownerDocument);
    if (relatedWrap) {
      relatedWrap.innerHTML = '';
      product.related.forEach(function (id) {
        var rel = PRODUCTS[id];
        var article = document.createElement('article');
        article.className = 'product-card';

        var link = document.createElement('a');
        link.className = 'card-media-link';
        link.href = 'product.html?p=' + rel.id;

        var figure = mediaSVG(rel.views[0], rel.tone);
        link.appendChild(figure);

        var info = document.createElement('div');
        info.className = 'card-info';
        var h3 = document.createElement('h3');
        h3.className = 'card-name';
        var nameLink = document.createElement('a');
        nameLink.href = 'product.html?p=' + rel.id;
        nameLink.textContent = rel.name;
        h3.appendChild(nameLink);
        var meta = document.createElement('p');
        meta.className = 'card-meta';
        meta.textContent = rel.meta;
        var price = document.createElement('p');
        price.className = 'card-price';
        price.textContent = formatPrice(rel.price);
        info.appendChild(h3);
        info.appendChild(meta);
        info.appendChild(price);

        article.appendChild(link);
        article.appendChild(info);
        relatedWrap.appendChild(article);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Collection page: filtering & sorting
     Cards carry data-sizes / data-colour / data-price / data-category.
     ---------------------------------------------------------------------- */

  var collectionGrid = qs('[data-collection-grid]');

  if (collectionGrid) {
    var cards = qsa('[data-product]', collectionGrid);
    cards.forEach(function (card, i) { card.dataset.order = i; });

    var sizeFilter = qs('[data-filter-size]');
    var colourFilter = qs('[data-filter-colour]');
    var priceFilter = qs('[data-filter-price]');
    var sortSelect = qs('[data-sort]');
    var countEl = qs('[data-results-count]');
    var noResults = qs('[data-no-results]');
    var clearBtns = qsa('[data-clear-filters]');

    // Nav links pass ?cat=dresses|tops to pre-filter the drop
    var catParam = new URLSearchParams(window.location.search).get('cat');
    var headTitle = qs('[data-collection-title]');
    var headText = qs('[data-collection-text]');
    if (catParam === 'dresses' && headTitle) {
      headTitle.textContent = 'The Dresses';
      if (headText) headText.textContent = 'Two silhouettes, cut to be kept. Satin that hangs the way satin should.';
    } else if (catParam === 'tops' && headTitle) {
      headTitle.textContent = 'Going-Out Tops';
      if (headText) headText.textContent = 'Structured, tied, or boned — the tops that carry the evening.';
    }

    var matchesPrice = function (price, band) {
      if (band === 'under40') return price < 40;
      if (band === '40-60') return price >= 40 && price <= 60;
      if (band === 'over60') return price > 60;
      return true;
    };

    var applyFilters = function () {
      var size = sizeFilter ? sizeFilter.value : 'any';
      var colour = colourFilter ? colourFilter.value : 'any';
      var priceBand = priceFilter ? priceFilter.value : 'any';
      var visible = 0;

      cards.forEach(function (card) {
        var sizes = card.getAttribute('data-sizes').split(' ');
        var cardColour = card.getAttribute('data-colour');
        var price = parseInt(card.getAttribute('data-price'), 10);
        var category = card.getAttribute('data-category');

        var show =
          (size === 'any' || sizes.indexOf(size) !== -1) &&
          (colour === 'any' || cardColour === colour) &&
          matchesPrice(price, priceBand) &&
          (!catParam || category === catParam);

        card.hidden = !show;
        if (show) visible += 1;
      });

      if (countEl) {
        countEl.textContent = visible + (visible === 1 ? ' piece' : ' pieces');
      }
      if (noResults) noResults.hidden = visible !== 0;
      collectionGrid.hidden = visible === 0;
    };

    var applySort = function () {
      if (!sortSelect) return;
      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        var pa = parseInt(a.getAttribute('data-price'), 10);
        var pb = parseInt(b.getAttribute('data-price'), 10);
        var na = qs('.card-name', a).textContent.trim();
        var nb = qs('.card-name', b).textContent.trim();
        if (mode === 'price-asc') return pa - pb;
        if (mode === 'price-desc') return pb - pa;
        if (mode === 'name') return na.localeCompare(nb);
        return a.dataset.order - b.dataset.order; // featured
      });
      sorted.forEach(function (card) { collectionGrid.appendChild(card); });
    };

    [sizeFilter, colourFilter, priceFilter].forEach(function (el) {
      if (el) el.addEventListener('change', applyFilters);
    });
    if (sortSelect) sortSelect.addEventListener('change', applySort);

    clearBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (sizeFilter) sizeFilter.value = 'any';
        if (colourFilter) colourFilter.value = 'any';
        if (priceFilter) priceFilter.value = 'any';
        applyFilters();
      });
    });

    applyFilters();
  }

  /* ------------------------------------------------------------------------
     Newsletter
     ---------------------------------------------------------------------- */

  var newsletterForm = qs('[data-newsletter]');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = qs('input[type="email"]', newsletterForm);
      if (!input || !input.value || input.validity.typeMismatch) {
        if (input) input.focus();
        return;
      }
      var thanks = document.createElement('p');
      thanks.className = 'newsletter-thanks';
      thanks.setAttribute('role', 'status');
      thanks.textContent = 'You’re on the list. We’ll be quiet until it matters.';
      newsletterForm.replaceWith(thanks);
    });
  }

  /* ------------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */

  qsa('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

})();
