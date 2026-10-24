import { jsPDF } from 'jspdf';

export function exportCopilotIdeasAssessmentPDF({
  session,
  ideas = [],
  projectPlan = null,
  messages = [],
}) {
  const pdf = new jsPDF();
  const margin = 15;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  let y = 20;

  const addText = (value, fontSize = 10, gap = 6) => {
    pdf.setFontSize(fontSize);

    const lines = pdf.splitTextToSize(
      String(value ?? ''),
      usableWidth
    );

    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(line, margin, y);
      y += gap;
    }

    y += 2;
  };

  pdf.setFont('helvetica', 'bold');
  addText('Research Discovery & Innovation Copilot', 16, 8);

  pdf.setFont('helvetica', 'normal');
  addText(`Topic: ${session?.topic || 'Research session'}`, 12);
  addText(`Domain: ${session?.domain || 'Not specified'}`);
  addText(`Current stage: ${session?.current_stage || 'Not specified'}`);

  pdf.setFont('helvetica', 'bold');
  addText('Research Ideas', 14, 7);
  pdf.setFont('helvetica', 'normal');

  if (ideas.length === 0) {
    addText('No research ideas are available in this session.');
  } else {
    ideas.forEach((idea, index) => {
      addText(
        `${index + 1}. ${idea.title || idea.name || 'Research idea'}`,
        11,
        6
      );

      if (idea.description) addText(idea.description);
      if (idea.rationale) addText(`Rationale: ${idea.rationale}`);
      if (idea.score != null) addText(`Score: ${idea.score}`);
    });
  }

  if (projectPlan) {
    pdf.setFont('helvetica', 'bold');
    addText('Project Blueprint', 14, 7);
    pdf.setFont('helvetica', 'normal');

    const planText =
      typeof projectPlan === 'string'
        ? projectPlan
        : JSON.stringify(projectPlan, null, 2);

    addText(planText);
  }

  if (messages.length > 0) {
    pdf.setFont('helvetica', 'bold');
    addText('Conversation Summary', 14, 7);
    pdf.setFont('helvetica', 'normal');

    messages.slice(-10).forEach((message) => {
      const content = message.content || message.message || '';
      if (content) {
        addText(`${message.sender || message.role || 'Message'}: ${content}`);
      }
    });
  }

  const filename = 'copilot-ideas-assessment.pdf';
  pdf.save(filename);

  return { filename };
}
