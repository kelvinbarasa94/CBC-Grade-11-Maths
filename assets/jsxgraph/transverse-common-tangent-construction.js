/* ============================================================================
 * Constructing the Transverse Common Tangents of Two Circles — stepped animation
 * ----------------------------------------------------------------------------
 * Eight steps revealed one at a time with "Back" / "Next" buttons.
 *
 * Interactivity: A and B (the two centres) are free, draggable base points.
 * The radii are FIXED (r = 1 for circle A, R = 2 for circle B). Everything
 * else recomputes as you drag.
 *
 * This is the SAME procedure as the direct-common-tangent construction with one
 * change: the auxiliary circle (centre B) has radius R + r instead of R - r.
 * That makes O the INTERNAL centre of similitude, so the two tangents cross
 * between the circles (transverse) rather than running alongside them (direct).
 *
 * Method: the connecting circle (Thales circle on AB) meets the auxiliary
 * circle (centre B, radius R + r) at Q and Q'. The line Q-B hits circle B at the
 * contact point T'; the tangent there meets line AB at O and touches circle A
 * at T. T T' is a transverse common tangent.
 *
 * Expects a surface="jsxboard" slate with id="box_transverse", a caption element
 * with id="caption_transverse", and native PreTeXt Back/Next button slates wired
 * to the globals transverseBack() / transverseNext().
 * ==========================================================================*/

(function () {
  'use strict';

  JXG.Options.text.useMathJax = true;

  const BOX_ID = 'box_transverse';
  const TOTAL_STEPS = 8;

  const r = 1, R = 2, rt = R + r;     // small radius, large radius, R + r
  const BLUE = '#1565c0', RED = '#d32f2f', ORANGE = '#e69500';
  const FREE = '#1565c0', TAN = '#1f4ed8', SCAFF = '#9e9e9e';

  const board = JXG.JSXGraph.initBoard(BOX_ID, {
    boundingbox: [-2.4, 4.9, 9.2, -3.4],
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
  const B = board.create('point', [5, 1], {
    name: 'B', size: 4, strokeColor: FREE, fillColor: FREE,
    label: { offset: [12, -8], anchorX: 'left', anchorY: 'top' }
  });
  const circA = board.create('circle', [A, r], { strokeColor: BLUE, strokeWidth: 2, fillColor: 'none', highlight: false });
  const circB = board.create('circle', [B, R], { strokeColor: RED, strokeWidth: 2, fillColor: 'none', highlight: false });

  // --- Line through the centres, extended ----------------------------------
  const centralLine = board.create('line', [A, B], { strokeColor: '#555', strokeWidth: 1.3, highlight: false });

  // --- Auxiliary circle: centre B, radius R + r ----------------------------
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
    () => (B.X() + auxRadEnd.X()) / 2 + 0.15, () => (B.Y() + auxRadEnd.Y()) / 2, '\\(R+r\\)'
  ], { fontSize: 14, strokeColor: RED, anchorX: 'left', anchorY: 'middle', highlight: false });

  // --- Midpoint I of AB, with perpendicular-bisector scaffolding ------------
  const I = board.create('midpoint', [A, B], {
    name: 'I', size: 3, strokeColor: '#333', fillColor: '#333',
    label: { offset: [-6, -12], anchorX: 'right', anchorY: 'top' }
  });
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
    label: { offset: [0, 12], anchorX: 'middle', anchorY: 'bottom' }
  });
  const Qp = board.create('intersection', [connecting, auxC, 0], {
    name: "Q'", size: 3, strokeColor: '#7b1fa2', fillColor: '#7b1fa2',
    label: { offset: [0, -12], anchorX: 'middle', anchorY: 'top' }
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

  // --- O = where the (first) tangent meets line AB (internal centre) --------
  const O = board.create('intersection', [tan1, centralLine], {
    name: 'O', size: 3, strokeColor: '#000', fillColor: '#000',
    label: { offset: [2, -12], anchorX: 'left', anchorY: 'top' }
  });

  // --- Contact points on circle A (feet of perpendicular from A) -----------
  const T1 = board.create('orthogonalprojection', [A, tan1], { name: '', size: 3, strokeColor: TAN, fillColor: '#fff' });
  const T2 = board.create('orthogonalprojection', [A, tan2], { name: '', size: 3, strokeColor: TAN, fillColor: '#fff' });

  // visible contact markers + dynamic MathJax labels
  const T1pDot = board.create('point', [() => T1p.X(), () => T1p.Y()], { name: '', size: 3, strokeColor: TAN, fillColor: '#fff' });
  const T2pDot = board.create('point', [() => T2p.X(), () => T2p.Y()], { name: '', size: 3, strokeColor: TAN, fillColor: '#fff' });
  const lblT1p = board.create('text', [() => T1p.X() + 0.15, () => T1p.Y() + 0.1, "\\(T'_1\\)"], { fontSize: 15, anchorX: 'left', highlight: false });
  const lblT2p = board.create('text', [() => T2p.X() + 0.15, () => T2p.Y() - 0.1, "\\(T'_2\\)"], { fontSize: 15, anchorX: 'left', anchorY: 'top', highlight: false });
  const lblT1 = board.create('text', [() => T1.X() - 0.1, () => T1.Y() - 0.12, '\\(T_1\\)'], { fontSize: 15, anchorX: 'right', anchorY: 'top', highlight: false });
  const lblT2 = board.create('text', [() => T2.X() - 0.1, () => T2.Y() + 0.12, '\\(T_2\\)'], { fontSize: 15, anchorX: 'right', anchorY: 'bottom', highlight: false });

  // --- Rays Q->B and radii A->T (drawn segments) ---------------------------
  // For transverse, T' lies between Q and B, so the segment Q-B passes through T'.
  const rayBT1 = board.create('segment', [Q, B], { strokeColor: '#777', strokeWidth: 1.3, highlight: false });
  const rayBT2 = board.create('segment', [Qp, B], { strokeColor: '#777', strokeWidth: 1.3, highlight: false });
  const radAT1 = board.create('segment', [A, T1], { strokeColor: '#777', strokeWidth: 1.3, dash: 2, highlight: false });
  const radAT2 = board.create('segment', [A, T2], { strokeColor: '#777', strokeWidth: 1.3, dash: 2, highlight: false });

  // ===== STEP VISIBILITY ====================================================
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
    'Step 2 of 8 — Draw the auxiliary circle: centre B, radius R + r. (For transverse tangents the auxiliary radius is R + r, not R − r.)',
    'Step 3 of 8 — Construct the midpoint I of AB.',
    'Step 4 of 8 — Draw the connecting circle: centre I, radius IA (dashed).',
    'Step 5 of 8 — Mark Q, an intersection of the connecting circle and the auxiliary circle.',
    'Step 6 of 8 — Draw the ray from Q through B; it meets circle B at T′₁.',
    'Step 7 of 8 — The tangent at T′₁ is tangent to circle A at T₁. T₁T′₁ is the first transverse common tangent.',
    'Step 8 of 8 — Repeat with the other intersection Q′ to obtain the second transverse common tangent T₂T′₂.'
  ];

  // ===== STEP STATE + CAPTION ==============================================
  // PreTeXt wiring (no DOM injection — mirrors tangent-construction.js so the
  // slate's reserved aspect box never gains extra nodes / scroll bars):
  //   - board renders into the surface="jsxboard" slate  box_transverse
  //   - the caption renders into an element with id  caption_transverse
  //   - the Back / Next buttons are native PreTeXt  <input type="button">
  //     slates that call the globals  transverseBack() / transverseNext().
  const CAPTION_ID = 'caption_transverse';
  const BACK_ID = 'back_transverse';
  const NEXT_ID = 'next_transverse';

  let step = 1;
  function render() {
    staged.forEach(({ o, show }) => o.setAttribute({ visible: show(step) }));
    board.update();
    const cap = document.getElementById(CAPTION_ID);
    if (cap) cap.textContent = CAPTIONS[step - 1];
    const backBtn = document.getElementById(BACK_ID);
    if (backBtn) backBtn.disabled = step === 1;
    const nextBtn = document.getElementById(NEXT_ID);
    if (nextBtn) nextBtn.disabled = step === TOTAL_STEPS;
  }

  // ===== CONTROLS (called from the PreTeXt html-surface button slates) ======
  function transverseBack() { if (step > 1) { step--; render(); } }
  function transverseNext() { if (step < TOTAL_STEPS) { step++; render(); } }
  window.transverseBack = transverseBack;
  window.transverseNext = transverseNext;

  render();
})();
