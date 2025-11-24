import { Parser } from './lib/Parser.ts';
import { StylesCommon } from './lib/StylesCommon.ts';
import { StylesTheme } from './lib/StylesTheme.ts';
import { StylesLightDark } from './lib/StylesLightDark.ts';
import {TGeneratedVariablesType} from "../types";

export const processPluginOutput = (cssVariables: string, typeVariables?: TGeneratedVariablesType) => {
  const type = typeVariables ?? 'All'

  const { collections } = new Parser(cssVariables);

  const commonStyles = new StylesCommon(collections);
  const themeStyles = new StylesTheme(collections);
  const lightDarkStyles = new StylesLightDark(collections);

  let finalStringStyles = ''

  if (type === 'ALL' || type === 'COMMON') {
    const data = commonStyles.calculateCssFileContent()
    finalStringStyles = finalStringStyles + '/* Common */ \n' + data
  }

  if (type === 'ALL' || type === 'GEN4') {
    if (finalStringStyles.length) {
      finalStringStyles += '\n\n'
    }
    const data = themeStyles.calculateCssFileContent(StylesTheme.suffix.theme.gen4)
    finalStringStyles = finalStringStyles + '/* Gen 4 */ \n' + data
  }

  if (type === 'ALL' || type === 'BLUE') {
    if (finalStringStyles.length) {
      finalStringStyles += '\n\n'
    }
    const data = themeStyles.calculateCssFileContent(StylesTheme.suffix.theme.blue)
    finalStringStyles = finalStringStyles + '/* Blueberry */ \n' + data
  }

  if (type === 'ALL' || type === 'SCHEME') {
    if (finalStringStyles.length) {
      finalStringStyles += '\n\n'
    }
    const data = lightDarkStyles.calculateCssFileContent()
    finalStringStyles = finalStringStyles + '/* Scheme */ \n' + data
  }
  return finalStringStyles;
};
