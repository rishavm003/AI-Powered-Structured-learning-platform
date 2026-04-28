import type { Day, RoadmapConfig } from '../types';

/**
 * Generates a well-formatted Markdown string from the roadmap and triggers download.
 */
export function exportRoadmapToMarkdown(roadmap: Day[], config: RoadmapConfig): void {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let md = `# ${config.topic} — ${config.days}-Day Learning Roadmap\n\n`;
  md += `> **Depth:** ${config.depth} | **Hours/day:** ${config.hoursPerDay} | **Generated:** ${date}\n\n`;
  md += `## Summary\n\n`;
  md += `${config.days} days covering **${config.topic}** at **${config.depth}** level, `;
  md += `with ${config.hoursPerDay} hour${config.hoursPerDay !== 1 ? 's' : ''} of study per day.\n\n`;
  md += `---\n\n`;

  for (const day of roadmap) {
    md += `## Day ${day.dayNumber}: ${day.title}\n\n`;

    if (day.goals.length > 0) {
      md += `**Goals:**\n\n`;
      for (const goal of day.goals) {
        md += `- ${goal}\n`;
      }
      md += '\n';
    }

    if (day.subtopics.length > 0) {
      md += `**Subtopics:**\n\n`;
      md += `| Topic | Description | Estimated Time |\n`;
      md += `|-------|-------------|----------------|\n`;
      for (const s of day.subtopics) {
        const desc = s.description.replace(/\|/g, '\\|');
        md += `| ${s.name} | ${desc} | ${s.estimatedMinutes} min |\n`;
      }
      md += '\n';
    }

    if (day.resources && day.resources.length > 0) {
      md += `**Resources:**\n\n`;
      for (const r of day.resources) {
        md += `- [${r.title}](${r.url}) *(${r.type})*\n`;
      }
      md += '\n';
    }

    md += `---\n\n`;
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.topic.replace(/\s+/g, '-').toLowerCase()}-roadmap.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
