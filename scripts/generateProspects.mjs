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
  console.error(error);
  process.exitCode = 1;
});
