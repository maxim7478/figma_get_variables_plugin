import type { Collections } from '../types/index.ts';

export class Parser {
  #fileContent: string;

  constructor(fileContent: string) {
    this.#fileContent = fileContent;
  }

  get collections() {
    const splitted = this.#fileContent
      .split('\n')
      .map(Parser.#trim);

    const { collections } = splitted.reduce((acc, line) => {
      if (line.startsWith('/*')) {
        acc.currentCollection = Parser.#parseCSSLineAsCollection(line);
        acc.collections[acc.currentCollection] = [];
      }

      if (line.startsWith('--')) {
        const { property, value } = Parser.#parseCSSLineAsDeclaration(line);
        if (value) {
          acc.collections[acc.currentCollection].push({ property, value });
        }
      }

      return acc;
    }, {
      collections: {},
      currentCollection: '',
    } as {
      collections: Collections;
      currentCollection: string;
    });

    return collections;
  }

  static #trim(string: string) {
    return string.trim();
  }

  static #parseCSSLineAsCollection(line: string) {
    return (line.match(/([a-z]|\s)+/gi)?.[0] || '').toLowerCase().trim();
  }

  static #parseCSSLineAsDeclaration(line: string) {
    const [property, value] = line
      .split(':')
      .map(s => Parser.#trim(s).replaceAll(/;|-rem/g, ''));

    return {
      property,
      value: value.endsWith('px') ? '' : value,
    };
  }
}
