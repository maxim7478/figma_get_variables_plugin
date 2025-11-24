import type { Collections, Declaration } from '../types/index.ts';

export class Styles<T> {
  firstLine = '';

  #collections: Collections;

  static readonly suffix = {
    theme: {
      gen4: '-gen4',
      blue: '-blue',
    },
    lightDark: {
      light: '-lt',
      dark: '-dt',
    },
  };

  static readonly collectionNames = {
    ENGENEERING: 'engeneering',
    MEASURE: 'measure',
    SEMANTIC: 'web semantic',
    TYPOGRAPHY: 'typography',
    GENERATED: 'generated palettes',
  };

  processedCollectionNames: string[] = [];

  constructor(collections: Collections) {
    this.#collections = collections;
  }

  get rawDeclarations() {
    return Object.values(this.processedCollectionNames.reduce((acc, name) => {
      if (this.#collections[name]) {
        acc[name] = this.#collections[name].toSorted(this.sortDeclarations);
      }

      return acc;
    }, {} as Collections)).flat();
  }

  get additionalMappedDeclarations(): Declaration[] {
    return [];
  }

  sortDeclarations(a: Declaration, b: Declaration) {
    return a.property.localeCompare(b.property, undefined, { numeric: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mapDeclaration(declaration: Declaration, ...rest: T[]): Declaration | null {
    return null;
  }

  #stringifyDeclaration({ property, value }: Declaration) {
    return `${property}: ${value};`;
  }

  #getCSSFileContent(declarationStrings: string[], firstLine: string) {
    return firstLine + '\n\n:root {\n  ' + [...new Set(declarationStrings)].join('\n  ') + '\n}\n';
  }

  calculateCssFileContent(...args: T[]) {
    const mappedDeclarations = this.rawDeclarations.reduce(
      (acc, declaration) => {
        const mapped = this.mapDeclaration(declaration, ...args);

        if (mapped) {
          acc.push(this.#stringifyDeclaration(mapped));
        }

        return acc;
      },
      [] as string[],
    );

    return this.#getCSSFileContent(
      [...mappedDeclarations, ...this.additionalMappedDeclarations.map(this.#stringifyDeclaration)],
      this.firstLine,
    );
  }
}
