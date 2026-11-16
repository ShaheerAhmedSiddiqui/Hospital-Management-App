import fs from "node:fs";
import path from "node:path";

const input = path.resolve("coverage/lcov.info");
const outputDir = path.resolve("coverage/html");
const output = path.join(outputDir, "index.html");

if (!fs.existsSync(input)) {
  console.error("Coverage file not found. Run npm run test:coverage first.");
  process.exit(1);
}

const records = fs.readFileSync(input, "utf8").split("end_of_record").filter(Boolean);
const rows = records.map((record) => {
  const file = record.match(/^SF:(.+)$/m)?.[1] ?? "Unknown";
  const lines = [...record.matchAll(/^DA:(\d+),(\d+)/gm)];
  const total = lines.length;
  const covered = lines.filter(([, , hits]) => Number(hits) > 0).length;
  const percent = total ? (covered / total) * 100 : 0;
  const branchFound = Number(record.match(/^BRF:(\d+)/m)?.[1] ?? 0);
  const branchHit = Number(record.match(/^BRH:(\d+)/m)?.[1] ?? 0);
  const branchPercent = branchFound ? (branchHit / branchFound) * 100 : null;
  const missing = lines.filter(([, , hits]) => Number(hits) === 0).map(([, line]) => line);
  return { file, total, covered, percent, branchFound, branchHit, branchPercent, missing };
});

fs.mkdirSync(outputDir, { recursive: true });
const body = rows.map((row) => `
<tr>
  <td>${row.file}</td>
  <td>${row.covered}/${row.total}</td>
  <td>${row.percent.toFixed(2)}%</td>
  <td>${row.branchPercent === null ? "N/A" : row.branchPercent.toFixed(2) + "%"}</td>
  <td>${row.missing.join(", ") || "—"}</td>
</tr>`).join("");

const totalLines = rows.reduce((sum, row) => sum + row.total, 0);
const coveredLines = rows.reduce((sum, row) => sum + row.covered, 0);
const overall = totalLines ? (coveredLines / totalLines) * 100 : 0;
const branchFound = rows.reduce((sum, row) => sum + row.branchFound, 0);
const branchHit = rows.reduce((sum, row) => sum + row.branchHit, 0);
const branchOverall = branchFound ? (branchHit / branchFound) * 100 : null;

fs.writeFileSync(output, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hospital Management App — Coverage Report</title>
<style>
body{font:15px system-ui,sans-serif;margin:2rem;background:#f5f7fb;color:#172033}
main{max-width:1100px;margin:auto;background:white;padding:2rem;border-radius:12px}
h1{margin-top:0}.summary{font-size:2rem;font-weight:700;margin:1rem 0}
table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:.75rem;border-bottom:1px solid #e5e7eb}
th{background:#eef2ff}.muted{color:#5b6475;font-size:.9rem}
</style>
</head>
<body><main>
<h1>Hospital Management App — Coverage Report</h1>
<p class="muted">Generated from Node.js native test-runner LCOV output.</p>
<div class="summary">${overall.toFixed(2)}% line coverage</div>
<p>${coveredLines} of ${totalLines} executable lines covered across ${rows.length} measured files.</p>
<p>Branch coverage: ${branchOverall === null ? "not reported" : branchOverall.toFixed(2) + "%"}</p>
<table><thead><tr><th>Source file</th><th>Covered lines</th><th>Line coverage</th><th>Branch coverage</th><th>Uncovered lines</th></tr></thead>
<tbody>${body}</tbody></table>
</main></body></html>`);

console.log(`HTML coverage report generated: ${path.relative(process.cwd(), output)}`);
