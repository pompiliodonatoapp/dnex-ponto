/**
 * Entrada distribuível do @dnex/ds.
 *
 * O CSS é importado aqui para que a build de biblioteca o processe (Tailwind
 * v4) e gere `dist/styles.css`. Consumidores podem importá-lo explicitamente
 * por `@dnex/ds/styles`; a importação também mantém o CSS associado ao entry
 * principal para bundlers que não tratam a condição `style` do package.json.
 */
import "./styles/theme.css";

export * from "./index";
