export interface Participant {
  id: number;
  name: string;
  email: string;
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker_name: string;
  start_time: number;
  end_time: number;
  text: string;
  order_index: number;
}

export interface TranscriptSearchResult {
  segment_id: number;
  meeting_id: number;
  order_index: number;
  speaker_name: string;
  start_time: number;
  text: string;
  match_start: number;
  match_end: number;
}

export interface Summary {
  id: number;
  meeting_id: number;
  overview_text: string;
  generated_at: string;
}

export interface KeyTopic {
  id: number;
  meeting_id: number;
  topic_text: string;
  order_index: number;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  text: string;
  assignee: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface MeetingListItem {
  id: number;
  title: string;
  date: string;
  duration_seconds: number;
  created_at: string;
  participants: Participant[];
  action_item_count: number;
  has_summary: boolean;
}

export interface MeetingDetail {
  id: number;
  title: string;
  date: string;
  duration_seconds: number;
  media_url: string | null;
  created_at: string;
  updated_at: string;
  participants: Participant[];
  transcript_segments: TranscriptSegment[];
  summary: Summary | null;
  key_topics: KeyTopic[];
  action_items: ActionItem[];
}
