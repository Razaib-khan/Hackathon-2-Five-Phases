// frontend/src/models/tag.ts
// Tag entity model for the AIDO task management application

export interface Tag {
  id: string; // Using string to accommodate UUID format
  user_id: string; // Using string to accommodate UUID format
  name: string;
  color: string; // hex color code
  created_at: string; // ISO 8601 date string
  // Remove updated_at as backend only has created_at in response
  task_count?: number; // number of tasks associated with this tag
  usage_count?: number; // how many times this tag has been used
}

export interface TagCreateRequest {
  name: string;
  color?: string; // hex color code, defaults to #808080 if not provided
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