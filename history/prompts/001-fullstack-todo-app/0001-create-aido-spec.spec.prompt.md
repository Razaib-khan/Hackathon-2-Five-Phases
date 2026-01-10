---
id: 0001
title: create-aido-spec
stage: spec
date: 2026-01-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-fullstack-todo-app
branch: 001-fullstack-todo-app
user: user
command: /sp.specify # AIDO – SpecKit Plus Project Specification Prompt
labels: ["spec", "todo-app", "authentication", "fullstack", "user-isolation"]
links:
  spec: /mnt/d/Hackathon 2 FIve Phases/specs/001-fullstack-todo-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-fullstack-todo-app/spec.md
  - specs/001-fullstack-todo-app/checklists/requirements.md
tests:
  - none
---

## Prompt

# AIDO – SpecKit Plus Project Specification Prompt

## Role & Objective

You are acting as a **SpecKit Plus Specification Generator**.

Your sole task is to produce a **complete, structured technical specification** for a full-stack application named **AIDO**.

⚠️ **IMPORTANT**
- This prompt is **only** for specification creation.
- Do **not** generate code, commands, configs, or implementation steps.
- Do **not** scaffold, deploy, or execute anything.
- Output must strictly be a **project specification document**.

---

## Mandatory Agentic & MCP Requirements

### MCP Server Usage (Mandatory)
- Use **Context7 MCP Server** to reference **latest official documentation** for all technologies.
- **Exception:** Next.js must remain exactly **version 16.1.1** and must not be upgraded.

### Subagents (Mandatory)
- The specification **must be produced using subagents**.
- Each major responsibility **must** be handled by a dedicated subagent (e.g. auth, backend API, database modeling, frontend architecture, CI/CD, security).
- If a required subagent does **not** already exist, **Claude must define and create it** as part of the specification process.
- The specification must clearly describe:
  - Subagent responsibilities
  - Boundaries between subagents

Subagents are **not optional**.

---

## Project Overview

- **Project Name:** AIDO
- **Project Type:** Full-Stack Todo Application
- **Core Goal:** Authenticated users can manage their own tasks with complete data isolation.

---

## Tech Stack Constraints (Strict)

The specification **must** assume the following stack:

### Frontend
- **Next.js 16.1.1** (mandatory, do not upgrade or downgrade)
- Latest compatible versions of all supporting frontend libraries

### Backend
- **FastAPI** (latest stable)
- **SQLModel** (latest stable)

### Authentication
- **Better Auth** (latest stable)

### Database
- **Neon Serverless PostgreSQL** (latest stable)
  - You have access to Neon MCP as well

---

## Tooling & Environment (Pre-Initialized)

### Frontend
- Folder: `frontend/`
- A dummy **Next.js 16.1.1** application is **already set up**
- Static assets already present:
  - Logo: `frontend/public/AIDOlogo.svg`
  - Favicon: `frontend/public/favicon.ico`

### Backend
- Folder: `backend/`
- **`uv` (Python package manager) is already initialized**
- **`uv venv` virtual environment is already created**
- Specification must assume backend is ready for dependency installation and development

---

## Authentication & User Management Requirements

### User Registration

**Required fields:**
- First Name (required)
- Last Name (required)
- Email (required)
- Password (required)
- Confirm Password (required)

**Rules:**
- All fields are mandatory
- Password and Confirm Password must match
- Email must be unique

---

### User Sign-In

**Required fields:**
- Email (required)
- Password (required)

---

### Password Reset

- Implement a complete **reset password flow** for returning users
- The specification must define:
  - Trigger mechanism
  - Validation rules
  - Security considerations

---

## Task Management Requirements

### Task Fields
- Title (required)
- Description (optional)
- Priority (required)

---

### Task Operations

Authenticated users must be able to:
- Create tasks
- Read/view their own tasks
- Update their own tasks
- Delete their own tasks

---

### User Isolation (Critical Requirement)

- Users must **only** be able to access their own tasks
- No cross-user visibility or access under any circumstance
- The specification must clearly describe enforcement at:
  - Database level
  - API level
  - Authentication and authorization level

---

## Project Structure Requirements

- `frontend/` → Next.js application
- `backend/` → FastAPI application
- Both folders already exist and must be assumed as pre-created

---

## CI/CD & Deployment (Specification Only)

After application completion, the specification must define CI/CD configuration for:

### Frontend Deployment
- Platform: **GitHub Pages**

### Backend Deployment
- Platform: **Hugging Face**

---

### Additional Constraints

- Docker **must** be used
- You have access to:
  - GitHub CLI
  - Hugging Face MCP Server

⚠️ **Specification only**
- No scripts
- No commands
- No execution steps

---

## Specification Output Requirements (SpecKit Plus Standard)

The generated specification must include:
- System architecture overview
- Subagent architecture and responsibility mapping
- Component responsibilities
- Conceptual data models (no code)
- Authentication and authorization flows
- API behavior definitions
- Security and isolation guarantees
- Deployment architecture
- CI/CD workflow description
- Assumptions and constraints

---

## Final Enforcement Rule

🚫 **Do NOT**
- Write code
- Generate configurations
- Provide implementation steps

✅ **DO**
- Produce a **formal, SpecKit Plus–compatible project specification**
- Use **MCP servers and subagents mandatorily**
- Create missing subagents when required

## Response snapshot

Created a comprehensive specification for the AIDO full-stack todo application. The specification includes:

- User Scenarios & Testing section with 3 prioritized user stories:
  1. User Registration and Authentication (P1)
  2. Personal Task Management (P1)
  3. Password Reset (P2)
- Functional Requirements (14 specific requirements covering auth, tasks, security)
- Key Entities (User, Task, Session, PasswordResetToken)
- Success Criteria (6 measurable outcomes)

Also created a quality checklist to validate the specification completeness.

## Outcome

- ✅ Impact: Created complete spec for AIDO todo application with auth and user isolation
- 🧪 Tests: No tests needed for this specification creation
- 📁 Files: Created spec.md and requirements.md in specs/001-fullstack-todo-app/
- 🔁 Next prompts: Ready for planning phase (/sp.plan)
- 🧠 Reflection: Specification covers all required functionality with proper user isolation

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to planning phase
