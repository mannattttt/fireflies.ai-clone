import { MeetingListItem, MeetingDetail, ActionItem, TranscriptSearchResult } from './types';

const API_BASE = '/api';

export const api = {
  async getMeetings(search?: string, dateFrom?: string, dateTo?: string, sort: string = 'desc'): Promise<MeetingListItem[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    params.append('sort', sort);
    
    const res = await fetch(`${API_BASE}/meetings?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch meetings');
    return res.json();
  },

  async getMeeting(id: number): Promise<MeetingDetail> {
    const res = await fetch(`${API_BASE}/meetings/${id}`);
    if (!res.ok) throw new Error('Failed to fetch meeting');
    return res.json();
  },

  async createMeeting(data: any): Promise<MeetingDetail> {
    const res = await fetch(`${API_BASE}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create meeting');
    return res.json();
  },

  async toggleActionItem(id: number): Promise<ActionItem> {
    const res = await fetch(`${API_BASE}/action-items/${id}/toggle`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle action item');
    return res.json();
  },
  
  async searchTranscript(id: number, query: string): Promise<TranscriptSearchResult[]> {
    const res = await fetch(`${API_BASE}/meetings/${id}/transcript/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search transcript');
    return res.json();
  }
};
