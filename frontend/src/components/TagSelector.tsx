// frontend/src/components/TagSelector.tsx
// Tag selector component for the AIDO task management application

import React, { useState, useEffect, useRef } from 'react';
import { Tag, TagListResponse } from '@/models/tag';
import { getTags, createTag } from '@/lib/api';

export interface TagSelectorProps {
  selectedTagIds: string[];
  onTagSelectionChange: (tagIds: string[]) => void;
  className?: string;
  placeholder?: string;
  allowCreate?: boolean;
  userId: string; // Required to fetch user's tags
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds = [],
  onTagSelectionChange,
  className = '',
  placeholder = 'Search or select tags...',
  allowCreate = true,
  userId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load tags from API
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const response: TagListResponse = await getTags(userId);
        setAllTags(response.tags || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [userId]);

  const handleSelectTag = (tagId: string) => {
    if (!selectedTagIds.includes(tagId)) {
      onTagSelectionChange([...selectedTagIds, tagId]);
    }
    setInputValue('');
  };

  const handleCreateTag = async () => {
    if (inputValue.trim() && allowCreate) {
      try {
        const newTag = await createTag({
          name: inputValue.trim(),
          color: getRandomColor() // Generate a random color
        });

        setAllTags(prev => [...prev, newTag]);
        handleSelectTag(newTag.id);
        setInputValue('');
      } catch (err) {
        console.error('Error creating tag:', err);
        setError('Failed to create tag');
      }
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagSelectionChange(selectedTagIds.filter(id => id !== tagId));
  };

  const getRandomColor = (): string => {
    const colors = [
      '#ef4444', // red
      '#f97316', // orange
      '#eab308', // yellow
      '#22c55e', // green
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#f43f5e', // rose
      '#84cc16'  // lime
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const filteredTags = allTags.filter(
    tag =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const selectedTagObjects = allTags.filter(tag => selectedTagIds.includes(tag.id));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleSelectTag(filteredTags[0].id);
      } else if (allowCreate) {
        handleCreateTag();
      }
    } else if (e.key === 'Backspace' && inputValue === '' && selectedTagIds.length > 0) {
      // Remove the last selected tag when backspace is pressed in an empty input
      const lastTagId = selectedTagIds[selectedTagIds.length - 1];
      handleRemoveTag(lastTagId);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected tags display */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
        {selectedTagObjects.map(tag => (
          <div
            key={tag.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              border: `1px solid ${tag.color}50`
            }}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-2 text-current hover:opacity-70 focus:outline-none"
              aria-label={`Remove ${tag.name} tag`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div
        className={`flex flex-wrap items-center gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[40px] ${loading ? 'opacity-70' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTagIds.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] outline-none bg-transparent"
          disabled={loading}
        />

        {error && (
          <div className="text-red-500 text-xs absolute top-full mt-1">
            {error}
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (inputValue || filteredTags.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {inputValue && filteredTags.length === 0 && allowCreate && (
            <div
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={handleCreateTag}
            >
              <span className="text-blue-600">Create new tag:</span> "{inputValue}"
            </div>
          )}

          {filteredTags.map(tag => (
            <div
              key={tag.id}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => handleSelectTag(tag.id)}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;