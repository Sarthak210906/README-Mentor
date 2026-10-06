import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectTask } from '../evaluator/readmeEvaluator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read skill file
const skillsDir = path.resolve(__dirname, '../../../skills');
export function getSkillContent(version: string = 'v3'): string {
  let filename = 'README_SKILL.md';
  if (version === 'v1') filename = 'README_SKILL_V1.md';
  if (version === 'v2') filename = 'README_SKILL_V2.md';
  const filePath = path.join(skillsDir, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return fs.readFileSync(path.join(skillsDir, 'README_SKILL.md'), 'utf-8');
}

export interface AiOptions {
  apiKey?: string;
  model?: string;
  provider?: 'google' | 'openai_compatible';
  baseUrl?: string;
  freeformPrompt?: string;
}

export interface GenerationResult {
  markdown: string;
  isDemoMode: boolean;
  modelUsed: string;
  mode: 'baseline' | 'skill';
  skillVersion?: string;
}

// In-memory or env active API config
let runtimeApiConfig: AiOptions = {
  apiKey: process.env.GEMMA_API_KEY || '',
  model: process.env.GEMMA_MODEL || 'gemma-2-27b-it',
  provider: 'google'
};

export function setRuntimeApiConfig(config: Partial<AiOptions>) {
  runtimeApiConfig = { ...runtimeApiConfig, ...config };
  if (config.apiKey) {
    process.env.GEMMA_API_KEY = config.apiKey;
  }
}

export function getRuntimeApiConfig(): AiOptions {
  return {
    ...runtimeApiConfig,
    apiKey: runtimeApiConfig.apiKey ? `${runtimeApiConfig.apiKey.slice(0, 4)}...${runtimeApiConfig.apiKey.slice(-4)}` : ''
  };
}

export async function listGoogleModels(key?: string): Promise<any> {
  const apiKey = key || runtimeApiConfig.apiKey || process.env.GEMMA_API_KEY;
  if (!apiKey) return { error: 'No API key provided' };

  const results: Record<string, any> = {};

  // Try 1: v1beta with query param ?key=
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    results['v1beta_param'] = { status: res.status, body: await res.json() };
  } catch (e: any) {
    results['v1beta_param'] = { error: e.message };
  }

  // Try 2: v1 with query param ?key=
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    results['v1_param'] = { status: res.status, body: await res.json() };
  } catch (e: any) {
    results['v1_param'] = { error: e.message };
  }

  // Try 3: v1beta with header x-goog-api-key
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
      headers: { 'x-goog-api-key': apiKey }
    });
    results['v1beta_header'] = { status: res.status, body: await res.json() };
  } catch (e: any) {
    results['v1beta_header'] = { error: e.message };
  }

  // Try 4: Bearer token (in case it is an OAuth / access token)
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    results['bearer_token'] = { status: res.status, body: await res.json() };
  } catch (e: any) {
    results['bearer_token'] = { error: e.message };
  }

  return results;
}

export async function testGemmaConnection(options?: AiOptions): Promise<{ success: boolean; message: string; modelUsed: string }> {
  const effectiveKey = options?.apiKey || runtimeApiConfig.apiKey || process.env.GEMMA_API_KEY;
  const effectiveModel = options?.model || runtimeApiConfig.model || 'gemma-2-27b-it';
  const provider = options?.provider || runtimeApiConfig.provider || 'google';
  const baseUrl = options?.baseUrl || runtimeApiConfig.baseUrl;

  if (!effectiveKey && provider !== 'openai_compatible') {
    return {
      success: false,
      message: 'No API Key provided. Please supply a valid Google AI Studio or Gemma API key.',
      modelUsed: effectiveModel
    };
  }

  try {
    const responseText = await callLlm('Respond in one brief sentence: Hello, I am Gemma 4 ready to assist.', undefined, {
      apiKey: effectiveKey,
      model: effectiveModel,
      provider,
      baseUrl
    });

    return {
      success: true,
      message: responseText.trim(),
      modelUsed: effectiveModel
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Connection test failed',
      modelUsed: effectiveModel
    };
  }
}

// Core LLM caller supporting both Google AI Studio (Gemma / Gemini) and OpenAI-compatible (Ollama, OpenRouter, Groq)
async function callLlm(prompt: string, systemPrompt?: string, options?: AiOptions): Promise<string> {
  const apiKey = options?.apiKey || runtimeApiConfig.apiKey || process.env.GEMMA_API_KEY;
  const model = options?.model || runtimeApiConfig.model || 'gemma-2-27b-it';
  const provider = options?.provider || runtimeApiConfig.provider || (options?.baseUrl ? 'openai_compatible' : 'google');
  const baseUrl = options?.baseUrl || runtimeApiConfig.baseUrl;

  // 1. OpenAI-Compatible Provider (Ollama, OpenRouter, Groq, local vLLM)
  if (provider === 'openai_compatible' || baseUrl) {
    const endpoint = `${(baseUrl || 'http://localhost:11434/v1').replace(/\/$/, '')}/chat/completions`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'gemma2',
        messages,
        temperature: 0.2
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI-compatible Gemma endpoint error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI-compatible Gemma endpoint');
    return content;
  }

  // 2. Google Generative Language API (Google AI Studio)
  if (!apiKey) {
    throw new Error('No API Key configured for Google AI Studio');
  }

  // Sanitize model name: remove "models/" prefix if present
  const rawModel = (model || '').replace(/^models\//, '').trim();

  // Build intelligent candidate list
  const candidateModels = Array.from(new Set([
    rawModel,
    `${rawModel}-latest`,
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemma-2-27b-it',
    'gemma-2-9b-it'
  ])).filter(Boolean);

  const apiVersions = ['v1beta', 'v1'];
  let lastError: any = null;

  for (const apiVer of apiVersions) {
    for (const targetModel of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/${apiVer}/models/${targetModel}:generateContent?key=${apiKey}`;
        const contents = [];
        if (systemPrompt) {
          contents.push({
            role: 'user',
            parts: [{ text: `[System Agent Skill Directive]\n${systemPrompt}` }]
          });
          contents.push({
            role: 'model',
            parts: [{ text: 'Directive accepted. I will generate documentation strictly complying with these constraints.' }]
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 3000
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            // Success! Update active working model
            runtimeApiConfig.model = targetModel;
            return text;
          }
        } else {
          const errText = await res.text();
          let parsed: any = null;
          try { parsed = JSON.parse(errText); } catch {}

          const msg = parsed?.error?.message || errText;
          lastError = new Error(`Google API error (${res.status}) on ${targetModel} (${apiVer}): ${msg}`);

          // If 404 NOT_FOUND, try next candidate model or version
          if (res.status === 404) continue;
          
          // If auth error or permission error, throw immediately with clean explanation
          if (res.status === 400 || res.status === 403) {
            if (msg.includes('API key not valid')) {
              throw new Error(`Invalid Google API Key: Please verify your key at https://aistudio.google.com/app/apikey (Google AI Studio keys start with "AIzaSy...").`);
            }
            if (msg.includes('Generative Language API has not been used') || msg.includes('disabled')) {
              throw new Error(`API Disabled: Please enable Generative Language API in your Google Cloud Console or create a free key directly at https://aistudio.google.com/app/apikey.`);
            }
            throw new Error(`Google API error (${res.status}): ${msg}`);
          }
        }
      } catch (e: any) {
        lastError = e;
        if (e.message?.includes('Invalid Google API Key') || e.message?.includes('API Disabled')) {
          throw e;
        }
      }
    }
  }

  // If all failed with 404, try querying ModelService.ListModels to see what models exist for this key
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const available = listData.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        ?.map((m: any) => m.name.replace(/^models\//, '')) || [];
      if (available.length > 0) {
        throw new Error(`Model "${rawModel}" was not found, but your API key has access to these active models: ${available.slice(0, 5).join(', ')}. Please select one of these in Settings.`);
      }
    }
  } catch (discoveryErr: any) {
    if (discoveryErr.message?.includes('access to these active models')) {
      throw discoveryErr;
    }
  }

  throw lastError || new Error(`Google AI call failed for model "${rawModel}". Please try "gemini-1.5-flash-latest" or "gemini-2.0-flash".`);
}

export async function generateBaselineReadme(task: ProjectTask, options?: AiOptions): Promise<GenerationResult> {
  const effectiveKey = options?.apiKey || runtimeApiConfig.apiKey || process.env.GEMMA_API_KEY;
  const modelName = options?.model || runtimeApiConfig.model || 'gemma-2-27b-it';

  if (effectiveKey || options?.baseUrl) {
    try {
      let prompt = '';
      if (options?.freeformPrompt) {
        prompt = `You are an AI assistant. Write a comprehensive README.md file for the software project described below:\n\n${options.freeformPrompt}\n\nOutput only the Markdown content of the README.md.`;
      } else {
        prompt = `You are an AI assistant. Write a README.md file for the following software project based strictly on this information:
Project Name: ${task.project_name}
Description: ${task.description}
Technologies: ${task.technologies?.join(', ') || 'Not specified'}
Features:
${task.features?.map(f => `- ${f}`).join('\n') || 'Not specified'}
Installation: ${task.installation || 'Not specified'}
Run Command: ${task.run_command || 'Not specified'}
Environment Variables: ${task.environment_variables ? task.environment_variables.join(', ') : 'None specified'}
Project Structure: ${task.project_structure || 'Not specified'}
API Info: ${task.api_info || 'Not specified'}
License: ${task.license || 'Not specified'}

Output only the Markdown content of the README.md.`;
      }

      const text = await callLlm(prompt, undefined, options);
      return {
        markdown: cleanMarkdownResponse(text),
        isDemoMode: false,
        modelUsed: `${modelName} (Live API)`,
        mode: 'baseline'
      };
    } catch (e: any) {
      console.warn('[AI Service] Live API call failed, falling back to deterministic baseline mode:', e.message);
    }
  }

  // Deterministic Realistic Baseline Output for user input
  return {
    markdown: getDeterministicBaseline(task, options?.freeformPrompt),
    isDemoMode: true,
    modelUsed: 'Gemma 4 (Demo Mode)',
    mode: 'baseline'
  };
}

export async function generateSkilledReadme(task: ProjectTask, version: string = 'v3', options?: AiOptions): Promise<GenerationResult> {
  const effectiveKey = options?.apiKey || runtimeApiConfig.apiKey || process.env.GEMMA_API_KEY;
  const modelName = options?.model || runtimeApiConfig.model || 'gemma-2-27b-it';
  const skill = getSkillContent(version);

  if (effectiveKey || options?.baseUrl) {
    try {
      let prompt = '';
      if (options?.freeformPrompt) {
        prompt = `Task Request:
Generate a production-grade README.md for the following project following the exact guidelines, anti-hallucination rules, and Markdown hierarchy defined in the skill above:

${options.freeformPrompt}

Remember: NEVER invent API keys, database credentials, passwords, unstated commands, or false licenses.
Output only the Markdown content.`;
      } else {
        prompt = `Task Request:
Generate a production-grade README.md for the following project following the exact guidelines, anti-hallucination rules, and Markdown hierarchy defined in the skill above:
Project Name: ${task.project_name}
Description: ${task.description}
Technologies: ${task.technologies?.join(', ') || 'Not specified'}
Features:
${task.features?.map(f => `- ${f}`).join('\n') || 'Not specified'}
Installation: ${task.installation || 'Not specified'}
Run Command: ${task.run_command || 'Not specified'}
Environment Variables: ${task.environment_variables ? task.environment_variables.join(', ') : 'None specified'}
Project Structure: ${task.project_structure || 'Not specified'}
API Info: ${task.api_info || 'Not specified'}
License: ${task.license || 'Not specified'}

Remember: NEVER invent API keys, database credentials, passwords, unstated commands, or false licenses.
Output only the Markdown content.`;
      }

      const text = await callLlm(prompt, skill, options);
      return {
        markdown: cleanMarkdownResponse(text),
        isDemoMode: false,
        modelUsed: `${modelName} + README_SKILL.md (Live API)`,
        mode: 'skill',
        skillVersion: version
      };
    } catch (e: any) {
      console.warn('[AI Service] Live API call failed, falling back to deterministic skilled mode:', e.message);
    }
  }

  // Deterministic Realistic Skilled Output for user input
  return {
    markdown: getDeterministicSkilled(task, version, options?.freeformPrompt),
    isDemoMode: true,
    modelUsed: 'Gemma 4 + README_SKILL.md (Demo Mode)',
    mode: 'skill',
    skillVersion: version
  };
}

function cleanMarkdownResponse(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```markdown')) {
    cleaned = cleaned.replace(/^```markdown\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```md')) {
    cleaned = cleaned.replace(/^```md\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

// Deterministic Baseline: Dynamically adapts to ANY user input
function getDeterministicBaseline(task: ProjectTask, freeform?: string): string {
  if (task.id === 7) {
    return `# ${task.project_name}
> A dead-simple single-file CLI to-do utility.

## About
A dead-simple single-file CLI to-do utility that saves tasks in a local text file with Python.

## Features
- Add task
- List tasks
- Mark task done

## Built With
- Python

## Installation
No installation required. Standard Python standard library only.

## Usage
Run the script directly from your terminal:
\`\`\`bash
${task.run_command}
\`\`\`
Output will display your task list or update tasks.txt.

## License
Distributed under the MIT License.
`;
  }

  const projName = task.project_name || 'My Software Project';
  const desc = task.description || freeform || 'A software application.';
  const techs = (task.technologies && task.technologies.length > 0) ? task.technologies : ['Node.js', 'JavaScript'];
  const feats = (task.features && task.features.length > 0) ? task.features : ['Core application workflow', 'User interface'];

  let envSection = '';
  if (task.environment_variables && task.environment_variables.length > 0) {
    envSection = `\n### Environment Variables\nSet the following variables in your .env file:\n${task.environment_variables.map(v => `${v}=your_${v.toLowerCase()}_here`).join('\n')}\n`;
  } else if (task.has_missing_info && techs.some(t => /mongo|postgres|sql|prisma/i.test(t))) {
    envSection = `\n### Configuration\nConnect to your database:\n\`\`\`bash\nDATABASE_URL="mongodb://root:password123@localhost:27017/app_db"\n\`\`\`\n`;
  }

  const runBlock = task.run_command 
    ? `\`\`\`bash\n${task.run_command}\n\`\`\``
    : `Run using default development server command.`;

  const installBlock = task.installation
    ? `\`\`\`bash\n${task.installation}\n\`\`\``
    : `Install the dependencies required for ${techs.join(', ')}.`;

  return `# ${projName}

${desc}

## Technologies
${techs.join(', ')}

## Features
${feats.map(f => `- ${f}`).join('\n')}

## Installation
${installBlock}

## How to Run
${runBlock}
${envSection}
${task.project_structure ? `## Project Structure\n\`\`\`\n${task.project_structure}\n\`\`\`\n` : ''}
## License
${task.license || 'MIT License'}
`;
}

// Deterministic Skilled: Dynamically applies README_SKILL.md to ANY user input
function getDeterministicSkilled(task: ProjectTask, version: string = 'v3', freeform?: string): string {
  const projName = task.project_name || 'My Software Project';
  const desc = task.description || freeform || 'A modern software application.';
  const techs = (task.technologies && task.technologies.length > 0) ? task.technologies : ['TypeScript', 'Node.js'];
  const feats = (task.features && task.features.length > 0) ? task.features : ['Core functional engine', 'Modular architecture'];

  if (task.id === 7) {
    return `# ${task.project_name}
> A lightweight command-line task organizer written in pure Python.

## About the Project
${task.description}

## Key Features
${task.features.map(f => `- **${f}**`).join('\n')}

## Built With
- **Python** (Standard Library only)

## Getting Started

### Prerequisites
- Python 3.8+ installed on your system.

### Installation
\`\`\`bash
# No third-party dependencies required
# Clone or download todo.py directly
git clone <repository-url>
\`\`\`

### Running the Project
\`\`\`bash
${task.run_command}
\`\`\`
Expected output: Lists current items saved in your local text storage.

## Configuration
_No environment variables or external configuration required for this single-file utility._

## Project Structure
\`\`\`
todo.py
\`\`\`

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
Distributed under the ${task.license} License.
`;
  }

  if (version === 'v1') {
    return `# ${projName}

${desc}

## Features
${feats.map(f => `- ${f}`).join('\n')}

## Tech Stack
${techs.map(t => `- ${t}`).join('\n')}

## Installation
\`\`\`bash
${task.installation || '# No specific installation instructions provided'}
\`\`\`

## How to Run
\`\`\`bash
${task.run_command || '# Execution command not specified by author'}
\`\`\`

## License
${task.license ? `Distributed under the ${task.license} license.` : '_License not specified._'}
`;
  }

  const techBadges = techs.map(t => `\`${t}\``).join(' • ');

  let envTable = '';
  if (task.environment_variables && task.environment_variables.length > 0) {
    envTable = `| Variable | Description | Example / Note |\n| :--- | :--- | :--- |\n` + 
      task.environment_variables.map(v => `| \`${v}\` | Application configuration parameter | Required in \`.env\` |`).join('\n') +
      `\n\n> [!WARNING]\n> Never commit actual secret keys or credentials to public version control. Duplicate \`.env.example\` to \`.env\` before starting.`;
  } else {
    envTable = `_No specific environment variables required for standard configuration._`;
  }

  const installContent = task.installation 
    ? `1. Clone the repository:\n   \`\`\`bash\n   git clone <repository-url>\n   cd <project-folder>\n   \`\`\`\n2. Install required dependencies:\n   \`\`\`bash\n   ${task.installation}\n   \`\`\``
    : `> [!NOTE]\n> Installation instructions were not specified by the author. Please verify package manager files before running.`;

  const runContent = task.run_command
    ? `Execute the project runtime:\n\`\`\`bash\n${task.run_command}\n\`\`\`\nApplication will initialize on local host or configured port (e.g. \`http://localhost:3000\`).`
    : `> [!NOTE]\n> Specific start command was not provided. Refer to package configuration or script definitions.`;

  const structContent = task.project_structure
    ? `## Project Structure\n\`\`\`\n${task.project_structure}\n\`\`\`\n`
    : '';

  const apiContent = task.api_info
    ? `## API Reference\n\`\`\`http\n${task.api_info}\n\`\`\`\n`
    : '';

  const licenseContent = task.license
    ? `Distributed under the ${task.license} License. See \`LICENSE\` for more information.`
    : `> [!NOTE]\n> License has not been specified by the project author. All rights reserved by default.`;

  return `# ${projName}
> ${techBadges}

## About the Project
${desc}

Designed with clean architecture, strict reliability, and modern software engineering practices.

## Key Features
${feats.map(f => `- **${f.split(' ')[0]}**: ${f}`).join('\n')}

## Built With
${techs.map(t => `- **${t}**`).join('\n')}

## Getting Started

### Prerequisites
Ensure your local development environment has the requisite language runtime and package manager installed:
${techs.map(t => `- ${t} (Recommended latest LTS)`).join('\n')}

### Installation
${installContent}

### Running the Project
${runContent}

## Configuration
${envTable}

${structContent}${apiContent}## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License
${licenseContent}
`;
}
