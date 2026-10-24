/**
 * Technology Intelligence Service â€“ Module 6
 * Frontend API calls for technologies, maturity, adoption, opportunities, and competitors.
 */
import { apiRequest } from './api';

export async function fetchTechnologies(params = {}) {
  const query = new URLSearchParams();
  if (params.domain) query.set('domain', params.domain);
  if (params.stage) query.set('stage', params.stage);
  if (params.search) query.set('search', params.search);
  const qStr = query.toString();
  return apiRequest(`/technologies${qStr ? `?${qStr}` : ''}`);
}

export async function fetchEmergingTechnologies(params = {}) {
  const query = new URLSearchParams();
  if (params.min_growth !== undefined) query.set('min_growth', params.min_growth);
  if (params.limit) query.set('limit', params.limit);
  const qStr = query.toString();
  return apiRequest(`/technologies/emerging${qStr ? `?${qStr}` : ''}`);
}

export async function fetchTechnologyDetail(techId) {
  return apiRequest(`/technologies/${techId}`);
}

export async function fetchTechnologyHistory(techId) {
  return apiRequest(`/technologies/${techId}/history`);
}

export async function fetchTechnologyMaturity(techId) {
  return apiRequest(`/technologies/${techId}/maturity`);
}

export async function fetchTechnologyAdoption(techId) {
  return apiRequest(`/technologies/${techId}/adoption`);
}

export async function fetchTechnologyOpportunities(techId) {
  return apiRequest(`/technologies/${techId}/opportunities`);
}

export async function fetchAllOpportunities(params = {}) {
  const query = new URLSearchParams();
  if (params.min_confidence !== undefined) query.set('min_confidence', params.min_confidence);
  const qStr = query.toString();
  return apiRequest(`/api/opportunities${qStr ? `?${qStr}` : ''}`);
}

export async function fetchTechnologyCompetitors(techId, limit = 10) {
  return apiRequest(`/technologies/${techId}/competitors?limit=${limit}`);
}

export async function fetchTechnologySources(techId) {
  return apiRequest(`/technologies/${techId}/sources`);
}

export async function triggerTechnologySync(techId) {
  return apiRequest('/technologies/sync', {
    method: 'POST',
    body: JSON.stringify({ technology_id: techId }),
  });
}

export async function recalculateTechnology(techId) {
  return apiRequest(`/technologies/${techId}/recalculate`, {
    method: 'POST',
  });
}
