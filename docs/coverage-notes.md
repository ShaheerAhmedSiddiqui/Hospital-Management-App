# Lab 11 — Automated Test Coverage

## Project adaptation

The original lab describes Maven and JaCoCo for Java projects. This repository is a MERN application, so Maven/JaCoCo do not apply. The backend uses Node.js's built-in `node:test` runner and native V8 coverage reporting to enforce equivalent coverage gates.

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

The coverage command first creates the output directory (so a fresh checkout does not fail with ENOENT), then measures the three selected controller files and enforces:
- **Line coverage: at least 85%**
- **Branch coverage: at least 60%**

The command writes `coverage/lcov.info` and generates `coverage/html/index.html`. Node exits unsuccessfully if either configured threshold is not met. The measured scope is explicitly limited to the three controller files; this is not a whole-repository coverage claim.

## Coverage versus test quality

A test can execute a controller line and still fail to verify its behavior. The strengthened update test asserts the success message and returned profile fields, rather than merely checking that the handler does not throw. The test suite also covers success, missing-record, and database-error paths where applicable.

## Results

The test suite previously passed locally with **39 passing tests and 0 failures**. The final line and branch percentages still need to be captured from a successful run of the updated coverage command:
- Final line coverage: pending updated local execution.
- Final branch coverage: pending updated local execution.
- HTML report screenshot: capture `coverage/html/index.html` after the successful run.

## Limitations

The GitHub repository API was used to add the test files and scripts, but it does not execute the project's Node.js test suite. Final measured percentages and screenshots must be captured from a local run or CI run before claiming the thresholds passed.
