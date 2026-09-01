import { Locale, ProjectTranslation } from '../types';
import { arProjects } from './ar';
import { esProjects } from './es';
import { frProjects } from './fr';
import { svProjects } from './sv';
import { trProjects } from './tr';

type ProjectMap = Record<string, ProjectTranslation>;

export const projectTranslations: Partial<Record<Locale, ProjectMap>> = {
  sv: svProjects,
  tr: trProjects,
  es: esProjects,
  fr: frProjects,
  ar: arProjects,
};
