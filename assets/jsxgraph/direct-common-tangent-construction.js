/* ============================================================================
 * Constructing the Direct Common Tangents of Two Circles — stepped animation
 * ----------------------------------------------------------------------------
 * Eight steps revealed one at a time with "Back" / "Next" buttons.
 *
 * Interactivity: A and B (the two centres) are free, draggable base points.
 * The radii are FIXED (r = 1 for circle A, R = 3 for circle B). Everything
 * else — the auxiliary circle (R - r), the midpoint I, the connecting circle,
 * the intersection points Q / Q', the contact points and both common tangents —
 * is DERIVED and recomputes as you drag.
 *
 * Method (external centre of similitude): the connecting circle (Thales circle
 * on AB) meets the auxiliary circle (centre B, radius R - r) at Q and Q'.
 * The ray B->Q hits circle B at the contact point T'; the tangent there meets
 * line AB at O and touches circle A at T. T T' is a direct common tangent.
 *
 * Expects a container div with id="jsx-direct-common-tangent-construction".
 * ==========================================================================*/

(function () {
  'use strict';

  JXG.Options.text.useMathJax = true;

  const BOX_ID = 'jsx-direct-common-tangent-construction';
  const TOTAL_STEPS = 8;

  const r = 1, R = 3, rt = R - r;     // small radius, large radius, R - r
  const BLUE = '#1565c0', RED = '#d32f2f', ORANGE = '#e69500';
  const FREE = '#1565c0', TAN = '#1f4ed8', SCAFF = '#9e9e9e';

  const board = JXG.JSXGraph.initBoard(BOX_ID, {
    boundingbox: [-3.2, 5.7, 8.2, -3.2],
    keepaspectratio: true,
    axis: false,
    showCopyright: false,
    showNavigation: false,
    pan: { enabled: false },
    zoom: { wheel: false }
  });

  // ===== CONSTRUCTION =======================================================

  // --- Free centres (draggable) and their fixed-radius circles -------------
  const A = board.create('point', [0, 0], {
    name: 'A', size: 4, strokeColor: FREE, fillColor: FREE,
    label: { offset: [-12, -10], anchorX: 'right', anchorY: 'top' }
  });
  const B = board.create('point', [4, 2], {
    name: 'B', size: 4, strokeColor: FREE, fillColor: FREE,
    label: { offset: [12, -8], anchorX: 'left', anchorY: 'top' }
  });
  const circA = board.create('circle', [A, r], { strokeColor: BLUE, strokeWidth: 2, fillColor: 'none', highlight: false });
  const circB = board.create('circle', [B, R], { strokeColor: RED, strokeWidth: 2, fillColor: 'none', highlight: false });

  // --- Line through the centres, extended ----------------------------------
  const centralLine = board.create('line', [A, B], { strokeColor: '#555', strokeWidth: 1.3, highlight: false });

  // --- Auxiliary circle: centre B, radius R - r ----------------------------
  const auxC = board.create('circle', [B, rt], { strokeColor: RED, strokeWidth: 1.2, fillColor: 'none', highlight: false });

  // radius marker for the auxiliary circle (shown only on its step)
  const nrm = () => {                       // unit normal to AB, biased upward
    let nx = -(B.Y() - A.Y()), ny = (B.X() - A.X());
    const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    if (ny < 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
  };
  const auxRadEnd = board.create('point', [() => B.X() + rt * nrm()[0], () => B.Y() + rt * nrm()[1]],
    { visible: false, name: '' });
  const auxRadSeg = board.create('segment', [B, auxRadEnd], { strokeColor: RED, strokeWidth: 1.4, highlight: false });
  const auxLabel = board.create('text', [
    () => (B.X() + auxRadEnd.X()) / 2 + 0.15, () => (B.Y() + auxRadEnd.Y()) / 2, '\\(R-r\\)'
  ], { fontSize: 14, strokeColor: RED, anchorX: 'left', anchorY: 'middle', highlight: false });

  // --- Midpoint I of AB, with perpendicular-bisector scaffolding ------------
  const I = board.create('midpoint', [A, B], {
    name: 'I', size: 3, strokeColor: '#333', fillColor: '#333',
    label: { offset: [-6, -12], anchorX: 'right', anchorY: 'top' }
  });
  // construction arcs: circles centred A and B with radius |AB| meet on the
  // perpendicular bisector of AB.
  const bisCA = board.create('circle', [A, () => A.Dist(B)], { visible: false });
  const bisCB = board.create('circle', [B, () => A.Dist(B)], { visible: false });
  const iPt = board.create('intersection', [bisCA, bisCB, 0], { name: '', size: 1, strokeColor: SCAFF, fillColor: SCAFF });
  const jPt = board.create('intersection', [bisCA, bisCB, 1], { name: '', size: 1, strokeColor: SCAFF, fillColor: SCAFF });
  const bisArcA = board.create('arc', [A, iPt, jPt], { strokeColor: SCAFF, strokeWidth: 1, dash: 2, highlight: false });
  const bisArcB = board.create('arc', [B, jPt, iPt], { strokeColor: SCAFF, strokeWidth: 1, dash: 2, highlight: false });
  const bisLine = board.create('line', [iPt, jPt], { strokeColor: SCAFF, strokeWidth: 1, dash: 1, highlight: false });

  // --- Connecting circle: centre I, radius IA (= IB) -----------------------
  const connecting = board.create('circle', [I, A], { strokeColor: ORANGE, strokeWidth: 2, dash: 2, fillColor: 'none', highlight: false });

  // --- Q, Q': connecting circle  ∩  auxiliary circle -----------------------
  // (indices verified headlessly: index 0 = the "upper" point Q.)
  const Q = board.create('intersection', [connecting, auxC, 1], {
    name: 'Q', size: 3, strokeColor: '#7b1fa2', fillColor: '#7b1fa2',
    label: { offset: [8, 8], anchorX: 'left', anchorY: 'bottom' }
  });
  const Qp = board.create('intersection', [connecting, auxC, 0], {
    name: "Q'", size: 3, strokeColor: '#7b1fa2', fillColor: '#7b1fa2',
    label: { offset: [10, -8], anchorX: 'left', anchorY: 'top' }
  });

  // --- Contact points on circle B: T' = B + R * unit(B->Q) -----------------
  function onBigCircle(P) {
    return board.create('point', [
      () => B.X() + R * (P.X() - B.X()) / B.Dist(P),
      () => B.Y() + R * (P.Y() - B.Y()) / B.Dist(P)
    ], { visible: false, name: '' });
  }
  const T1p = onBigCircle(Q);    // T'_1
  const T2p = onBigCircle(Qp);   // T'_2

  // --- Tangents at T' (perpendicular to the radius B-T') --------------------
  const radB1 = board.create('line', [B, T1p], { visible: false });
  const radB2 = board.create('line', [B, T2p], { visible: false });
  const tan1 = board.create('perpendicular', [radB1, T1p], { strokeColor: TAN, strokeWidth: 2.4, highlight: false });
  const tan2 = board.create('perpendicular', [radB2, T2p], { strokeColor: TAN, strokeWidth: 2.4, highlight: false });

  // --- O = where the (first) tangent meets line AB -------------------------
  const O = board.create('intersection', [tan1, centralLine], {
    name: 'O', size: 3, strokeColor: '#000', fillColor: '#000',
    label: { offset: [-6, -12], anchorX: 'right', anchorY: 'top' }
  });

  // --- Contact points on circle A (feet of perpendicular from A) -----------
  const T1 = board.create('orthogonalprojection', [A, tan1], {
    name: '', size: 3, strokeColor: TAN, fillColor: '#fff'
  });
  const T2 = board.create('orthogonalprojection', [A, tan2], {
    name: '', size: 3, strokeColor: TAN, fillColor: '#fff'
  });

  // visible contact-point markers + labels (own dynamic-text labels so the
  // primes/subscripts render cleanly via MathJax)
  const T1pDot = board.create('point', [() => T1p.X(), () => T1p.Y()], { name: '', size: 3, strokeColor: TAN, fillColor: '#fff' });
  const T2pDot = board.create('point', [() => T2p.X(), () => T2p.Y()], { name: '', size: 3, strokeColor: TAN, fillColor: '#fff' });
  const lblT1p = board.create('text', [() => T1p.X() - 0.15, () => T1p.Y() + 0.1, "\\(T'_1\\)"], { fontSize: 15, anchorX: 'right', highlight: false });
  const lblT2p = board.create('text', [() => T2p.X() + 0.15, () => T2p.Y() - 0.1, "\\(T'_2\\)"], { fontSize: 15, anchorX: 'left', anchorY: 'top', highlight: false });
  const lblT1 = board.create('text', [() => T1.X() - 0.15, () => T1.Y() + 0.05, '\\(T_1\\)'], { fontSize: 15, anchorX: 'right', highlight: false });
  const lblT2 = board.create('text', [() => T2.X() - 0.1, () => T2.Y() - 0.15, '\\(T_2\\)'], { fontSize: 15, anchorX: 'right', anchorY: 'top', highlight: false });

  // --- Rays B->T' and radii A->T (drawn segments) --------------------------
  const rayBT1 = board.create('segment', [B, T1p], { strokeColor: '#777', strokeWidth: 1.3, highlight: false });
  const rayBT2 = board.create('segment', [B, T2p], { strokeColor: '#777', strokeWidth: 1.3, highlight: false });
  const radAT1 = board.create('segment', [A, T1], { strokeColor: '#777', strokeWidth: 1.3, dash: 2, highlight: false });
  const radAT2 = board.create('segment', [A, T2], { strokeColor: '#777', strokeWidth: 1.3, dash: 2, highlight: false });

  // ===== STEP VISIBILITY ====================================================
  // show(step) returns whether the element is visible at that step.
  const from = n => (s => s >= n);
  const only = n => (s => s === n);

  const staged = [
    { o: auxC, show: from(2) },
    { o: auxRadSeg, show: only(2) }, { o: auxLabel, show: only(2) },
    { o: I, show: from(3) },
    { o: bisArcA, show: only(3) }, { o: bisArcB, show: only(3) }, { o: bisLine, show: only(3) },
    { o: iPt, show: only(3) }, { o: jPt, show: only(3) },
    { o: connecting, show: from(4) },
    { o: Q, show: from(5) },
    { o: rayBT1, show: from(6) }, { o: T1pDot, show: from(6) }, { o: lblT1p, show: from(6) },
    { o: tan1, show: from(7) }, { o: O, show: from(7) }, { o: radAT1, show: from(7) },
    { o: T1, show: from(7) }, { o: lblT1, show: from(7) },
    { o: Qp, show: from(8) }, { o: rayBT2, show: from(8) }, { o: T2pDot, show: from(8) }, { o: lblT2p, show: from(8) },
    { o: tan2, show: from(8) }, { o: radAT2, show: from(8) }, { o: T2, show: from(8) }, { o: lblT2, show: from(8) }
  ];

  const CAPTIONS = [
    'Step 1 of 8 — Draw the two circles: centre A (radius r) and centre B (radius R). Draw the line through the centres, extended.',
    'Step 2 of 8 — Draw the auxiliary circle: centre B, radius R − r.',
    'Step 3 of 8 — Construct the midpoint I of AB.',
    'Step 4 of 8 — Draw the connecting circle: centre I, radius IA (dashed).',
    'Step 5 of 8 — Mark Q, an intersection of the connecting circle and the auxiliary circle.',
    'Step 6 of 8 — Draw the ray from B through Q; it meets circle B at T′₁.',
    'Step 7 of 8 — The tangent at T′₁ meets line AB at O and touches circle A at T₁. The line T₁T′₁ is the first direct common tangent.',
    'Step 8 of 8 — Repeat with the other intersection Q′ to obtain the second direct common tangent T₂T′₂.'
  ];

  let step = 1;
  function render() {
    staged.forEach(({ o, show }) => o.setAttribute({ visible: show(step) }));
    board.update();
    captionEl.textContent = CAPTIONS[step - 1];
    indicatorEl.textContent = step + ' / ' + TOTAL_STEPS;
    backBtn.disabled = step === 1;
    nextBtn.disabled = step === TOTAL_STEPS;
  }

  // ===== CONTROLS ===========================================================
  const boxEl = document.getElementById(BOX_ID);

  const captionEl = document.createElement('div');
  captionEl.style.cssText =
    'font:15px/1.45 system-ui,Segoe UI,Arial,sans-serif;color:#222;' +
    'max-width:680px;margin:0 auto 8px;text-align:center;min-height:60px;';

  const controls = document.createElement('div');
  controls.style.cssText =
    'display:flex;align-items:center;justify-content:center;gap:14px;' +
    'margin-top:10px;font:14px system-ui,Segoe UI,Arial,sans-serif;';

  const btnCss =
    'padding:7px 16px;border:1px solid #1565c0;background:#1565c0;color:#fff;' +
    'border-radius:6px;cursor:pointer;font:inherit;';

  const backBtn = document.createElement('button');
  backBtn.textContent = '◀ Back'; backBtn.style.cssText = btnCss;
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next ▶'; nextBtn.style.cssText = btnCss;
  const indicatorEl = document.createElement('span');
  indicatorEl.style.cssText = 'min-width:46px;text-align:center;color:#555;font-variant-numeric:tabular-nums;';

  [backBtn, nextBtn].forEach(b => b.addEventListener('mousedown', e => e.preventDefault()));
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
