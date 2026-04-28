import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Day, RoadmapConfig } from '../types';

function buildPDFContent(roadmap: Day[], config: RoadmapConfig): HTMLElement {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const wrapper = document.createElement('div');
  wrapper.id = 'pdf-target';
  wrapper.style.cssText = `
    position: absolute; left: -9999px; top: 0;
    width: 794px; padding: 40px;
    font-family: Inter, system-ui, sans-serif;
    background: #ffffff; color: #111827;
    font-size: 13px; line-height: 1.6;
  `;

  let html = `
    <h1 style="font-size:22px;font-weight:800;margin:0 0 6px;color:#4f46e5">
      ${config.topic}
    </h1>
    <p style="color:#6b7280;margin:0 0 4px;font-size:12px">
      ${config.days}-Day Roadmap &nbsp;·&nbsp; ${config.depth} level
      &nbsp;·&nbsp; ${config.hoursPerDay}h/day &nbsp;·&nbsp; Generated ${date}
    </p>
    <hr style="border:none;border-top:2px solid #e5e7eb;margin:16px 0" />
  `;

  for (const day of roadmap) {
    html += `
      <div style="margin-bottom:24px;page-break-inside:avoid">
        <h2 style="font-size:15px;font-weight:700;color:#1f2937;margin:0 0 6px;
                   background:#f3f4f6;padding:6px 10px;border-radius:6px;
                   border-left:4px solid #4f46e5">
          Day ${day.dayNumber}: ${day.title}
        </h2>
    `;

    if (day.goals.length > 0) {
      html += `<p style="font-weight:600;margin:8px 0 4px;color:#374151">Goals:</p><ul style="margin:0 0 8px;padding-left:20px">`;
      for (const goal of day.goals) {
        html += `<li style="color:#4b5563;margin-bottom:2px">${goal}</li>`;
      }
      html += `</ul>`;
    }

    if (day.subtopics.length > 0) {
      html += `<p style="font-weight:600;margin:8px 0 4px;color:#374151">Subtopics:</p>`;
      html += `<table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f9fafb">
            <th style="text-align:left;padding:4px 8px;border:1px solid #e5e7eb;color:#6b7280">Topic</th>
            <th style="text-align:left;padding:4px 8px;border:1px solid #e5e7eb;color:#6b7280">Description</th>
            <th style="text-align:right;padding:4px 8px;border:1px solid #e5e7eb;color:#6b7280">Time</th>
          </tr>
        </thead>
        <tbody>`;
      for (const s of day.subtopics) {
        html += `
          <tr>
            <td style="padding:4px 8px;border:1px solid #e5e7eb;font-weight:500">${s.name}</td>
            <td style="padding:4px 8px;border:1px solid #e5e7eb;color:#6b7280">${s.description}</td>
            <td style="padding:4px 8px;border:1px solid #e5e7eb;text-align:right;color:#6b7280">${s.estimatedMinutes}m</td>
          </tr>
        `;
      }
      html += `</tbody></table>`;
    }

    html += `</div>`;
  }

  wrapper.innerHTML = html;
  return wrapper;
}

export async function exportRoadmapToPDF(
  roadmap: Day[],
  config: RoadmapConfig
): Promise<void> {
  const element = buildPDFContent(roadmap, config);
  document.body.appendChild(element);

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    // Render each day as a separate canvas chunk for pagination
    const dayDivs = element.querySelectorAll<HTMLElement>('div[style*="margin-bottom"]');
    let yOffset = margin;

    // Render the header first
    const headerEl = element.cloneNode(false) as HTMLElement;
    const headerContent = element.innerHTML.split('<div style="margin-bottom')[0];
    headerEl.innerHTML = headerContent;
    headerEl.style.cssText = element.style.cssText;
    document.body.appendChild(headerEl);

    const headerCanvas = await html2canvas(headerEl, { scale: 2, useCORS: true, logging: false });
    document.body.removeChild(headerEl);

    const headerImgData = headerCanvas.toDataURL('image/png');
    const headerRatio = contentWidth / (headerCanvas.width / 2 * 0.264583);
    const headerHeightMM = (headerCanvas.height / 2 * 0.264583) * headerRatio;
    pdf.addImage(headerImgData, 'PNG', margin, yOffset, contentWidth, headerHeightMM);
    yOffset += headerHeightMM + 4;

    // Render each day block
    for (const div of Array.from(dayDivs)) {
      const canvas = await html2canvas(div, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const ratio = contentWidth / (canvas.width / 2 * 0.264583);
      const imgHeightMM = (canvas.height / 2 * 0.264583) * ratio;

      if (yOffset + imgHeightMM > pageHeight - margin) {
        pdf.addPage();
        yOffset = margin;
      }

      pdf.addImage(imgData, 'PNG', margin, yOffset, contentWidth, imgHeightMM);
      yOffset += imgHeightMM + 4;
    }

    pdf.save(`${config.topic.replace(/\s+/g, '-').toLowerCase()}-roadmap.pdf`);
  } finally {
    document.body.removeChild(element);
  }
}
