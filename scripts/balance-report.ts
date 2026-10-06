import { CONTENT, toRoster } from '@content';
import { checkBalance, standardScenarios } from '@balance';

const report = checkBalance(toRoster(CONTENT), standardScenarios(toRoster(CONTENT)));

console.log('Pace: burned tokens -> stage (heroes, level)');
for (const point of report.pace.curve) {
  console.log(
    `  ${point.coins.toExponential(1)} -> stage ${point.stage} (${point.heroes}, ${point.level})`,
  );
}
for (const finding of report.pace.findings) {
  console.log(`  ${finding.passed ? 'pass' : 'FAIL'}  ${finding.rule}: ${finding.detail}`);
}

for (const verdict of report.verdicts) {
  const stuck = verdict.run.frontier
    ? `stuck at stage ${verdict.run.frontier.stage} (${verdict.run.frontier.stuckBy})`
    : 'never stuck';

  console.log(`\n${verdict.scenario}: ${stuck}`);
  for (const finding of verdict.findings) {
    console.log(`  ${finding.passed ? 'pass' : 'FAIL'}  ${finding.rule}: ${finding.detail}`);
  }
}
console.log(`\n${report.passed} passed, ${report.failed} failed`);
process.exitCode = process.argv.includes('--strict') && report.failed > 0 ? 1 : 0;
