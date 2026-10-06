/**
 * Button injector.
 *
 * Priority order:
 *   1. #getyoursize-btn placeholder  (brand placed it explicitly)
 *   2. Auto-detect the size selector and insert below it
 *   3. Floating button bottom-right  (last resort)
 *
 * Re-runs on DOM mutations so it works on single-page / dynamic sites.
 */

const SIZE_SHORT  = /^(xs|s|m|l|xl|2xl|xxl|3xl|xxxl)$/i;
const SIZE_WORD   = /^(x-?small|small|medium|large|x-?large|xx-?large|2x-?large)$/i;
const SIZE_NUM    = /^(28|30|32|34|36|38|40|42|44|46|48|50|52)$/; // numeric apparel sizes

function isLabel(text) {
  const t = text.trim();
  return SIZE_SHORT.test(t) || SIZE_WORD.test(t) || SIZE_NUM.test(t);
}

/** Find the element we should insert the button after */
function findTarget() {
  // 1. Explicit placeholder
  const ph = document.getElementById('getyoursize-btn');
  if (ph) return { el: ph, mode: 'inside' };

  // 2. <select> whose options include size labels
  for (const sel of document.querySelectorAll('select')) {
    const opts = Array.from(sel.options).map(o => o.text.trim());
    if (opts.some(isLabel)) return { el: sel, mode: 'after' };
  }

  // 3. Radio group where values are size labels
  for (const radio of document.querySelectorAll('input[type=radio]')) {
    if (isLabel(radio.value || '')) {
      const wrap =
        radio.closest('fieldset') ||
        radio.closest('[class*=size]') ||
        radio.closest('[class*=variant]') ||
        radio.closest('[class*=swatch]') ||
        radio.parentElement;
      return { el: wrap, mode: 'after' };
    }
  }

  // 4. Button / anchor group with 2+ size labels
  const allBtns = Array.from(
    document.querySelectorAll('button, a, [role=radio], [role=option], [role=button]')
  );
  const sizeBtns = allBtns.filter(b => isLabel(b.textContent));
  if (sizeBtns.length >= 2) {
    const wrap =
      sizeBtns[0].closest('[class*=size]') ||
      sizeBtns[0].closest('[class*=variant]') ||
      sizeBtns[0].closest('ul') ||
      sizeBtns[0].parentElement;
    return { el: wrap, mode: 'after' };
  }

  return null; // fall through to floating
}

function makeButton(onClick) {
  const btn = document.createElement('button');
  btn.id = 'gys-trigger';
  btn.type = 'button';
  btn.textContent = '📐 Get Your Size';
  Object.assign(btn.style, {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '6px',
    padding:       '10px 18px',
    marginTop:     '12px',
    background:    '#E84C6B',
    color:         '#fff',
    border:        'none',
    borderRadius:  '8px',
    fontSize:      '14px',
    fontWeight:    '600',
    fontFamily:    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    cursor:        'pointer',
    letterSpacing: '-0.1px',
    transition:    'opacity 0.15s',
  });
  btn.onmouseenter = () => { btn.style.opacity = '0.88'; };
  btn.onmouseleave = () => { btn.style.opacity = '1'; };
  btn.addEventListener('click', onClick);
  return btn;
}

function makeFloatingButton(onClick) {
  const btn = makeButton(onClick);
  Object.assign(btn.style, {
    position:     'fixed',
    bottom:       '24px',
    right:        '24px',
    zIndex:       '2147483646',
    marginTop:    '0',
    boxShadow:    '0 4px 16px rgba(232,76,107,0.35)',
    borderRadius: '24px',
    padding:      '12px 22px',
    fontSize:     '15px',
  });
  return btn;
}

export function injectButton(onClick) {
  // Avoid double injection
  if (document.getElementById('gys-trigger')) return;

  function inject() {
    if (document.getElementById('gys-trigger')) return;

    const target = findTarget();

    if (target) {
      const btn = makeButton(onClick);
      if (target.mode === 'inside') {
        target.el.appendChild(btn);
      } else {
        target.el.insertAdjacentElement('afterend', btn);
      }
    } else {
      document.body.appendChild(makeFloatingButton(onClick));
    }
  }

  // Run once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject, { once: true });
  } else {
    inject();
  }

  // Watch for SPA route changes / lazy-rendered product options
  const observer = new MutationObserver(() => {
    if (!document.getElementById('gys-trigger')) inject();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
