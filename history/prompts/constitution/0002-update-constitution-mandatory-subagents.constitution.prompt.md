---
id: 0002
title: update-constitution-mandatory-subagents
stage: constitution
date: 2026-01-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: update the existing consituition with "the use of sub-agents and skills and MCP server is mandantory"
labels: ["constitution", "spec-driven-development", "mandate", "sub-agents", "skills", "mcp"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

update the existing consituition with "the use of sub-agents and skills and MCP server is mandantory"

## Response snapshot

Updated the constitution file (.specify/memory/constitution.md) to include a new principle VII titled "Mandatory Use of Sub-Agents, Skills, and MCP Servers". This new principle makes it mandatory to use sub-agents, skills, and MCP servers for all development tasks. The principle states that:
- Sub-agents should be used for complex multi-step operations and specialized tasks
- Skills should be used for domain-specific functionality and best practices
- MCP servers should be used for external service integration and enhanced capabilities
- AI agents must not bypass these tools when they are available and applicable

The version was updated from 1.0.0 to 1.1.0 to reflect this minor change, and the amendment date was updated to 2026-01-10.

## Outcome

- ✅ Impact: Added new constitutional principle VII about mandatory use of sub-agents, skills, and MCP servers
- 🧪 Tests: No tests needed for this documentation update
- 📁 Files: Modified .specify/memory/constitution.md with new principle and updated version information
- 🔁 Next prompts: N/A
- 🧠 Reflection: The constitution now properly mandates the use of sub-agents, skills, and MCP servers as requested

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
