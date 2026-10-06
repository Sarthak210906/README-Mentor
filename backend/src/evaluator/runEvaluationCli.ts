import { runFullEvaluation } from './evaluationRunner.js';

async function main() {
  console.log('=== README Mentor: Running Systematic Evaluation ===');
  const report = await runFullEvaluation('v3');
  console.log(`Evaluated ${report.total_tasks} tasks:`);
  console.log(`Average Baseline Score: ${report.average_baseline_score} / 100`);
  console.log(`Average Skill Score:    ${report.average_skill_score} / 100`);
  console.log(`Average Improvement:    +${report.average_improvement} pts`);
  console.log(`Improved Tasks:         ${report.improved_count} (${report.improvement_rate}%)`);
  console.log(`Unchanged Tasks:        ${report.same_count} (${report.no_change_rate}%)`);
  console.log(`Worse (Regressed):      ${report.worse_count} (${report.regression_rate}%)`);
  console.log('\nTask Summary:');
  for (const t of report.tasks) {
    const icon = t.result === 'improved' ? '🟢' : t.result === 'worse' ? '🔴' : '🟡';
    console.log(`${icon} [Task ${t.task_id}] ${t.project_name.padEnd(36)} Baseline: ${t.baseline_score} | Skill: ${t.skill_score} | Delta: ${t.improvement > 0 ? '+' : ''}${t.improvement} (${t.result.toUpperCase()})`);
  }
}

main().catch(err => {
  console.error('Evaluation run failed:', err);
  process.exit(1);
});
