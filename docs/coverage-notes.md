# Lab 11 — Automated Test Coverage

## Project adaptation

The original lab uses Python and pytest-cov. This repository is a MERN application, so the backend uses Node.js's built-in `node:test` runner and native V8 coverage reporting. No Python tooling was added.

## Baseline (before new tests)

- Existing automated backend test files found: **0**.
- Existing backend test command: **not configured**.
- Baseline line and branch percentages: **not available** because no test suite existed to measure. Do not report this as 0% source coverage; it is an unmeasured baseline.
- Initial untested controller targets selected for this exercise: `department.js`, `doctor.js`, and `patient.js`.

## Coverage targets and new tests

Added controller tests for:
- Department: list, get-by-id, create, update, delete; successful responses, missing records, and database errors.
- Doctor: list, profile lookup, create, update, delete; successful responses, missing records, and database errors.
- Patient: list, get-by-id, update, delete; successful responses, missing records, missing body, unauthenticated request, and database errors.

The tests use mocked model methods and do not require a live MongoDB connection.

## Commands

From the `backend` directory:

```bash
npm test
npm run test:coverage
```

The coverage command measures the three selected controller files, enforces a minimum **85% line coverage** for that measured scope, writes `coverage/lcov.info`, and generates `coverage/html/index.html`.

Node's built-in coverage reporter also supports branch coverage. Branch results appear in the terminal reporter when running the coverage command with the spec reporter. The configured threshold is line coverage; branch coverage is recorded and reviewed separately.

## Coverage versus test quality

A test can execute a controller line and still fail to verify its behavior. For example, merely checking that `updatePatient` does not throw would exercise the update path but would not prove that the response contains the updated user and patient data. The strengthened update test asserts the success message and both returned profile fields. This avoids treating execution alone as proof of correctness.

## Threshold enforcement

The coverage command uses Node's `--test-coverage-lines=85` option. The command exits unsuccessfully if the selected source files do not reach the threshold. The measured scope is explicitly limited to the three controller files under test; it is not a whole-repository coverage claim.

## Results

Fill in after running the commands locally:
- Tests passed: pending local execution.
- Final line coverage: pending local execution.
- Branch coverage: pending local execution.
- HTML report screenshot: capture `coverage/html/index.html` after the successful run.

## Limitations

The GitHub repository API was used to add the test files and scripts, but it does not execute the project's Node.js test suite. The final measured percentages and screenshots must therefore be captured from a local run or CI run before submission.
