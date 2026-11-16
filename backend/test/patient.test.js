import test from "node:test";
import assert from "node:assert/strict";
import Patient from "../models/patient.js";
import User from "../models/user.js";
import { getAllPatients, getPatientById, updatePatient, deletePatient } from "../controller/patient.js";

const response = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("getAllPatients returns populated patient records", async (t) => {
  const patients = [{ _id: "p1" }];
  t.mock.method(Patient, "find", () => ({ populate: async () => patients }));
  const res = response();
  await getAllPatients({}, res);
  assert.deepEqual(res.body, patients);
});

test("getAllPatients handles database errors", async (t) => {
  t.mock.method(Patient, "find", () => ({ populate: async () => { throw new Error("db error"); } }));
  const res = response();
  await getAllPatients({}, res);
  assert.equal(res.statusCode, 500);
});

test("getPatientById returns the requested patient", async (t) => {
  const patient = { _id: "p1" };
  t.mock.method(Patient, "findById", () => ({ populate: async () => patient }));
  const res = response();
  await getPatientById({ params: { id: "p1" } }, res);
  assert.deepEqual(res.body, patient);
});

test("getPatientById returns 404 when patient is missing", async (t) => {
  t.mock.method(Patient, "findById", () => ({ populate: async () => null }));
  const res = response();
  await getPatientById({ params: { id: "missing" } }, res);
  assert.equal(res.statusCode, 404);
});

test("getPatientById handles query errors", async (t) => {
  t.mock.method(Patient, "findById", () => ({ populate: async () => { throw new Error("query error"); } }));
  const res = response();
  await getPatientById({ params: { id: "p1" } }, res);
  assert.equal(res.statusCode, 500);
});

test("updatePatient rejects a missing request body", async () => {
  const res = response();
  await updatePatient({ user: { _id: "u1" } }, res);
  assert.equal(res.statusCode, 400);
});

test("updatePatient rejects a request without an authenticated user", async () => {
  const res = response();
  await updatePatient({ body: {} }, res);
  assert.equal(res.statusCode, 401);
});

test("updatePatient returns 404 when the user record does not exist", async (t) => {
  t.mock.method(User, "findByIdAndUpdate", async () => null);
  const res = response();
  await updatePatient({ body: {}, user: { _id: "u1" } }, res);
  assert.equal(res.statusCode, 404);
});

test("updatePatient updates user and patient profile", async (t) => {
  const user = { _doc: { _id: "u1", name: "Ava" } };
  const patient = { _doc: { phoneNumber: "123" } };
  t.mock.method(User, "findByIdAndUpdate", async () => user);
  t.mock.method(Patient, "findOneAndUpdate", async () => patient);
  const res = response();
  await updatePatient({ body: { name: "Ava", phoneNumber: "123" }, user: { _id: "u1" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, "Profile updated successfully!");
  assert.equal(res.body.user.name, "Ava");
  assert.equal(res.body.user.phoneNumber, "123");
});

test("updatePatient handles update failures", async (t) => {
  t.mock.method(User, "findByIdAndUpdate", async () => { throw new Error("write failed"); });
  const res = response();
  await updatePatient({ body: {}, user: { _id: "u1" } }, res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, "write failed");
});

test("deletePatient deletes an existing patient", async (t) => {
  t.mock.method(Patient, "findByIdAndDelete", async () => ({ _id: "p1" }));
  const res = response();
  await deletePatient({ params: { id: "p1" } }, res);
  assert.deepEqual(res.body, { message: "Patient deleted" });
});

test("deletePatient returns 404 when patient is missing", async (t) => {
  t.mock.method(Patient, "findByIdAndDelete", async () => null);
  const res = response();
  await deletePatient({ params: { id: "missing" } }, res);
  assert.equal(res.statusCode, 404);
});

test("deletePatient handles delete errors", async (t) => {
  t.mock.method(Patient, "findByIdAndDelete", async () => { throw new Error("delete failed"); });
  const res = response();
  await deletePatient({ params: { id: "p1" } }, res);
  assert.equal(res.statusCode, 500);
});
