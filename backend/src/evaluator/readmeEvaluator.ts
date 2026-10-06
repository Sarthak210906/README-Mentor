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

export function evaluateReadme(task: ProjectTask, markdown: string): EvaluationResult {
  const content = markdown || '';
  const lines = content.split('\n');
  const lower = content.toLowerCase();

  const projName = task?.project_name || 'Project';
  const taskDesc = task?.description || '';
  const taskFeatures = task?.features || [];
  const taskTech = task?.technologies || [];

  // 1. Title (10 pts)
  let titleScore = 0;
  const titleDetails: string[] = [];
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const h1Text = h1Match[1].trim().toLowerCase();
    const taskNameLower = projName.toLowerCase();
    if (h1Text.includes(taskNameLower) || taskNameLower.includes(h1Text)) {
      titleScore += 6;
      titleDetails.push("Clear H1 title matching project name (+6)");
    } else {
      titleScore += 3;
      titleDetails.push("H1 present but does not match project name (+3)");
    }
  } else {
    titleDetails.push("Missing H1 heading (0)");
  }
  // Badges or tagline
  const hasBadgesOrTagline = content.includes('[![') || content.includes('badges') || /#\s+.+\n+>[^\n]+/.test(content) || /#\s+.+\n+[A-Z]/.test(content);
  if (hasBadgesOrTagline) {
    titleScore += 4;
    titleDetails.push("Subtitle, tagline or metadata badges present (+4)");
  } else {
    titleDetails.push("Lacks prominent subtitle or metadata tag (0)");
  }

  // 2. Description (10 pts)
  let descScore = 0;
  const descDetails: string[] = [];
  const hasDescSection = /##\s+(about|overview|project overview|description|summary)/i.test(content);
  if (hasDescSection) {
    descScore += 5;
    descDetails.push("Dedicated Overview/About section present (+5)");
  } else if (content.length > 200) {
    descScore += 3;
    descDetails.push("General description exists without dedicated header (+3)");
  } else {
    descDetails.push("Minimal or missing project description (0)");
  }
  // Check if domain concepts mentioned
  const descKeywords = taskDesc ? taskDesc.toLowerCase().split(/\s+/).filter(w => w.length > 4) : [];
  const matchedKeywords = descKeywords.filter(k => lower.includes(k));
  if (descKeywords.length > 0 && matchedKeywords.length / descKeywords.length >= 0.4) {
    descScore += 5;
    descDetails.push("Substantive problem domain coverage (+5)");
  } else if (content.length > 150) {
    descScore += 4;
    descDetails.push("General problem domain coverage (+4)");
  } else {
    descScore += 2;
    descDetails.push("Superficial problem domain coverage (+2)");
  }

  // 3. Features (10 pts)
  let featScore = 0;
  const featDetails: string[] = [];
  const hasFeatSection = /##\s+(features|key features|core features|capabilities)/i.test(content);
  if (hasFeatSection) {
    featScore += 4;
    featDetails.push("Dedicated Features section present (+4)");
  } else {
    featDetails.push("Missing dedicated Features header (0)");
  }
  // Check coverage of explicitly declared features
  let coveredFeatures = 0;
  for (const feat of taskFeatures) {
    const featWords = feat.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const hasMatch = featWords.some(w => lower.includes(w));
    if (hasMatch) coveredFeatures++;
  }
  const featRatio = taskFeatures.length > 0 ? coveredFeatures / taskFeatures.length : 1;
  const featCoveragePts = Math.round(featRatio * 6);
  featScore += featCoveragePts;
  featDetails.push(`Documented ${coveredFeatures}/${taskFeatures.length || 1} specified features (+${featCoveragePts})`);

  // 4. Technologies (10 pts)
  let techScore = 0;
  const techDetails: string[] = [];
  const hasTechSection = /##\s+(built with|technologies|tech stack|technology stack|stack)/i.test(content);
  if (hasTechSection) {
    techScore += 4;
    techDetails.push("Dedicated Tech Stack section present (+4)");
  } else {
    techDetails.push("Missing dedicated Tech Stack section (0)");
  }
  let coveredTech = 0;
  for (const tech of taskTech) {
    if (lower.includes(tech.toLowerCase())) coveredTech++;
  }
  const techRatio = taskTech.length > 0 ? coveredTech / taskTech.length : 1;
  const techCoveragePts = Math.round(techRatio * 6);
  techScore += techCoveragePts;
  techDetails.push(`Accurately listed ${coveredTech}/${taskTech.length || 1} declared technologies (+${techCoveragePts})`);

  // 5. Installation (15 pts)
  let installScore = 0;
  const installDetails: string[] = [];
  const hasPrereq = /prerequisites|requirements|system requirements|dependencies/i.test(content);
  if (hasPrereq) {
    installScore += 5;
    installDetails.push("Prerequisites or system requirements documented (+5)");
  } else {
    installDetails.push("Missing explicit prerequisites breakdown (0)");
  }

  const hasCodeBlocks = /```[a-z]*\n[\s\S]*?```/i.test(content);
  if (task.installation) {
    const installCmd = task.installation.toLowerCase();
    const hasExactInstallCmd = lower.includes(installCmd);
    if (hasExactInstallCmd && hasCodeBlocks) {
      installScore += 10;
      installDetails.push("Step-by-step installation instructions with fenced code blocks (+10)");
    } else if (hasExactInstallCmd || hasCodeBlocks) {
      installScore += 6;
      installDetails.push("Installation instructions partially structured (+6)");
    } else {
      installDetails.push("Missing installation command instructions (0)");
    }
  } else {
    // Missing installation in task
    const acknowledgesMissingInstall = /not specified|manual setup|check repository|no installation instructions provided/i.test(lower);
    if (acknowledgesMissingInstall) {
      installScore += 10;
      installDetails.push("Correctly acknowledged absence of installation instructions (+10)");
    } else if (hasCodeBlocks) {
      // Fabricated or guessed arbitrary installation
      installScore += 4;
      installDetails.push("Guessed installation steps without verifying (unverified) (+4)");
    } else {
      installScore += 5;
      installDetails.push("Installation steps omitted (5)");
    }
  }

  // 6. Usage / Running Instructions (15 pts)
  let usageScore = 0;
  const usageDetails: string[] = [];
  if (task.run_command) {
    const runCmd = task.run_command.toLowerCase();
    const hasExactRunCmd = lower.includes(runCmd);
    if (hasExactRunCmd) {
      usageScore += 10;
      usageDetails.push("Fenced execution command matches project specifications (+10)");
    } else {
      const hasAnyRunSection = /##\s+(usage|running|getting started|how to run)/i.test(content);
      if (hasAnyRunSection) {
        usageScore += 5;
        usageDetails.push("Usage section present but run command modified or missing (+5)");
      } else {
        usageDetails.push("Missing execution command (0)");
      }
    }
  } else {
    // Missing run command in task
    const acknowledgesMissingRun = /not specified|run command not provided|custom command/i.test(lower);
    if (acknowledgesMissingRun) {
      usageScore += 10;
      usageDetails.push("Correctly flagged unspecified execution command (+10)");
    } else {
      usageScore += 4;
      usageDetails.push("Arbitrary run command assumed (+4)");
    }
  }
  const hasExpectedOutputOrUrl = /localhost|port|output|http:\/\/|usage example/i.test(lower);
  if (hasExpectedOutputOrUrl) {
    usageScore += 5;
    usageDetails.push("Expected output, localhost endpoint or usage notes provided (+5)");
  } else {
    usageDetails.push("Lacks expected localhost URL or execution output notes (0)");
  }

  // 7. Configuration (10 pts)
  let configScore = 0;
  const configDetails: string[] = [];
  if (task.environment_variables && task.environment_variables.length > 0) {
    let matchedEnv = 0;
    for (const envVar of task.environment_variables) {
      if (content.includes(envVar)) matchedEnv++;
    }
    const envRatio = matchedEnv / task.environment_variables.length;
    if (envRatio === 1) {
      configScore += 7;
      configDetails.push(`All ${matchedEnv} environment variables clearly documented (+7)`);
    } else if (envRatio > 0) {
      configScore += 4;
      configDetails.push(`Documented ${matchedEnv}/${task.environment_variables.length} environment variables (+4)`);
    } else {
      configDetails.push("Environment variables omitted (0)");
    }
    const hasTableOrCaution = content.includes('|') || lower.includes('.env.example') || lower.includes('.env') || lower.includes('secret');
    if (hasTableOrCaution) {
      configScore += 3;
      configDetails.push("Security advisory or structured config table provided (+3)");
    }
  } else {
    // Task has no env vars specified
    const statesNoEnvRequired = /no environment variables|no specific environment variables|not required|no configuration needed/i.test(lower);
    const inventedEnvVars = /mongo_uri|jwt_secret|database_url|api_key/i.test(lower);
    if (statesNoEnvRequired) {
      configScore += 10;
      configDetails.push("Correctly identified that no environment variables are required (+10)");
    } else if (!inventedEnvVars) {
      configScore += 8;
      configDetails.push("Clean handling without inventing unnecessary configuration (+8)");
    } else {
      configScore += 3;
      configDetails.push("Invented unrequested environment variables (-7)");
    }
  }

  // 8. Project Structure (5 pts)
  let structScore = 0;
  const structDetails: string[] = [];
  const hasStructureSection = /##\s+(project structure|directory structure|folder structure|file structure)/i.test(content);
  const hasTreeBlock = /```\n[\s\S]*?[│├└──\/\.]/i.test(content) || /├──|└──|──/.test(content);
  if (task.project_structure) {
    if (hasStructureSection && hasTreeBlock) {
      structScore = 5;
      structDetails.push("Complete project directory layout documented (+5)");
    } else if (hasStructureSection || hasTreeBlock) {
      structScore = 3;
      structDetails.push("Partial directory layout documented (+3)");
    } else {
      structScore = 1;
      structDetails.push("Project structure omitted despite being available (+1)");
    }
  } else {
    // Project structure wasn't provided
    if (hasStructureSection && hasTreeBlock) {
      // Made up a fake folder tree
      structScore = 2;
      structDetails.push("Generated hypothetical directory tree (+2)");
    } else {
      structScore = 5;
      structDetails.push("Correctly omitted unverified directory structure (+5)");
    }
  }

  // 9. Contribution / License (5 pts)
  let contribLicScore = 0;
  const contribLicDetails: string[] = [];
  const hasContrib = /##\s+(contributing|contributions)/i.test(content) && /pull request|fork|branch/i.test(lower);
  if (hasContrib) {
    contribLicScore += 2.5;
    contribLicDetails.push("Structured open-source contribution guide included (+2.5)");
  } else {
    contribLicDetails.push("Missing or incomplete contribution guide (0)");
  }

  if (task.license) {
    if (lower.includes(task.license.toLowerCase())) {
      contribLicScore += 2.5;
      contribLicDetails.push(`Accurately cited declared ${task.license} license (+2.5)`);
    } else if (/##\s+license/i.test(content)) {
      contribLicScore += 1.5;
      contribLicDetails.push("Generic license section (+1.5)");
    } else {
      contribLicDetails.push("Missing license documentation (0)");
    }
  } else {
    // License missing in task
    const acknowledgesMissingLicense = /not specified|unknown|all rights reserved|no license/i.test(lower);
    if (acknowledgesMissingLicense) {
      contribLicScore += 2.5;
      contribLicDetails.push("Explicitly flagged unspecified license status (+2.5)");
    } else if (lower.includes('mit license')) {
      contribLicScore += 1;
      contribLicDetails.push("Assumed MIT license without verification (+1)");
    } else {
      contribLicScore += 1.5;
      contribLicDetails.push("License omitted appropriately (+1.5)");
    }
  }

  // 10. Accuracy / Anti-Hallucination & Document Proportionality (10 pts)
  let accuracyScore = 10;
  const accuracyDetails: string[] = [];

  // Check for invented credentials / passwords
  const fakePasswordPatterns = [/password\s*[:=]\s*["']?[a-zA-Z0-9_!@#$%^&*]{4,}["']?/i, /admin:admin/i, /root:root/i, /mongodb:\/\/localhost:\d+\/secret/i];
  let foundInventedSecret = false;
  for (const pat of fakePasswordPatterns) {
    if (pat.test(content)) {
      foundInventedSecret = true;
      break;
    }
  }
  if (foundInventedSecret) {
    accuracyScore -= 5;
    accuracyDetails.push("Flagged: Contains invented database passwords or credentials (-5)");
  } else {
    accuracyDetails.push("No hallucinated passwords or database credentials detected (+5)");
  }

  // Micro-utility proportionality check:
  // For tiny single-file tools (like Task 7), enterprise boilerplate (contributing PR guides, unneeded config sections) is an anti-pattern
  const isMicroUtility = task?.id === 7 || (taskFeatures.length <= 3 && taskTech.length === 1 && (!task?.environment_variables || task.environment_variables.length === 0));
  if (isMicroUtility) {
    const hasExcessiveBoilerplate = /##\s+contributing/i.test(content) && /fork the project|pull request|feature branch/i.test(lower) && content.length > 700;
    if (hasExcessiveBoilerplate) {
      accuracyScore -= 10;
      accuracyDetails.push("Proportionality Penalty: Over-engineered enterprise boilerplate on single-file micro-utility (-10)");
    } else {
      accuracyDetails.push("Proportional and concise documentation (+5)");
    }
  } else {
    // Check for transparent missing info callouts vs silent fabrications
    if (task.has_missing_info) {
      const hasTransparentCallouts = /not specified|unspecified|to be configured|unknown|\[!note\]|\[!warning\]/i.test(lower);
      if (hasTransparentCallouts) {
        accuracyDetails.push("Transparently marks unprovided fields instead of fabricating (+5)");
      } else {
        accuracyScore -= 3;
        accuracyDetails.push("Failed to flag unprovided technical fields (-3)");
      }
    } else {
      accuracyDetails.push("High factual alignment with complete input (+5)");
    }
  }
  accuracyScore = Math.max(0, Math.min(10, accuracyScore));

  const totalScore = Math.min(100, Math.max(0,
    titleScore +
    descScore +
    featScore +
    techScore +
    installScore +
    usageScore +
    configScore +
    structScore +
    contribLicScore +
    accuracyScore
  ));

  const summaryFeedback = [
    ...titleDetails,
    ...descDetails,
    ...featDetails,
    ...techDetails,
    ...installDetails,
    ...usageDetails,
    ...configDetails,
    ...structDetails,
    ...contribLicDetails,
    ...accuracyDetails
  ];

  return {
    taskId: task.id,
    projectName: task.project_name,
    totalScore,
    categoryScores: {
      title: { score: titleScore, max: 10, details: titleDetails },
      description: { score: descScore, max: 10, details: descDetails },
      features: { score: featScore, max: 10, details: featDetails },
      technologies: { score: techScore, max: 10, details: techDetails },
      installation: { score: installScore, max: 15, details: installDetails },
      usage: { score: usageScore, max: 15, details: usageDetails },
      configuration: { score: configScore, max: 10, details: configDetails },
      structure: { score: structScore, max: 5, details: structDetails },
      contribution_license: { score: contribLicScore, max: 5, details: contribLicDetails },
      accuracy: { score: accuracyScore, max: 10, details: accuracyDetails }
    },
    summaryFeedback
  };
}
