import type { Variants } from "motion/react";

/**
 * Helpers de animação do DNEX DS.
 * O pacote "motion" (Framer Motion) respeita prefers-reduced-motion quando
 * envolvemos a árvore em <MotionConfig reducedMotion="user"> (ver App/showcase).
 *
 * IMPORTANTE (motion v11): NÃO usar `Transition["ease"]` como tipo — tipar
 * easing como tupla [number,number,number,number] para o build TS compilar.
 */

export const easeSoft: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Aparece subindo — uso geral em blocos ao entrar no viewport. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeSoft },
  },
};

/** Aparece com leve escala — cards e mockups. */
export const fadeScale: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: easeSoft },
  },
};

/** Container que escalona os filhos (stagger). */
export const staggerContainer = (
  stagger = 0.08,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Props padrão para revelar ao rolar — passe para <motion.div {...inView}>. */
export const inView = {
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, amount: 0.25 },
};
