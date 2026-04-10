import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

/** Curva "atom" alineada con tokens de motion del DS */
CustomEase.create('atom', '0.625, 0.05, 0, 1');

/** Duraciones (s) — referencia para timelines GSAP */
export const DURATION = {
  quarter: 0.15,
  half: 0.3,
  threeQuarters: 0.45,
  default: 0.6,
} as const;

gsap.defaults({
  ease: 'atom',
  duration: DURATION.default,
});

/**
 * Hover con rotación de etiqueta en `Button` (`[data-hover-rotate]`) fue retirado
 * según el plan del DS; este módulo conserva la base GSAP para el resto de la app.
 */

export { gsap };
