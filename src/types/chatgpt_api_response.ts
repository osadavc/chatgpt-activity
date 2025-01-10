export interface ChatItem {
  id: string;
  title: string;
  create_time: string;
  update_time: string;
  mapping: null | any;
  current_node: null | string;
  conversation_template_id: null | string;
  gizmo_id: null | string;
  is_archived: boolean;
  is_starred: null | boolean;
  is_unread: boolean;
  workspace_id: null | string;
  async_status: null | string;
  safe_urls: string[];
  conversation_origin: null | string;
  snippet: null | string;
}

export interface ChatResponse {
  items: ChatItem[];
  total: number;
  limit: number;
  offset: number;
  has_missing_conversations: boolean;
}

export type SavedRawData = Pick<
  ChatItem,
  "create_time" | "update_time" | "id"
>[];
