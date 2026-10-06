export interface ProjectTask {
  id: number;
  project_name: string;
  description: string;
  technologies: string[];
  features: string[];
  installation?: string | null;
  run_command?: string | null;
  environment_variables?: string[] | null;
  project_structure?: string | null;
  api_info?: string | null;
  license?: string | null;
  has_missing_info?: boolean;
  notes?: string;
}

export interface CategoryScore {
  score: number;
  max: number;
  details: string[];
}

export interface EvaluationResult {
  taskId: number;
  projectName: string;
  totalScore: number;
  categoryScores: {
    title: CategoryScore;
    description: CategoryScore;
    features: CategoryScore;
    technologies: CategoryScore;
    installation: CategoryScore;
    usage: CategoryScore;
    configuration: CategoryScore;
    structure: CategoryScore;
    contribution_license: CategoryScore;
    accuracy: CategoryScore;
  };
  summaryFeedback: string[];
}

export interface GenerationResponse {
  markdown: string;
  isDemoMode: boolean;
  modelUsed: string;
  mode: 'baseline' | 'skill';
  skillVersion?: string;
  evaluation?: EvaluationResult;
}

export interface TaskComparison {
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
  tasks: TaskComparison[];
}

export interface RuleDefinition {
  id: string;
  name: string;
  summary: string;
  category: string;
  severity: string;
}

export interface RubricCategory {
  id: string;
  name: string;
  max_points: number;
  description: string;
  criteria: string[];
}
