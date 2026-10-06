import { ProjectTask, GenerationResponse, FullEvaluationReport, RuleDefinition, RubricCategory } from './types';

const API_BASE = '/api';

export async function fetchStatus(): Promise<{ isDemoMode: boolean; modelName: string; apiKeyConfigured: boolean; model?: string }> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function testAiConnection(options: { apiKey?: string; model?: string; provider?: string; baseUrl?: string }): Promise<{ success: boolean; message: string; modelUsed: string }> {
  const res = await fetch(`${API_BASE}/ai/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  return res.json();
}

export async function saveAiConfig(options: { apiKey?: string; model?: string; provider?: string; baseUrl?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/ai/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  return res.json();
}

export async function fetchTasks(): Promise<ProjectTask[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error('Failed to load tasks');
  const data = await res.json();
  return data.tasks || [];
}

export async function fetchRubric(): Promise<{ rubric_name: string; total_points: number; categories: RubricCategory[] }> {
  const res = await fetch(`${API_BASE}/rubric`);
  if (!res.ok) throw new Error('Failed to load rubric');
  return res.json();
}

export async function fetchRules(): Promise<{ rules: RuleDefinition[] }> {
  const res = await fetch(`${API_BASE}/rules`);
  if (!res.ok) throw new Error('Failed to load rules');
  return res.json();
}

export async function fetchSkill(version: string = 'v3'): Promise<{ version: string; content: string; versions: string[] }> {
  const res = await fetch(`${API_BASE}/skill?version=${version}`);
  if (!res.ok) throw new Error('Failed to load skill');
  return res.json();
}

export async function generateBaseline(task: ProjectTask, options?: any): Promise<GenerationResponse> {
  const res = await fetch(`${API_BASE}/generate/baseline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, ...options })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Baseline generation failed');
  }
  return res.json();
}

export async function generateSkill(task: ProjectTask, version: string = 'v3', options?: any): Promise<GenerationResponse> {
  const res = await fetch(`${API_BASE}/generate/skill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, version, ...options })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Skilled generation failed');
  }
  return res.json();
}

export async function fetchEvaluationResults(): Promise<FullEvaluationReport> {
  const res = await fetch(`${API_BASE}/results`);
  if (!res.ok) throw new Error('Failed to fetch evaluation results');
  return res.json();
}

export async function runEvaluation(version: string = 'v3'): Promise<FullEvaluationReport> {
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version })
  });
  if (!res.ok) throw new Error('Failed to run evaluation');
  return res.json();
}
