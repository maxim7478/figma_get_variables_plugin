import type { Declaration } from '../types/index.ts';
import { Styles } from './Styles.ts';

export class StylesLightDark extends Styles<never> {
  firstLine = '/* stylelint-disable @stylistic/max-line-length */';

  processedCollectionNames = [
    Styles.collectionNames.ENGENEERING,
    Styles.collectionNames.SEMANTIC,
    Styles.collectionNames.MEASURE,
    Styles.collectionNames.TYPOGRAPHY,
    Styles.collectionNames.GENERATED,
  ];

  mapDeclaration({ property }: Declaration) {
    if (!property.includes(Styles.suffix.lightDark.light)) {
      return null;
    }

    const substringToRemove = Object.values(Styles.suffix.theme).find((suffix) => {
      return property.includes(suffix);
    }) || '';

    const propertyLt = property.replace(substringToRemove, '');

    return {
      property: propertyLt.replace(Styles.suffix.lightDark.light, ''),
      value: `light-dark(var(${propertyLt}), var(${
        propertyLt.replace(Styles.suffix.lightDark.light, Styles.suffix.lightDark.dark)
      }))`,
    };
  }
}
