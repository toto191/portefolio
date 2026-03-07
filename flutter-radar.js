/* ═══════════════════════════════════════════════════════════════
   flutter-radar.js
   Dessin du radar de veille multi-canaux sur <canvas>
   Palette rétro-futuriste terracotta / brun
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Configuration ── */
  const FV_RADAR_CONFIG = {
    canvasId: 'fv-radar-canvas',
    axes: [
      { label: 'Profondeur',  value: 0.90 },  // Medium — articles détaillés
      { label: 'Fréquence',   value: 0.75 },  // 1-4×/semaine
      { label: 'Visuel',      value: 0.85 },  // TikTok
      { label: 'Technique',   value: 0.95 },  // YouTube officiel
      { label: 'Inspiration', value: 0.80 },  // Cas d'usage
    ],
    levels:   5,
    padding:  55,
    colors: {
      grid:    'rgba(116, 98, 94, 0.30)',
      gridAlt: 'rgba(116, 98, 94, 0.12)',
      area:    'rgba(231, 84, 39, 0.18)',
      stroke:  'rgba(231, 84, 39, 0.85)',
      dot:     '#e75427',
      label:   '#dacabe',
      level:   'rgba(116, 98, 94, 0.55)',
    },
    animDuration: 1400,
  };

  /* ── Utilitaires ── */
  function fvPolygonPoint(cx, cy, r, angleRad) {
    return {
      x: cx + r * Math.sin(angleRad),
      y: cy - r * Math.cos(angleRad),
    };
  }

  /* ── Dessin du fond grille ── */
  function fvDrawGrid(ctx, cx, cy, maxR, axes, levels, colors) {
    const n     = axes.length;
    const step  = (Math.PI * 2) / n;

    // Niveaux concentriques
    for (let l = 1; l <= levels; l++) {
      const r = (maxR / levels) * l;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const pt = fvPolygonPoint(cx, cy, r, step * i);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else          ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.strokeStyle = l === levels ? colors.grid : colors.gridAlt;
      ctx.lineWidth   = l === levels ? 1.5 : 0.8;
      ctx.stroke();

      // Valeur du niveau
      if (l < levels) {
        const pct = Math.round((l / levels) * 100);
        ctx.font        = '9px "Share Tech Mono", monospace';
        ctx.fillStyle   = colors.level;
        ctx.textAlign   = 'left';
        ctx.fillText(pct + '%', cx + 4, cy - (maxR / levels) * l + 4);
      }
    }

    // Axes radiaux
    for (let i = 0; i < n; i++) {
      const outer = fvPolygonPoint(cx, cy, maxR, step * i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(outer.x, outer.y);
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    }
  }

  /* ── Labels axes ── */
  function fvDrawLabels(ctx, cx, cy, maxR, axes, colors) {
    const n    = axes.length;
    const step = (Math.PI * 2) / n;
    const gap  = 18;

    ctx.font      = 'bold 11px "Rajdhani", sans-serif';
    ctx.fillStyle = colors.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    axes.forEach((axis, i) => {
      const angle = step * i;
      const pt    = fvPolygonPoint(cx, cy, maxR + gap, angle);

      // Ajustement alignement horizontal
      if      (pt.x < cx - 5) ctx.textAlign = 'right';
      else if (pt.x > cx + 5) ctx.textAlign = 'left';
      else                     ctx.textAlign = 'center';

      ctx.fillText(axis.label, pt.x, pt.y);
    });
  }

  /* ── Zone de données ── */
  function fvDrawArea(ctx, cx, cy, maxR, axes, progress, colors) {
    const n    = axes.length;
    const step = (Math.PI * 2) / n;

    ctx.beginPath();
    axes.forEach((axis, i) => {
      const r  = maxR * axis.value * progress;
      const pt = fvPolygonPoint(cx, cy, r, step * i);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else          ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    // Remplissage
    ctx.fillStyle = colors.area;
    ctx.fill();

    // Contour
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Points sommets
    axes.forEach((axis, i) => {
      const r  = maxR * axis.value * progress;
      const pt = fvPolygonPoint(cx, cy, r, step * i);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.dot;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(231, 84, 39, 0.35)';
      ctx.lineWidth   = 1;
      ctx.stroke();
    });
  }

  /* ── Titre radar ── */
  function fvDrawTitle(ctx, cx, canvasH) {
    ctx.font        = '10px "Share Tech Mono", monospace';
    ctx.fillStyle   = 'rgba(116, 98, 94, 0.70)';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('// RADAR DE VEILLE', cx, canvasH - 6);
  }

  /* ── Animation avec easing ── */
  function fvAnimateRadar(canvas, cfg) {
    const ctx     = canvas.getContext('2d');
    const W       = canvas.width;
    const H       = canvas.height;
    const padding = cfg.padding;
    const cx      = W / 2;
    const cy      = H / 2;
    const maxR    = Math.min(W, H) / 2 - padding;

    const startTime = performance.now();

    function draw(now) {
      const elapsed  = now - startTime;
      const raw      = Math.min(elapsed / cfg.animDuration, 1);
      // ease-out quint
      const progress = 1 - Math.pow(1 - raw, 5);

      ctx.clearRect(0, 0, W, H);

      fvDrawGrid(ctx, cx, cy, maxR, cfg.axes, cfg.levels, cfg.colors);
      fvDrawLabels(ctx, cx, cy, maxR, cfg.axes, cfg.colors);
      fvDrawArea(ctx, cx, cy, maxR, cfg.axes, progress, cfg.colors);
      fvDrawTitle(ctx, cx, H);

      if (raw < 1) requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  /* ── Init (au scroll via IntersectionObserver) ── */
  function fvInitRadar() {
    const canvas = document.getElementById(FV_RADAR_CONFIG.canvasId);
    if (!canvas || !canvas.getContext) return;

    // DPR pour écrans retina
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const size = Math.min(rect.width || 300, 300);

    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';
    canvas.getContext('2d').scale(dpr, dpr);

    // Déclencher l'animation quand le canvas est visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fvAnimateRadar(canvas, FV_RADAR_CONFIG);
            observer.unobserve(canvas);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(canvas);
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fvInitRadar);
  } else {
    fvInitRadar();
  }
})();