import { Project, ProjectCategory } from '../types';

/** All categories a project belongs to. `category` is always the primary one. */
export const projectCategories = (
  project: Pick<Project, 'category' | 'categories'>
): ProjectCategory[] => {
  const extra = project.categories ?? [];
  return [project.category, ...extra.filter((category) => category !== project.category)];
};

/** True when the project should be listed under the given category. */
export const projectInCategory = (
  project: Pick<Project, 'category' | 'categories'>,
  category: ProjectCategory
): boolean => project.category === category || (project.categories ?? []).includes(category);
