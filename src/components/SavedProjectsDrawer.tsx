import React from 'react';
import { X, Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { Project } from '../types';
import { useI18n } from '../i18n/context';
import { isOnlineProjectType } from '../services/engagementService';

interface SavedProjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjectIds: string[];
  allProjects: Project[];
  githubSynced?: boolean;
  onSelectProject: (project: Project) => void;
  onRemoveSaved: (projectId: string) => void;
  onClearAll: () => void;
}

export const SavedProjectsDrawer: React.FC<SavedProjectsDrawerProps> = ({
  isOpen,
  onClose,
  savedProjectIds,
  allProjects,
  githubSynced = false,
  onSelectProject,
  onRemoveSaved,
  onClearAll,
}) => {
  const { t, localizeCategory } = useI18n();

  if (!isOpen) return null;

  const savedProjects = allProjects.filter((p) => savedProjectIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0A0A0A] border-l border-white/10 p-6 flex flex-col shadow-2xl relative">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                <Bookmark className="w-5 h-5 fill-blue-400" />
              </div>
              <div>
                <h3 className="font-sora text-lg font-black text-white">{t('savedDrawer.title')}</h3>
                <span className="font-mono text-xs text-white/50">
                  {t(savedProjects.length === 1 ? 'savedDrawer.countOne' : 'savedDrawer.countMany', { count: savedProjects.length })}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of saved projects */}
          <div className="flex-grow overflow-y-auto space-y-3 pr-1">
            {savedProjects.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-white/40 font-mono text-xs">
                <Bookmark className="w-8 h-8 mb-3 opacity-30" />
                <p>{t('savedDrawer.emptyTitle')}</p>
                <p className="mt-1 text-[11px] text-white/30">{t('savedDrawer.emptyHint')}</p>
              </div>
            ) : (
              savedProjects.map((project) => {
                const isOnline = isOnlineProjectType(project.projectType);
                const statLabelKey = isOnline ? 'projectCard.githubStars' : 'projectCard.githubDownloads';
                const statCount = isOnline ? (project.starsCount ?? 0) : project.downloadsCount;

                const openProject = () => {
                  onSelectProject(project);
                  onClose();
                };

                return (
                  <div
                    key={project.id}
                    className="p-3.5 rounded-xl bg-[#121212] border border-white/5 hover:border-blue-500/40 transition-all flex flex-col gap-2 group shadow-md shadow-black/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div onClick={openProject} className="cursor-pointer flex-grow">
                        <h4 className="font-sora text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                          {project.name}
                        </h4>
                        <span className="font-mono text-[11px] text-white/50">
                          {localizeCategory(project.category)}
                        </span>
                        <span className="font-mono text-[10px] text-blue-300/80 mt-0.5 block">
                          {githubSynced
                            ? t(statLabelKey, { count: statCount.toLocaleString() })
                            : '…'}
                        </span>
                      </div>

                      <button
                        onClick={() => onRemoveSaved(project.id)}
                        className="text-white/40 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title={t('savedDrawer.remove')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-white/5 mt-1">
                      <button
                        onClick={openProject}
                        className="text-xs font-mono text-blue-400/90 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{t('savedDrawer.viewDetails')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer of Drawer */}
          {savedProjects.length > 0 && (
            <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-4">
              <button
                onClick={onClearAll}
                className="text-xs font-mono text-white/50 hover:text-red-400 transition-colors cursor-pointer"
              >
                {t('savedDrawer.clearAll')}
              </button>

              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/15 text-white px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                {t('savedDrawer.close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
