/* ==========================================================================
   ROSE ARCHER — global.js (Shopify theme)
   Vanilla JS. Presentational behaviour (menu, accordions, reveals, showcase,
   gallery, marquee via CSS) plus a bag drawer wired to the Shopify Cart AJAX
   API. Add-to-cart also works without JS via the real <form> elements — this
   is progressive enhancement.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.RoseArcher || {};
  var routes = cfg.routes || {};
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* --- Money formatting (Shopify standard) ------------------------------- */
  function formatMoney(cents) {
    var value = (cents / 100).toFixed(2);
    var fmt = cfg.moneyFormat || '£{{amount}}';
    return fmt.replace(/\{\{\s*amount\s*\}\}/, value)
              .replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(cents / 100));
  }

  /* --- Panels: shared scrim + open/close + focus trap -------------------- */
  var scrim = qs('[data-scrim]');
  var openPanel = null;
  var lastFocused = null;
  var menuBtn = qs('[data-menu-open]');

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
    if (openPanel.id === 'mobile-menu' && menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
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
    if (e.key === 'Tab' && openPanel) {
      var items = qsa('button, a[href], input, select', openPanel).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* --- Mobile menu ------------------------------------------------------- */
  var mobileMenu = qs('#mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () { open(mobileMenu); menuBtn.setAttribute('aria-expanded', 'true'); });
    qsa('[data-menu-close]').forEach(function (el) { el.addEventListener('click', function () { close(); }); });
  }

  /* --- Bag drawer, Cart AJAX -------------------------------------------- */
  var bagDrawer = qs('[data-cart-drawer]');
  var bagItemsEl = qs('[data-bag-items]');
  var bagEmptyEl = qs('[data-bag-empty]');
  var bagFootEl = qs('[data-bag-foot]');
  var bagShippingEl = qs('[data-bag-shipping]');
  var bagSubtotalEl = qs('[data-bag-subtotal]');
  var threshold = cfg.freeShippingThreshold || 5000;

  function renderCart(cart) {
    qsa('[data-bag-count]').forEach(function (el) {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count === 0;
    });
    if (bagSubtotalEl) bagSubtotalEl.textContent = formatMoney(cart.total_price);
    var empty = cart.item_count === 0;
    if (bagEmptyEl) bagEmptyEl.hidden = !empty;
    if (bagFootEl) bagFootEl.hidden = empty;
    if (bagShippingEl) {
      bagShippingEl.hidden = empty;
      if (cart.total_price >= threshold) {
        bagShippingEl.textContent = (cfg.strings && cfg.strings.freeReached) || '';
      } else {
        var remaining = formatMoney(threshold - cart.total_price);
        bagShippingEl.textContent = ((cfg.strings && cfg.strings.freeRemaining) || '__amount__').replace('__amount__', remaining);
      }
    }
    if (!bagItemsEl) return;
    bagItemsEl.innerHTML = '';
    cart.items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'bag-item';
      li.setAttribute('data-line-key', item.key);
      var media = '<div class="bag-item-media">' + (item.image ? '<img src="' + item.image + '" alt="" loading="lazy">' : '') + '</div>';
      var mid =
        '<div><p class="bag-item-name">' + item.product_title + '</p>' +
        '<p class="bag-item-meta">' + (item.variant_title || '') + '</p>' +
        '<div class="bag-qty">' +
          '<button type="button" data-qty-down aria-label="Decrease quantity">−</button>' +
          '<span aria-live="polite">' + item.quantity + '</span>' +
          '<button type="button" data-qty-up aria-label="Increase quantity">+</button>' +
        '</div></div>';
      var side =
        '<div><p class="bag-item-price">' + formatMoney(item.final_line_price) + '</p>' +
        '<button type="button" class="bag-item-remove" data-qty-remove>Remove</button></div>';
      li.innerHTML = media + mid + side;
      bagItemsEl.appendChild(li);
    });
  }

  function fetchCart() {
    return fetch(routes.cart + '.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); }).then(renderCart);
  }

  function changeLine(key, quantity) {
    return fetch(routes.cartChange + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    }).then(function (r) { return r.json(); }).then(renderCart);
  }

  function addVariant(id, quantity) {
    return fetch(routes.cartAdd + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: [{ id: id, quantity: quantity || 1 }] })
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw e; });
      return r.json();
    }).then(function () {
      return fetchCart();
    }).then(function () {
      if (cfg.cartDrawerEnabled !== false && bagDrawer) open(bagDrawer);
    });
  }

  qsa('[data-bag-open]').forEach(function (b) { b.addEventListener('click', function () { if (bagDrawer) open(bagDrawer); }); });
  qsa('[data-bag-close]').forEach(function (b) { b.addEventListener('click', function () { close(); }); });

  if (bagItemsEl) {
    bagItemsEl.addEventListener('click', function (e) {
      var line = e.target.closest('[data-line-key]');
      if (!line) return;
      var key = line.getAttribute('data-line-key');
      var qtyEl = qs('.bag-qty span', line);
      var current = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
      if (e.target.closest('[data-qty-up]')) changeLine(key, current + 1);
      else if (e.target.closest('[data-qty-down]')) changeLine(key, current - 1);
      else if (e.target.closest('[data-qty-remove]')) changeLine(key, 0);
    });
  }

  /* --- Quick add on product cards --------------------------------------- */
  qsa('[data-quickadd]').forEach(function (widget) {
    var toggle = qs('.quickadd-toggle', widget);
    var sizes = qs('.quickadd-sizes', widget);
    if (!toggle || !sizes) return;
    toggle.addEventListener('click', function () {
      toggle.hidden = true; sizes.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      widget.classList.add('is-open');
      var first = qs('button[data-variant-id]', sizes);
      if (first) first.focus();
    });
    qsa('button[data-variant-id]', sizes).forEach(function (b) {
      b.addEventListener('click', function () {
        addVariant(b.getAttribute('data-variant-id'), 1).catch(function () {});
        sizes.hidden = true; toggle.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
        widget.classList.remove('is-open');
      });
    });
  });

  /* --- Product page: variants + add to cart ----------------------------- */
  var variantsScript = qs('[data-product-variants]');
  var productForm = qs('#product-form');
  if (variantsScript && productForm) {
    var variants = [];
    try { variants = JSON.parse(variantsScript.textContent); } catch (e) { variants = []; }
    var variantInput = qs('[data-variant-input]', productForm);
    var priceEl = qs('[data-price]');
    var addBtn = qs('[data-add-to-bag]', productForm);
    var hint = qs('[data-size-hint]', productForm);
    var groups = qsa('[data-option-group]', productForm);

    function selectedOptions() {
      return groups.map(function (g) {
        var pressed = qs('[data-option-button][aria-pressed="true"]', g);
        return pressed ? pressed.getAttribute('data-value') : null;
      });
    }
    function matchVariant() {
      var chosen = selectedOptions();
      return variants.filter(function (v) {
        return chosen.every(function (val, i) { return val === null || v.options[i] === val; });
      })[0];
    }
    function updateVariant() {
      var v = matchVariant();
      var allChosen = selectedOptions().every(function (x) { return x !== null; });
      if (v && priceEl) priceEl.textContent = formatMoney(v.price);
      if (v && variantInput) variantInput.value = v.id;
      if (addBtn) {
        if (allChosen && v && !v.available) { addBtn.disabled = true; addBtn.textContent = 'Sold out'; }
        else { addBtn.disabled = false; addBtn.textContent = (cfg.strings && cfg.strings.addToBag) || 'Add to bag'; }
      }
    }
    groups.forEach(function (g) {
      var valueLabel = qs('[data-option-value]', g);
      qsa('[data-option-button]', g).forEach(function (btn) {
        btn.addEventListener('click', function () {
          qsa('[data-option-button]', g).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
          if (valueLabel) valueLabel.textContent = btn.getAttribute('data-value');
          if (hint) hint.hidden = true;
          updateVariant();
        });
      });
    });

    productForm.addEventListener('submit', function (e) {
      // Require a selection for every option before AJAX add
      var allChosen = selectedOptions().every(function (x) { return x !== null; });
      if (!allChosen) {
        e.preventDefault();
        if (hint) { hint.hidden = false; }
        return;
      }
      if (!variantInput || !variantInput.value) return; // let the form post normally
      e.preventDefault();
      var confirm = qs('[data-add-confirm]', productForm);
      addVariant(variantInput.value, 1).then(function () {
        if (confirm) { confirm.hidden = false; confirm.textContent = 'Added to your bag.'; }
      }).catch(function () { productForm.submit(); });
    });

    updateVariant();
  }

  /* --- Product gallery thumbnails --------------------------------------- */
  var galleryMain = qs('[data-gallery-main]');
  var galleryThumbs = qs('[data-gallery-thumbs]');
  if (galleryMain && galleryThumbs) {
    qsa('.gallery-thumb', galleryThumbs).forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var img = qs('img', thumb);
        var mainFig = qs('.product-media', galleryMain);
        if (img && mainFig) {
          var big = img.getAttribute('src').replace(/width=\d+/, 'width=1200');
          mainFig.innerHTML = '<img src="' + big + '" alt="' + (img.alt || '') + '">';
        }
        qsa('.gallery-thumb', galleryThumbs).forEach(function (t) { t.setAttribute('aria-current', String(t === thumb)); });
      });
    });
  }

  /* --- Accordions -------------------------------------------------------- */
  qsa('.accordion-trigger').forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    var setOpen = function (isOpen) {
      trigger.setAttribute('aria-expanded', String(isOpen));
      panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : '0px';
    };
    setOpen(trigger.getAttribute('aria-expanded') === 'true');
    trigger.addEventListener('click', function () { setOpen(trigger.getAttribute('aria-expanded') !== 'true'); });
  });

  /* --- Founding edit: hover-swap index ---------------------------------- */
  var showcase = qs('[data-edit-showcase]');
  if (showcase) {
    var rows = qsa('[data-edit-item]', showcase);
    var previews = qsa('[data-edit-preview]', showcase);
    var activate = function (id) {
      rows.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-edit-item') === id); });
      previews.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-edit-preview') === id); });
    };
    rows.forEach(function (row) {
      var id = row.getAttribute('data-edit-item');
      row.addEventListener('mouseenter', function () { activate(id); });
      row.addEventListener('focus', function () { activate(id); });
    });
  }

  /* --- Collection facets: auto-submit ----------------------------------- */
  var facetForm = qs('[data-facet-form]');
  if (facetForm) {
    qsa('[data-auto-submit]', facetForm).forEach(function (el) {
      el.addEventListener('change', function () { facetForm.submit(); });
    });
  }

  /* --- Scroll reveals (last, so it sees any late DOM) ------------------- */
  var revealTargets = qsa('[data-reveal]');
  if (revealTargets.length && 'IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('has-reveal');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { obs.observe(el); });
  }

})();
