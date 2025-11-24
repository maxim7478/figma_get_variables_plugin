import { oklch, formatHex, formatRgb } from 'culori';
import nearestColor from 'nearest-color';
import { colornames } from 'color-name-list';

const COLOR_NAMES_MAP = colornames.reduce((acc, item) => {
  acc[item.name] = item.hex;
  return acc;
}, {} as Record<string, string>);

const ALPHA_RANGE = [0, 1];
const SEMITRANSPARENTS_ALPHA_RANGE = [10, 100] as const;
const TINTS_LIGHTNESS_RANGE = [95, 10] as const;
const SHADES_LIGHTNESS_RANGE = [50, 10] as const;

const getNearestColor = nearestColor.from(COLOR_NAMES_MAP);

const getAlphaForCSSVariable = (alpha: number) => {
  if (alpha > ALPHA_RANGE[0] && alpha < ALPHA_RANGE[1]) {
    return `a${alpha * 100}`;
  } else {
    return ``;
  }
};

export class OKLCHColor {
  #baseColor: {
    lightness: number;
    chroma: number;
    hue: number;
    alpha: number;
  };
  #paletteLength: number;
  namespace: string;

  constructor(
    baseColor: {
      lightness: number;
      chroma: number;
      hue: number;
      alpha?: number;
    },
    options: {
      paletteLength: number;
      namespace?: string;
    },
  ) {
    this.#baseColor = {
      ...baseColor,
      alpha: baseColor.alpha ?? ALPHA_RANGE[1],
    };
    this.#paletteLength = options.paletteLength;
    this.namespace = options.namespace || this.#calculateNamespace();
  }

  get tints() {
    return Array.from({ length: this.#paletteLength }, (_, step) => {
      const lightness = this.#calculateStepValue(step, ...TINTS_LIGHTNESS_RANGE);
      const chroma = this.#calculateChroma(step, true);

      return new OKLCHColor({
        lightness,
        chroma,
        hue: this.#baseColor.hue,
      }, {
        paletteLength: this.#paletteLength,
        namespace: this.namespace,
      });
    });
  }

  get shades() {
    return Array.from({ length: this.#paletteLength }, (_, step) => {
      const lightness = this.#calculateStepValue(step, ...SHADES_LIGHTNESS_RANGE);
      const chroma = this.#calculateChroma(step, false);

      return new OKLCHColor({
        lightness,
        chroma,
        hue: this.#baseColor.hue,
      }, {
        paletteLength: this.#paletteLength,
        namespace: this.namespace,
      });
    });
  }

  get semitransparents(): OKLCHColor[] {
    return Array.from({ length: this.#paletteLength }, (_, step) => {
      const alpha = this.#calculateStepValue(step, ...SEMITRANSPARENTS_ALPHA_RANGE);

      return new OKLCHColor({
        lightness: this.#baseColor.lightness,
        chroma: this.#baseColor.chroma,
        hue: this.#baseColor.hue,
        alpha: alpha / 100,
      }, {
        paletteLength: this.#paletteLength,
        namespace: this.namespace,
      });
    });
  }

  get cssVariableName() {
    return '--'
      + [
        this.namespace,
        100 - Math.round(this.#baseColor.lightness),
        getAlphaForCSSVariable(this.#baseColor.alpha),
      ].filter(Boolean).join('-');
  }

  get hex() {
    return (this.#baseColor.alpha === 1 ? formatHex : formatRgb)(oklch({
      mode: 'oklch' as const,
      l: this.#baseColor.lightness / 100,
      c: this.#baseColor.chroma,
      h: this.#baseColor.hue,
      alpha: this.#baseColor.alpha,
    }));
  }

  get oklch() {
    const lightness = this.#baseColor.lightness.toFixed(1);
    const chroma = this.#baseColor.chroma.toFixed(2);
    const hue = this.#baseColor.hue.toFixed(1);
    const alpha = (this.#baseColor.alpha * 100).toFixed(1);
    return `oklch(${lightness}% ${chroma} ${hue} / ${alpha}%)`;
  }

  #calculateStepValue(step: number, min: number, max: number) {
    return min + (step / (this.#paletteLength - 1)) * (max - min);
  }

  #calculateChroma(step: number, isTint: boolean): number {
    const minChroma = 0.1;
    const maxChroma = this.#baseColor.chroma;
    const middleIndex = Math.floor(this.#paletteLength / 2);
    const normalizedDistance = Math.abs(step - middleIndex) / middleIndex;

    const chromaticness = isTint
      ? maxChroma * (1 - normalizedDistance) // Затухание для tints
      : maxChroma * (Math.cos(normalizedDistance * Math.PI) * 0.5 + 0.5); // Синусоидальное для shades

    return Math.max(minChroma, Math.min(maxChroma, chromaticness));
  }

  #calculateNamespace() {
    return (getNearestColor(this.hex)?.name || '').replaceAll(' ', '-').toLowerCase();
  }
}
