import type { Declaration } from '../types/index.ts';
import { Styles } from './Styles.ts';

export class StylesTheme extends Styles<string> {
  firstLine = '@import url("./_common.css");';

  processedCollectionNames = [Styles.collectionNames.SEMANTIC];

  mapDeclaration({ property, value }: Declaration, theme: string) {
    if (!property.includes(theme)) {
      return null;
    }
    return { property: property.replace(theme, ''), value };
  }
}
