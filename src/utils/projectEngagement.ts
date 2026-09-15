import { Project } from '../types';
import {
  EngagementPayload,
  getLiveEngagementKind,
  getProjectEngagement,
  isOnlineProjectType,
} from '../services/engagementService';

export type EngagementMetric = 'downloads' | 'plays' | 'opens' | 'stars';

export function getEngagementMetric(project: Project): EngagementMetric {
  if (project.projectType === 'web_game') return 'plays';
  if (isOnlineProjectType(project.projectType) && project.downloadOptions.length === 0) {
    return 'opens';
  }
  return 'downloads';
}

export function getEngagementCount(
  project: Project,
  engagement?: EngagementPayload | null
): number {
  const hub = getProjectEngagement(engagement, project.id);
  const metric = getEngagementMetric(project);

  if (metric === 'plays') return hub.plays;
  if (metric === 'opens') return hub.opens;
  return project.downloadsCount ?? 0;
}

export function getDisplayStars(project: Project): number {
  return project.starsCount ?? 0;
}

export { getLiveEngagementKind, isOnlineProjectType };
