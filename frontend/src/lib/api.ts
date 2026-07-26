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

  async updateMeeting(id: number, data: { title?: string; date?: string }): Promise<MeetingDetail> {
    const res = await fetch(`${API_BASE}/meetings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update meeting');
    return res.json();
  },

  async deleteMeeting(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/meetings/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete meeting');
  },

  async toggleActionItem(id: number): Promise<ActionItem> {
    const res = await fetch(`${API_BASE}/action-items/${id}/toggle`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to toggle action item');
    return res.json();
  },

  async createActionItem(meetingId: number, text: string, assignee?: string): Promise<ActionItem> {
    const res = await fetch(`${API_BASE}/action-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meeting_id: meetingId, text, assignee: assignee || null }),
    });
    if (!res.ok) throw new Error('Failed to create action item');
    return res.json();
  },

  async deleteActionItem(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/action-items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete action item');
  },
  
  async searchTranscript(id: number, query: string): Promise<TranscriptSearchResult[]> {
    const res = await fetch(`${API_BASE}/meetings/${id}/transcript/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search transcript');
    return res.json();
  },

  async globalSearch(query: string): Promise<TranscriptSearchResult[]> {
    if (!query.trim()) return [];
    const res = await fetch(`${API_BASE}/meetings/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search transcripts');
    return res.json();
  },

  async askFred(meetingId: number, question: string): Promise<string> {
    const res = await fetch(`${API_BASE}/meetings/${meetingId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Failed to query AskFred AI');
    const data = await res.json();
    return data.answer;
  }
};
