
import { Project, Role, PhaseTemplate } from './types';
import { getGeminiResponse } from './services/gemini';
import { PHASE_TEMPLATES } from './constants';
import { SYNONYM_MAP, TAG_WEIGHTS } from './taxonomy';
import { EDU_LEVELS } from './edu_constants';

export const RoleEngine = {
  /**
   * Extracts taxonomy tags from a corpus using regular expressions.
   */
  extractTags: (corpus: string, project: Project): string[] => {
    const tags = new Set<string>();

    // 1. Run SYNONYM_MAP on the general corpus
    SYNONYM_MAP.forEach(({ pattern, tag }) => {
      if (pattern.test(corpus)) {
        tags.add(tag);
      }
    });

    // 2. Add specific EDU Level and Mode tags if present
    if (project.eduLevel) {
      const levelConfig = EDU_LEVELS.find(l => l.id === project.eduLevel);
      if (levelConfig) {
        tags.add(levelConfig.id);
        levelConfig.default_tags.forEach(t => tags.add(t));
      }
    }

    if (project.eduMode) {
      tags.add(project.eduMode);
    }

    // 3. Logic-based tags
    if (project.channel === 'IG') tags.add('ig');
    if (project.productType === 'App') {
      tags.add('automation');
      tags.add('react-ui');
      tags.add('testing-qa');
    }

    return Array.from(tags);
  },

  /**
   * Taxonomy-driven scoring mode.
   * Scores roles based on extracted taxonomy tags and weighted rules.
   */
  selectRoles: (project: Project, availableRoles: Role[], maxRoles?: number | null): string[] => {
    const corpus = `${project.name} ${project.goal} ${project.targetAudience} ${project.constraints} ${project.existingAssets}`.toLowerCase();
    const extractedTags = RoleEngine.extractTags(corpus, project);

    // Get boost configuration for education levels
    const levelConfig = EDU_LEVELS.find(l => l.id === project.eduLevel);
    const boostMap = levelConfig?.tag_boost || {};

    const roleScores = availableRoles.map(role => {
      let score = 0;

      // Calculate weighted score based on matched tags
      (role.capabilities || []).forEach(cap => {
        if (extractedTags.includes(cap)) {
          let weight = TAG_WEIGHTS[cap] || 1;

          // Apply tag boost if specified for the selected education level
          if (boostMap[cap as keyof typeof boostMap]) {
            weight *= boostMap[cap as keyof typeof boostMap] as number;
          }

          score += weight;
        }
      });

      // Template owner bonus
      const isTemplateOwner = Object.values(PHASE_TEMPLATES).some(t => t.ownerRole === role.id);
      if (isTemplateOwner) score += 5;

      return { id: role.id, score };
    });

    // Hard-includes Logic
    const hardIncluded = new Set<string>(['GM_PM']); // GM_PM is always in

    if (extractedTags.includes('kvkk')) {
      hardIncluded.add('COMPLIANCE_OFFICER');
    }
    if (extractedTags.includes('ig')) {
      hardIncluded.add('VISUAL_DIRECTOR');
      hardIncluded.add('GROWTH_PLANNER');
    }
    if (project.productType === 'App') {
      hardIncluded.add('QA_GOD');
    }
    if (extractedTags.includes('denetim') || project.eduMode === 'compliance_pack') {
      hardIncluded.add('CONTENT_ENGINEER');
    }

    // Selection logic
    const sorted = roleScores.sort((a, b) => b.score - a.score);

    let limit = 12; // default
    if (maxRoles && maxRoles > 0) {
      limit = maxRoles;
    }

    const selected = new Set<string>(hardIncluded);

    for (const r of sorted) {
      if (selected.size >= limit) break;
      selected.add(r.id);
    }

    // Ensure minimum 5 roles
    if (selected.size < 5) {
      for (const r of sorted) {
        if (selected.size >= 5) break;
        selected.add(r.id);
      }
    }

    return Array.from(selected);
  },

  /**
   * Derives consulted and informed roles from the selected roles pool for a specific phase.
   */
  getPhaseInvolvement: (ownerRole: string, selectedRoleIds: string[]): { consulted: string[], informed: string[] } => {
    const candidates = selectedRoleIds.filter(id => id !== ownerRole);
    const consulted = candidates.filter(id => id !== 'GM_PM').slice(0, 6);
    const informed = selectedRoleIds.filter(id => id === 'GM_PM' || !consulted.includes(id)).slice(0, 12);

    return { consulted, informed };
  }
};
