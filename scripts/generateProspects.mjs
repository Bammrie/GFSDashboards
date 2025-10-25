import { buildProspectArtifacts } from './lib/prospectBuilder.mjs';

async function main() {
  const { reports, outputDataPath, generatedPages } = await buildProspectArtifacts({ logger: console });
  console.log(
    `Wrote ${reports.length} prospect record${reports.length === 1 ? '' : 's'} to ${outputDataPath}`
  );
  if (generatedPages) {
    console.log(`Generated ${generatedPages} prospect page${generatedPages === 1 ? '' : 's'}.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
