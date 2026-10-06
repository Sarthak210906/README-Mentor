# Agent Skill: README Mentor (Production V3)
**Skill Name:** `readme-mentor`  
**Version:** `3.0.0`  
**Type:** Reusable AI Agent Directive & Workflow Protocol  

---

## 1. Purpose
The purpose of this Agent Skill is to guide an AI agent in producing **accurate, complete, consistent, robust, and project-specific** `README.md` files for software repositories. It ensures that generated documentation strictly adheres to software engineering standards, respects factual project boundaries, and systematically handles unknown or missing information without hallucinating fake technical credentials, packages, or endpoints.

---

## 2. When to Use
Activate this skill whenever the AI agent is requested to:
- Generate a new `README.md` file from scratch using provided project parameters.
- Restructure or modernize an existing or incomplete repository README.
- Audit, review, or evaluate documentation completeness against developer onboarding standards.
- Prepare production-grade documentation for open-source releases or hackathon demonstrations.

---

## 3. Systematic Execution Workflow

When invoked with project metadata, the AI agent must systematically execute the following pipeline:

### Step 1: Ingest & Audit Project Metadata
- Read and extract all provided fields:
  - Project Title & Name
  - Description & Problem Domain
  - Technologies & Frameworks
  - Features & Functional Scope
  - Installation commands & dependencies
  - Execution / Run commands
  - Environment variables & configuration
  - Project directory structure
  - API documentation or route specifications
  - Screenshot / preview placeholders
  - Contribution guidelines & Code of Conduct
  - License information
- **Identify Missing Information:** Explicitly note which critical fields are NOT provided (e.g., missing environment variables, unspecified database ports, unknown license).

### Step 2: Enforce the Anti-Hallucination & Safety Directive
> [!CAUTION]
> **STRICT SAFETY RULE: ZERO FABRICATION**
> The agent must **NEVER invent**:
> - API keys, tokens, client secrets, or auth headers.
> - Passwords, database connection strings, or internal IP addresses.
> - Unverified external URLs, CDN links, or repository links.
> - Shell commands or package manager scripts not supported by the declared tech stack.
> - Dependencies or NPM/PyPI packages not specified by the user.
> - API endpoints, request bodies, or route verbs that were not provided.
> - Project features or business logic beyond the explicit input scope.
> - Fictitious licenses if unstated.
> 
> If any critical configuration or detail is unknown, **explicitly mark it as unconfigured or unknown** (e.g., `_No environment variables specified by author_` or `_License: Not specified (All rights reserved until declared)_`), rather than inventing plausible-sounding defaults.

### Step 3: Construct Standardized Document Sections
Generate the README utilizing the following consistent Markdown hierarchy:

1. **Header & Title (`# <Project Name>`)**
   - Clear, canonical project name as H1.
   - Technology badge line or metadata tags matching provided technologies.
   - Concise tagline summarizing the primary problem solved.

2. **Project Overview / Description (`## About the Project`)**
   - 2–3 concise sentences explaining the problem statement, target audience, and solution approach.
   - Grounded strictly in provided input without extraneous marketing fluff.

3. **Core Features (`## Key Features`)**
   - Bulleted list of every explicitly provided feature.
   - Clear, active-voice descriptions.

4. **Technology Stack (`## Built With` or `## Tech Stack`)**
   - Clean categorical breakdown (e.g., Frontend, Backend, Database) containing *only* the declared technologies.

5. **Prerequisites & Installation (`## Getting Started` -> `### Prerequisites` -> `### Installation`)**
   - Prerequisites list inferred directly from declared technologies (e.g., Node.js >= 18.x for React/Node projects, Python >= 3.10 for Python projects).
   - Step-by-step fenced code blocks with exact installation commands provided in the prompt.
   - If git clone command is absent, provide standard placeholder `git clone <repository-url>`.

6. **Running the Application (`### Running the Project` / `## Usage`)**
   - Exact run commands provided by the user (e.g., `npm run dev`, `python app.py`).
   - Expected local host URL or terminal output indicator (e.g., `Server running on http://localhost:3000`).

7. **Environment Variables & Configuration (`## Configuration`)**
   - If environment variables are provided: Render a clear Markdown table (`Variable`, `Description`, `Example / Default`).
   - Emphasize safety: `> [!WARNING] Never commit actual .env files containing real secrets to version control.`
   - If no variables are needed or provided: Explicitly state: `_No environment variables required for standard setup._`

8. **Project Structure (`## Project Structure`)**
   - If directory layout is provided: Render within an ASCII / tree code block.
   - If not provided: Omit or include high-level standard folder overview marked as optional.

9. **API Specification / Usage Examples (`## API Reference` or `## Usage Guide`)**
   - Document provided endpoints with HTTP verbs, path, and request/response notes.
   - If no API is provided, omit this section to avoid hallucination.

10. **Contributing & Community Guidelines (`## Contributing`)**
    - Standard 5-step open-source contribution steps (Fork, Branch, Commit, Push, Open Pull Request).

11. **License (`## License`)**
    - State declared license (e.g., `Distributed under the MIT License. See LICENSE for details.`).
    - If missing: Explicitly write `_License information has not been specified._`

---

## 4. Final Quality Pre-Flight Checklist
Before emitting the final response, the AI agent must silently verify:
- [x] Title is an exact match to project name in H1 format.
- [x] All declared features and technologies are documented.
- [x] All installation and execution commands are enclosed in language-tagged fenced code blocks.
- [x] Zero invented passwords, secret tokens, or false endpoints exist.
- [x] Formatting uses clean GitHub Flavored Markdown (GFM) with alerts where helpful.
- [x] Incomplete/missing fields are flagged transparently.
