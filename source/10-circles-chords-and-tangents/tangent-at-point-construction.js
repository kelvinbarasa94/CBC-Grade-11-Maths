/* ============================================================================
 * Constructing a Tangent at a Point on a Circle — stepped JSXGraph animation
 * ----------------------------------------------------------------------------
 * A compass-and-straightedge construction revealed one step at a time with
 * "Back" / "Next" buttons. O and P are free, draggable base points; everything
 * else (Q, the perpendicular-bisector arcs, X, Y, the tangent) is DERIVED, so
 * the whole construction stays correct while you drag.
 *
 * Expects a container div with id="jsx-tangent-at-point-construction". The script injects its own caption
 * bar and Back/Next controls around that div, so the .js is the only file you
 * need.
 *
 * Five steps (matching the PreTeXt figure):
 *   1. Circle, centre O, with point P on it.
 *   2. Radius OP drawn and extended beyond P.
 *   3. Q marked on the line so PQ = OP  (P becomes the midpoint of OQ).
 *   4. Equal arcs from O and from Q crossing at X and Y.
 *   5. Line XY = the tangent to the circle at P (perpendicular to OP).
 * ==========================================================================*/

(function () {
  'use strict';

  const BOX_ID = 'jsx-tangent-at-point-construction';
  const TOTAL_STEPS = 5;
  const TEAL = '#0d8e8e';
  const ACCENT = '#1565c0';
  const TANGENT_COL = '#1f4ed8';
  const ARC_COL = '#888';

  // ---- Board ---------------------------------------------------------------
  const board = JXG.JSXGraph.initBoard(BOX_ID, {
    boundingbox: [-3.4, 3.3, 7.4, -3.3],
    keepaspectratio: true,
    axis: false,
    showCopyright: false,
    showNavigation: false,
    pan: { enabled: false },
    zoom: { wheel: false }
  });

  // ---- CONSTRUCTION --------------------------------------------------------
  // Free base points (draggable).
  const O = board.create('point', [0, 0], {
    name: 'O', size: 4, strokeColor: ACCENT, fillColor: ACCENT,
    label: { offset: [-10, -12], anchorX: 'right', anchorY: 'top' }
  });
  const P = board.create('point', [2, 0], {
    name: 'P', size: 4, strokeColor: ACCENT, fillColor: ACCENT,
    label: { offset: [10, -12], anchorX: 'left', anchorY: 'top' }
  });

  // The circle, centre O through P.
  const circle = board.create('circle', [O, P], {
    strokeColor: TEAL, strokeWidth: 2, fillColor: 'none'
  });

  // Ray from O through P, extended beyond P (radius + extension in one).
  const rayOP = board.create('line', [O, P], {
    straightFirst: false, straightLast: true,
    strokeColor: '#333', strokeWidth: 1.5
  });

  // Q = reflection of O through P  ⇒  PQ = OP and P is the midpoint of OQ.
  const Q = board.create('mirrorelement', [O, P], {
    name: 'Q', size: 4, strokeColor: '#444', fillColor: '#444',
    label: { offset: [6, -14], anchorX: 'left', anchorY: 'top' }
  });

  // Equal compass setting for the two arcs: anything > half of OQ ( = OP ).
  const arcR = () => 1.25 * O.Dist(P);
  const cO = board.create('circle', [O, arcR], { visible: false });
  const cQ = board.create('circle', [Q, arcR], { visible: false });

  // Arc crossings: X above the line, Y below. (Indices verified headlessly.)
  const X = board.create('intersection', [cO, cQ, 1], {
    name: 'X', size: 3, strokeColor: '#444', fillColor: '#fff',
    label: { offset: [8, 6], anchorX: 'left', anchorY: 'bottom' }
  });
  const Y = board.create('intersection', [cO, cQ, 0], {
    name: 'Y', size: 3, strokeColor: '#444', fillColor: '#fff',
    label: { offset: [8, -6], anchorX: 'left', anchorY: 'top' }
  });

  // Visible compass arcs (dashed), drawn only across the crossing region.
  const arcFromO = board.create('arc', [O, Y, X], {
    strokeColor: ARC_COL, strokeWidth: 1.3, dash: 2, highlight: false
  });
  const arcFromQ = board.create('arc', [Q, X, Y], {
    strokeColor: ARC_COL, strokeWidth: 1.3, dash: 2, highlight: false
  });

  // The tangent: the line through X and Y (perpendicular bisector of OQ),
  // which passes through P at right angles to OP.
  const tangent = board.create('line', [X, Y], {
    strokeColor: TANGENT_COL, strokeWidth: 2.5
  });
  const tangentLabel = board.create('text', [
    () => X.X() + 0.35, () => X.Y() + 0.55, 'tangent'
  ], { fontSize: 14, strokeColor: TANGENT_COL, anchorX: 'left', highlight: false });

  // Right-angle mark between PO and PX, sitting at P.
  const rightAngle = board.create('angle', [O, P, X], {
    type: 'square', radius: 0.45,
    strokeColor: TANGENT_COL, fillColor: TANGENT_COL, fillOpacity: 0.25,
    name: '', highlight: false
  });

  // ---- Congruence tick marks (PQ = OP) ------------------------------------
  // JSXGraph has no native congruence tick, so overlay a short perpendicular
  // dash at the midpoint of each segment; both stay live under dragging.
  function tickMark(A, B) {
    const mx = () => (A.X() + B.X()) / 2;
    const my = () => (A.Y() + B.Y()) / 2;
    const nx = () => { const dx = B.X() - A.X(), dy = B.Y() - A.Y(), L = Math.hypot(dx, dy) || 1; return -dy / L; };
    const ny = () => { const dx = B.X() - A.X(), dy = B.Y() - A.Y(), L = Math.hypot(dx, dy) || 1; return dx / L; };
    const e1 = board.create('point', [() => mx() - 0.14 * nx(), () => my() - 0.14 * ny()], { visible: false, name: '' });
    const e2 = board.create('point', [() => mx() + 0.14 * nx(), () => my() + 0.14 * ny()], { visible: false, name: '' });
    return board.create('segment', [e1, e2], { strokeColor: '#333', strokeWidth: 2, highlight: false });
  }
  const tickOP = tickMark(O, P);
  const tickPQ = tickMark(P, Q);

  // ---- STEP VISIBILITY -----------------------------------------------------
  // Each entry: the object appears from the listed step onward.
  const staged = [
    { o: rayOP, from: 2 },
    { o: Q, from: 3 },
    { o: tickOP, from: 3 },
    { o: tickPQ, from: 3 },
    { o: arcFromO, from: 4 },
    { o: arcFromQ, from: 4 },
    { o: X, from: 4 },
    { o: Y, from: 4 },
    { o: tangent, from: 5 },
    { o: tangentLabel, from: 5 },
    { o: rightAngle, from: 5 }
  ];

  const CAPTIONS = [
    'Step 1 of 5 — Draw a circle with centre O and mark the point P on it.',
    'Step 2 of 5 — Draw the radius OP and extend the line beyond P.',
    'Step 3 of 5 — With the compasses set to OP, mark Q on the line so that PQ = OP. Now P is the midpoint of OQ.',
    'Step 4 of 5 — Open the compasses wider than half of OQ. Draw equal arcs from O and from Q; they cross at X and Y.',
    'Step 5 of 5 — Draw the line through X and Y. It passes through P at a right angle to OP: the tangent at P.'
  ];

  let step = 1;

  function render() {
    staged.forEach(({ o, from }) => o.setAttribute({ visible: step >= from }));
    board.update();
    captionEl.textContent = CAPTIONS[step - 1];
    indicatorEl.textContent = step + ' / ' + TOTAL_STEPS;
    backBtn.disabled = step === 1;
    nextBtn.disabled = step === TOTAL_STEPS;
  }

  // ---- CONTROLS (injected around the board div) ---------------------------
  const boxEl = document.getElementById(BOX_ID);

  const captionEl = document.createElement('div');
  captionEl.style.cssText =
    'font:15px/1.45 system-ui,Segoe UI,Arial,sans-serif;color:#222;' +
    'max-width:640px;margin:0 auto 8px;text-align:center;min-height:44px;';

  const controls = document.createElement('div');
  controls.style.cssText =
    'display:flex;align-items:center;justify-content:center;gap:14px;' +
    'margin-top:10px;font:14px system-ui,Segoe UI,Arial,sans-serif;';

  const btnCss =
    'padding:7px 16px;border:1px solid #1565c0;background:#1565c0;color:#fff;' +
    'border-radius:6px;cursor:pointer;font:inherit;';

  const backBtn = document.createElement('button');
  backBtn.textContent = '◀ Back';
  backBtn.style.cssText = btnCss;

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next ▶';
  nextBtn.style.cssText = btnCss;

  const indicatorEl = document.createElement('span');
  indicatorEl.style.cssText = 'min-width:42px;text-align:center;color:#555;font-variant-numeric:tabular-nums;';

  function disabledStyle(btn) {
    btn.addEventListener('mouseenter', () => {});
  }
  [backBtn, nextBtn].forEach(b => {
    b.addEventListener('mousedown', e => e.preventDefault());
  });
  // grey out when disabled
  const styleEl = document.createElement('style');
  styleEl.textContent = 'button:disabled{opacity:.4;cursor:default;}';
  document.head && document.head.appendChild(styleEl);

  backBtn.addEventListener('click', () => { if (step > 1) { step--; render(); } });
  nextBtn.addEventListener('click', () => { if (step < TOTAL_STEPS) { step++; render(); } });

  controls.appendChild(backBtn);
  controls.appendChild(indicatorEl);
  controls.appendChild(nextBtn);

  if (boxEl && boxEl.parentNode) {
    boxEl.parentNode.insertBefore(captionEl, boxEl);
    boxEl.parentNode.insertBefore(controls, boxEl.nextSibling);
  }

  render();
})();
