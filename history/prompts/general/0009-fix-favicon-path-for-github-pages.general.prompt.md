---
id: 0009
title: Fix Favicon Path for GitHub Pages
stage: general
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: claude
command: fix-favicon-path
labels: ["favicon", "github-pages", "deployment", "frontend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/app/layout.tsx
tests: []
---

# Fix Favicon Path for GitHub Pages

## Issue
Browser console error: "favicon-32x32.png:1 GET https://razaib-khan.github.io/favicon-32x32.png 404 (Not Found)"

## Context
The favicon path was set as an absolute path `/favicon-32x32.png` in layout.tsx, but when deployed to GitHub Pages, the app is served from a subdirectory (razaib-khan.github.io/Hackathon-2-Five-Phases/) due to the basePath configuration in next.config.js.

## Root Cause
- Next.js config sets basePath: '/Hackathon-2-Five-Phases' when GITHUB_PAGES environment variable is set
- Absolute favicon path `/favicon-32x32.png` tries to load from root domain instead of subdirectory
- This causes 404 error as the file exists at razaib-khan.github.io/Hackathon-2-Five-Phases/favicon-32x32.png

## Solution
Changed favicon path from absolute `/favicon-32x32.png` to relative `favicon-32x32.png` in layout.tsx

## Result
- Favicon will now load correctly from the proper subdirectory path
- Eliminates 404 error in browser console
- Respects the basePath configuration for GitHub Pages deployment