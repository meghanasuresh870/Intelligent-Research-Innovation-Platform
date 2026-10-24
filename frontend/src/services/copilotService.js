/**
 * Research Discovery & Innovation Copilot Client Service.
 * Uses the existing API service and JWT authentication.
 */

import { apiRequest } from './api';

export const copilotService = {
  async createSession({
    topic,
    title,
    domain = 'Artificial Intelligence',
    user_level = 'Beginner',
    skills = [],
    resources = '',
  }) {
    const formattedResources =
      typeof resources === 'object' && resources !== null
        ? resources
        : resources
          ? { description: String(resources) }
          : {};

    return apiRequest('/api/copilot/sessions', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        title,
        domain,
        user_level,
        skills,
        resources: formattedResources,
      }),
    });
  },

  async listSessions() {
    return apiRequest('/api/copilot/sessions');
  },

  async getSession(sessionId) {
    return apiRequest(
      `/api/copilot/sessions/${encodeURIComponent(sessionId)}`
    );
  },

  async deleteSession(sessionId) {
    return apiRequest(
      `/api/copilot/sessions/${encodeURIComponent(sessionId)}`,
      { method: 'DELETE' }
    );
  },

  async chat({ session_id, message, stage = null, options = {} }) {
    return apiRequest('/api/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({
        session_id,
        message,
        stage,
        options,
      }),
    });
  },

  async selectIdea(sessionId, ideaId, constraints = '') {
    return apiRequest(
      `/api/copilot/sessions/${encodeURIComponent(sessionId)}/select-idea`,
      {
        method: 'POST',
        body: JSON.stringify({
          idea_id: ideaId,
          constraints,
        }),
      }
    );
  },

  async exportSession(sessionId) {
    return apiRequest(
      `/api/copilot/sessions/${encodeURIComponent(sessionId)}/export`
    );
  },
};
