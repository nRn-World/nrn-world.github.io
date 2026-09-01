import { TranslationDictionary, TranslationValue } from '../types';

export function deepMerge(
  base: TranslationDictionary,
  override: TranslationDictionary
): TranslationDictionary {
  const result: TranslationDictionary = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const baseValue = result[key];
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === 'object' &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMerge(baseValue as TranslationDictionary, value as TranslationDictionary);
    } else {
      result[key] = value as TranslationValue;
    }
  }

  return result;
}
