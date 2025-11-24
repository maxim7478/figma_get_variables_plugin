import type { Declaration } from '../types/index.ts';
import { OKLCHColor } from './OKLCHColor.ts';
import { Styles } from './Styles.ts';

export class StylesCommon extends Styles<never> {
  firstLine =
    '/* stylelint-disable @stylistic/max-line-length, declaration-block-no-duplicate-custom-properties */';

  processedCollectionNames = [
    Styles.collectionNames.ENGENEERING,
    Styles.collectionNames.MEASURE,
    Styles.collectionNames.TYPOGRAPHY,
    Styles.collectionNames.GENERATED,
  ];

  #palette = {
    range: 20,
    length: 10,
  };

  #oklch = {
    lightness: 50,
    chroma: 0.2,
  };

  #subColorSemitransparentNamespaces = ['royal-navy-blue'];

  get additionalMappedDeclarations() {
    this.#generatedColors
      .sort(this.sortDeclarations)
      .forEach((color) => {
        const isIncluded = this.rawDeclarations.find(({ property }) => property === color.property);
        if (!isIncluded) {
          console.log(this.rawDeclarations)
          console.log(color)
          throw new Error(`Generated color ${color.property} is missing in original styles`);
        }
      });

    return this.#generatedColors;
  }

  mapDeclaration(declaration: Declaration) {
    return declaration;
  }

  get #generatedColors() {
    return this.#baseColors
      .reduce((acc, baseColor) => {
        const color = new OKLCHColor(baseColor, {
          paletteLength: this.#palette.length,
        });

        color.tints.forEach((subColor) => {
          acc.push({
            property: subColor.cssVariableName,
            value: subColor.oklch,
          });

          if (this.#subColorSemitransparentNamespaces.includes(color.namespace)) {
            subColor.semitransparents.forEach((subColor) => {
              acc.push({
                property: subColor.cssVariableName,
                value: subColor.oklch,
              });
            });
          }
        });

        return acc;
      }, [] as { property: string; value: string }[]);
  }

  get #baseColors() {
    const hueStep = 360 / this.#palette.range;

    return Array.from({ length: this.#palette.range }, (_, i) => {
      return {
        lightness: this.#oklch.lightness,
        chroma: this.#oklch.chroma,
        hue: i * hueStep,
      };
    });
  }
}
