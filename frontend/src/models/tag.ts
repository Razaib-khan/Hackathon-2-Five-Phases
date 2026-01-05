// frontend/src/models/tag.ts
// Tag entity model for the AIDO task management application

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string; // hex color code
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  task_count?: number; // number of tasks associated with this tag
  usage_count?: number; // how many times this tag has been used
}

export interface TagCreateRequest {
  name: string;
  color?: string; // hex color code, defaults to random color if not provided
}

export interface TagUpdateRequest {
  name?: string;
  color?: string; // hex color code
}

export interface TagFilterOptions {
  search?: string; // search term for tag name
}

export interface TagListResponse {
  tags: Tag[];
  total: number;
  page?: number;
  limit?: number;
}