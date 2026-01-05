# Quickstart Guide: Task Creation and UI Enhancement

## Overview
This guide provides a quick overview of the Task Creation and UI Enhancement feature implementation. This feature includes task creation functionality, tag management, export capabilities, analytics dashboard, theme fixes, and logo/favicon integration.

## Prerequisites
- Node.js 18+ and npm/yarn
- Access to backend API
- Next.js 15 development environment
- The WebsiteLogo.png and favicon-32x32.png assets in `/frontend/public/`

## Setup

### 1. Environment Configuration
```bash
# Ensure API URL is configured in environment
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

## Key Components

### 1. Task Creation Dialog
The new task creation functionality replaces the "Coming Soon" placeholder with a full-featured form.

**Location**: `frontend/src/components/TaskCreationDialog.tsx`
**Features**:
- Title field (required)
- Description field (optional)
- Priority selection (high/medium/low)
- Due date picker
- Tag assignment
- Estimated time input
- Category selection

### 2. Tag Management
Users can create and manage tags for task organization.

**Location**: `frontend/src/components/TagManager.tsx`
**Features**:
- Create new tags with color coding
- Assign tags to tasks
- Filter tasks by tags

### 3. Export Functionality
Users can export their tasks in JSON or CSV formats.

**Location**: `frontend/src/components/ExportDialog.tsx`
**Features**:
- Export to JSON or CSV
- Filter by completion status
- Filter by date range
- Filter by tags or priorities

### 4. Analytics Dashboard
Visual representation of task statistics and productivity metrics.

**Location**: `frontend/src/components/analytics/AnalyticsDashboard.tsx`
**Features**:
- Task completion statistics
- Productivity trends
- Category breakdown
- Streak tracking

### 5. Theme Toggle Fix
Improved dark/light mode switching with proper persistence.

**Location**: `frontend/src/contexts/ThemeContext.tsx`
**Features**:
- System preference detection
- Manual theme switching
- Persistence across sessions
- Smooth transitions

### 6. Logo Integration
The AIDO logo is integrated in navigation and auth pages.

**Location**:
- `frontend/src/components/AppLogo.tsx` (Logo component)
- `frontend/src/app/layout.tsx` (Main layout)
- `frontend/src/app/login/page.tsx` (Login page)
- `frontend/src/app/signup/page.tsx` (Signup page)

**Features**:
- Responsive sizing for different contexts
- Proper loading and fallback
- Alt text for accessibility

### 7. Favicon Update
Updated favicon using the provided asset.

**Location**: `frontend/public/favicon-32x32.png` and layout files

## API Integration

### Task Creation
```typescript
// Create a new task
const createTask = async (taskData: TaskCreateRequest) => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(taskData)
  });
  return response.json();
};
```

### Tag Management
```typescript
// Create a new tag
const createTag = async (tagData: TagCreateRequest) => {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(tagData)
  });
  return response.json();
};
```

## UI/UX Guidelines

### Logo Sizing
- **Navbar**: 32px height (responsive width)
- **Login/Signup**: 64px height (responsive width)
- **Mobile**: Scaled appropriately for smaller screens

### Error Handling
- Use toast notifications for API errors
- Position notifications at the top of forms
- Include clear error messages
- Provide close button for user control

### Theme Persistence
- Store theme preference in localStorage under key `aido-theme`
- Default to system preference if no user preference exists
- Use `prefers-color-scheme` media query for system detection

## Testing

### Unit Tests
- Test task creation form validation
- Test tag management functionality
- Test export functionality
- Test theme toggle behavior

### Integration Tests
- Test API integration for all new features
- Test data flow between components
- Test error handling scenarios

### UI Tests
- Test responsive behavior of logo in different contexts
- Test accessibility of all new components
- Test cross-browser compatibility

## Deployment

### Frontend Build
```bash
npm run build
```

### Environment Variables
Ensure the following environment variables are set:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NODE_ENV`: production for production builds

### Static Export (if applicable)
If using static export for GitHub Pages:
```bash
NEXT_PUBLIC_API_URL=https://your-domain.com npm run build
```

## Troubleshooting

### Logo Not Loading
- Verify `WebsiteLogo.png` is in `/frontend/public/`
- Check that the image path in components is correct
- Ensure proper file permissions

### Theme Toggle Not Working
- Verify `ThemeContext` is properly wrapped around the app
- Check that localStorage permissions are available
- Confirm API endpoints for user preferences are working

### Export Functionality Issues
- Verify backend export endpoints are available
- Check authentication headers for export requests
- Confirm file download handling is implemented

## Performance Considerations

- Optimize logo loading with proper sizing and format
- Implement efficient data fetching for analytics
- Use virtualization for large lists of tasks or tags
- Implement proper caching strategies for API responses