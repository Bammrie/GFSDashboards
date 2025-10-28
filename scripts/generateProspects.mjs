import { buildProspectArtifacts } from './lib/prospectBuilder.mjs';

async function main() {
  const { reports, outputDataPath, staticBundlePath, generatedPages } = await buildProspectArtifacts({
    logger: console
  });
  console.log(
    `Wrote ${reports.length} prospect record${reports.length === 1 ? '' : 's'} to ${outputDataPath}`
  );
  if (staticBundlePath) {
    console.log(`Updated static prospect bundle at ${staticBundlePath}.`);
  }
  if (generatedPages) {
    console.log(`Generated ${generatedPages} prospect page${generatedPages === 1 ? '' : 's'}.`);
  }
}

main().catch((error) => {
  const message = error?.message || String(error);
  console.error('\n❌ Prospect artifact generation failed.');
  if (/Loan mix|Asset page net loan balance mismatch/i.test(message)) {
    console.error('Loan mix validation error:');
  }
  console.error(message);
  if (error?.stack) {
    console.error(error.stack);
  }
  process.exitCode = 1;
});
