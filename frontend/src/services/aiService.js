export async function analyzeResearchPaper(paper, userId = null) {
  if (!paper) {
    throw new Error('Paper data is required for analysis.');
  }

  const cacheKey = `research_analysis_${paper.id || paper.external_id || paper.title}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const abstract = paper.abstract || paper.description || '';
  const result = {
    summary: abstract || 'No abstract is available for this paper.',
    problem: 'Review the paper abstract to identify the research problem.',
    methodology: 'The methodology requires review of the full paper.',
    keyFindings: 'Review the paper results before drawing conclusions.',
    limitations: 'Limitations cannot be confirmed from the available metadata.',
    futureDirections: 'Further directions require reviewing the paper findings.',
    generatedAt: new Date().toISOString(),
    model: 'Metadata-based preview',
    source: paper.source || 'Research database',
    paperTitle: paper.title || 'Untitled paper',
    analysisType: 'metadata_preview'
  };

  localStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}
