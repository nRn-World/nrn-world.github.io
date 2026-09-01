import { Project } from '../types';
import { isOnlineProjectType } from '../services/engagementService';

export type EngagementMetric = 'downloads' | 'plays' | 'opens';

export function getEngagementMetric(project: Project): EngagementMetric {
  if (project.projectType === 'web_game') return 'plays';
  if (isOnlineProjectType(project.projectType)) return 'opens';
  return 'downloads';
}

export function getEngagementCount(project: Project, playCounts: Record<string, number>): number {
  if (isOnlineProjectType(project.projectType)) {
    return playCounts[project.id] ?? 0;
  }
  return project.downloadsCount ?? 0;
}
