import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  generateBaselineReadme, 
  generateSkilledReadme, 
  getSkillContent, 
  testGemmaConnection, 
  setRuntimeApiConfig, 
  getRuntimeApiConfig, 
  AiOptions 
} from '../ai/aiService.js';
import { evaluateReadme, ProjectTask } from '../evaluator/readmeEvaluator.js';
import { loadTasks, loadSavedResults, runFullEvaluation } from '../evaluator/evaluationRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const rubricPath = path.resolve(__dirname, '../../../../evaluations/rubric.json');
const rulesPath = path.resolve(__dirname, '../../../../config/readme_rules.json');

// System status & model check
router.get('/status', (req, res) => {
  const currentConfig = getRuntimeApiConfig();
  const hasKey = !!(currentConfig.apiKey || process.env.GEMMA_API_KEY);
  res.json({
    status: 'ok',
    isDemoMode: !hasKey,
    modelName: hasKey ? `${currentConfig.model || 'Gemma 4'} (Live API)` : 'Gemma 4 (Demo Mode)',
    apiKeyConfigured: hasKey,
    model: currentConfig.model || 'gemma-2-27b-it',
    provider: currentConfig.provider || 'google'
  });
});

// Test Gemma Connection
router.post('/ai/test', async (req, res) => {
  try {
    const options: AiOptions = req.body;
    const result = await testGemmaConnection(options);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Test failed' });
  }
});

// Debug Google models
router.get('/ai/debug-models', async (req, res) => {
  try {
    const { listGoogleModels } = await import('../ai/aiService.js');
    const result = await listGoogleModels();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update runtime AI configuration
router.post('/ai/config', (req, res) => {
  try {
    const config: Partial<AiOptions> = req.body;
    setRuntimeApiConfig(config);
    res.json({ success: true, config: getRuntimeApiConfig() });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get runtime AI config
router.get('/ai/config', (req, res) => {
  res.json(getRuntimeApiConfig());
});

// Get all evaluation tasks
router.get('/tasks', (req, res) => {
  try {
    const tasks = loadTasks();
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

// Get rubric
router.get('/rubric', (req, res) => {
  try {
    if (fs.existsSync(rubricPath)) {
      const rubric = JSON.parse(fs.readFileSync(rubricPath, 'utf-8'));
      return res.json(rubric);
    }
    res.status(404).json({ error: 'Rubric not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load rubric' });
  }
});

// Get rules
router.get('/rules', (req, res) => {
  try {
    if (fs.existsSync(rulesPath)) {
      const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
      return res.json(rules);
    }
    res.status(404).json({ error: 'Rules not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load rules' });
  }
});

// Get skill content
router.get('/skill', (req, res) => {
  try {
    const version = (req.query.version as string) || 'v3';
    const content = getSkillContent(version);
    res.json({
      version,
      content,
      versions: ['v1', 'v2', 'v3']
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load skill' });
  }
});

// Generate Baseline with user options
router.post('/generate/baseline', async (req, res) => {
  try {
    const rawTask: Partial<ProjectTask> = req.body.task || req.body;
    const options: AiOptions = {
      apiKey: req.body.apiKey || (req.headers['x-gemma-api-key'] as string),
      model: req.body.model,
      provider: req.body.provider,
      baseUrl: req.body.baseUrl,
      freeformPrompt: req.body.freeformPrompt || req.body.prompt
    };

    if (!rawTask.project_name && !options.freeformPrompt) {
      return res.status(400).json({ error: 'Project name or prompt is required' });
    }

    const task: ProjectTask = {
      id: rawTask.id || 99,
      project_name: rawTask.project_name || 'My Software Project',
      description: rawTask.description || options.freeformPrompt || 'A software application.',
      technologies: rawTask.technologies || [],
      features: rawTask.features || [],
      installation: rawTask.installation || null,
      run_command: rawTask.run_command || null,
      environment_variables: rawTask.environment_variables || null,
      project_structure: rawTask.project_structure || null,
      api_info: rawTask.api_info || null,
      license: rawTask.license || null,
      has_missing_info: rawTask.has_missing_info ?? true
    };

    const gen = await generateBaselineReadme(task, options);
    const evaluation = evaluateReadme(task, gen.markdown);
    res.json({
      markdown: gen.markdown,
      isDemoMode: gen.isDemoMode,
      modelUsed: gen.modelUsed,
      mode: 'baseline',
      evaluation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Baseline generation failed' });
  }
});

// Generate Skilled with user options
router.post('/generate/skill', async (req, res) => {
  try {
    const rawTask: Partial<ProjectTask> = req.body.task || req.body;
    const version = (req.body.version as string) || 'v3';
    const options: AiOptions = {
      apiKey: req.body.apiKey || (req.headers['x-gemma-api-key'] as string),
      model: req.body.model,
      provider: req.body.provider,
      baseUrl: req.body.baseUrl,
      freeformPrompt: req.body.freeformPrompt || req.body.prompt
    };

    if (!rawTask.project_name && !options.freeformPrompt) {
      return res.status(400).json({ error: 'Project name or prompt is required' });
    }

    const task: ProjectTask = {
      id: rawTask.id || 99,
      project_name: rawTask.project_name || 'My Software Project',
      description: rawTask.description || options.freeformPrompt || 'A software application.',
      technologies: rawTask.technologies || [],
      features: rawTask.features || [],
      installation: rawTask.installation || null,
      run_command: rawTask.run_command || null,
      environment_variables: rawTask.environment_variables || null,
      project_structure: rawTask.project_structure || null,
      api_info: rawTask.api_info || null,
      license: rawTask.license || null,
      has_missing_info: rawTask.has_missing_info ?? true
    };

    const gen = await generateSkilledReadme(task, version, options);
    const evaluation = evaluateReadme(task, gen.markdown);
    res.json({
      markdown: gen.markdown,
      isDemoMode: gen.isDemoMode,
      modelUsed: gen.modelUsed,
      mode: 'skill',
      skillVersion: version,
      evaluation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Skilled generation failed' });
  }
});

// Run evaluation
router.post('/evaluate', async (req, res) => {
  try {
    const version = (req.body.version as string) || 'v3';
    const report = await runFullEvaluation(version);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Evaluation run failed' });
  }
});

// Get evaluation results
router.get('/results', async (req, res) => {
  try {
    let results = loadSavedResults();
    if (!results) {
      // First run auto-trigger
      results = await runFullEvaluation('v3');
    }
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch results' });
  }
});

export default router;
