import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectTask, EvaluationResult, evaluateReadme } from './readmeEvaluator.js';
import { generateBaselineReadme, generateSkilledReadme } from '../ai/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tasksPath = path.resolve(__dirname, '../../../evaluations/tasks.json');
const resultsPath = path.resolve(__dirname, '../../../results/evaluation_results.json');

export interface TaskEvaluationComparison {
  task_id: number;
  project_name: string;
  has_missing_info: boolean;
  notes?: string;
  baseline_score: number;
  skill_score: number;
  improvement: number;
  result: 'improved' | 'same' | 'worse';
  baseline_output: string;
  skill_output: string;
  category_scores: {
    [key: string]: {
      baseline: number;
      skill: number;
      max: number;
      delta: number;
    };
  };
  baseline_eval: EvaluationResult;
  skill_eval: EvaluationResult;
}

export interface FullEvaluationReport {
  timestamp: string;
  total_tasks: number;
  skill_version: string;
  average_baseline_score: number;
  average_skill_score: number;
  average_improvement: number;
  improved_count: number;
  same_count: number;
  worse_count: number;
  improvement_rate: number;
  regression_rate: number;
  no_change_rate: number;
  category_averages: {
    [key: string]: {
      name: string;
      max: number;
      baseline_avg: number;
      skill_avg: number;
      delta_avg: number;
    };
  };
  tasks: TaskEvaluationComparison[];
}

export function loadTasks(): ProjectTask[] {
  if (fs.existsSync(tasksPath)) {
    return JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
  }
  return [];
}

export function loadSavedResults(): FullEvaluationReport | null {
  if (fs.existsSync(resultsPath)) {
    try {
      return JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

export async function runFullEvaluation(skillVersion: string = 'v3'): Promise<FullEvaluationReport> {
  const tasks = loadTasks();
  const comparisons: TaskEvaluationComparison[] = [];

  for (const task of tasks) {
    const baselineGen = await generateBaselineReadme(task);
    const skillGen = await generateSkilledReadme(task, skillVersion);

    const baselineEval = evaluateReadme(task, baselineGen.markdown);
    const skillEval = evaluateReadme(task, skillGen.markdown);

    const improvement = Math.round((skillEval.totalScore - baselineEval.totalScore) * 10) / 10;
    let result: 'improved' | 'same' | 'worse' = 'same';
    if (improvement > 5) {
      result = 'improved';
    } else if (improvement < 0) {
      result = 'worse';
    } else {
      result = 'same';
    }

    const categories = Object.keys(baselineEval.categoryScores) as (keyof typeof baselineEval.categoryScores)[];
    const category_scores: Record<string, { baseline: number; skill: number; max: number; delta: number }> = {};

    for (const cat of categories) {
      const bCat = baselineEval.categoryScores[cat];
      const sCat = skillEval.categoryScores[cat];
      category_scores[cat] = {
        baseline: bCat.score,
        skill: sCat.score,
        max: bCat.max,
        delta: Math.round((sCat.score - bCat.score) * 10) / 10
      };
    }

    comparisons.push({
      task_id: task.id,
      project_name: task.project_name,
      has_missing_info: !!task.has_missing_info,
      notes: task.notes,
      baseline_score: baselineEval.totalScore,
      skill_score: skillEval.totalScore,
      improvement,
      result,
      baseline_output: baselineGen.markdown,
      skill_output: skillGen.markdown,
      category_scores,
      baseline_eval: baselineEval,
      skill_eval: skillEval
    });
  }

  const totalTasks = comparisons.length;
  const avgBaseline = Math.round((comparisons.reduce((acc, c) => acc + c.baseline_score, 0) / totalTasks) * 10) / 10;
  const avgSkill = Math.round((comparisons.reduce((acc, c) => acc + c.skill_score, 0) / totalTasks) * 10) / 10;
  const avgImprovement = Math.round((avgSkill - avgBaseline) * 10) / 10;

  const improvedCount = comparisons.filter(c => c.result === 'improved').length;
  const sameCount = comparisons.filter(c => c.result === 'same').length;
  const worseCount = comparisons.filter(c => c.result === 'worse').length;

  const categoryNames: Record<string, { name: string; max: number }> = {
    title: { name: 'Project Title', max: 10 },
    description: { name: 'Description', max: 10 },
    features: { name: 'Features', max: 10 },
    technologies: { name: 'Technologies', max: 10 },
    installation: { name: 'Installation', max: 15 },
    usage: { name: 'Usage / Running', max: 15 },
    configuration: { name: 'Configuration', max: 10 },
    structure: { name: 'Structure', max: 5 },
    contribution_license: { name: 'Contribution & License', max: 5 },
    accuracy: { name: 'Accuracy (Anti-Hallucination)', max: 10 }
  };

  const category_averages: Record<string, { name: string; max: number; baseline_avg: number; skill_avg: number; delta_avg: number }> = {};
  for (const [key, meta] of Object.entries(categoryNames)) {
    const bSum = comparisons.reduce((acc, c) => acc + (c.category_scores[key]?.baseline || 0), 0);
    const sSum = comparisons.reduce((acc, c) => acc + (c.category_scores[key]?.skill || 0), 0);
    const bAvg = Math.round((bSum / totalTasks) * 10) / 10;
    const sAvg = Math.round((sSum / totalTasks) * 10) / 10;
    category_averages[key] = {
      name: meta.name,
      max: meta.max,
      baseline_avg: bAvg,
      skill_avg: sAvg,
      delta_avg: Math.round((sAvg - bAvg) * 10) / 10
    };
  }

  const report: FullEvaluationReport = {
    timestamp: new Date().toISOString(),
    total_tasks: totalTasks,
    skill_version: skillVersion,
    average_baseline_score: avgBaseline,
    average_skill_score: avgSkill,
    average_improvement: avgImprovement,
    improved_count: improvedCount,
    same_count: sameCount,
    worse_count: worseCount,
    improvement_rate: Math.round((improvedCount / totalTasks) * 100),
    regression_rate: Math.round((worseCount / totalTasks) * 100),
    no_change_rate: Math.round((sameCount / totalTasks) * 100),
    category_averages,
    tasks: comparisons
  };

  // Write to results/evaluation_results.json
  fs.writeFileSync(resultsPath, JSON.stringify(report, null, 2), 'utf-8');
  return report;
}
