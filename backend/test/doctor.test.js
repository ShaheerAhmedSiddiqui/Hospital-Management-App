import test from "node:test";
import assert from "node:assert/strict";
import Doctor from "../models/doctor.js";
import { getAllDoctors, getDoctorProfile, createDoctor, updateDoctorProfile, deleteDoctor } from "../controller/doctor.js";

const response = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("getAllDoctors returns doctors with user details", async (t) => {
  const doctors = [{ _id: "doc1" }];
  t.mock.method(Doctor, "find", () => ({ populate: async () => doctors }));
  const res = response();
  await getAllDoctors({}, res);
  assert.deepEqual(res.body, doctors);
});

test("getAllDoctors handles database errors", async (t) => {
  t.mock.method(Doctor, "find", () => ({ populate: async () => { throw new Error("db error"); } }));
  const res = response();
  await getAllDoctors({}, res);
  assert.equal(res.statusCode, 500);
});

test("getDoctorProfile returns the authenticated doctor's profile", async (t) => {
  const doctor = { _id: "doc1" };
  t.mock.method(Doctor, "findOne", () => ({
    populate: () => ({ populate: async () => doctor }),
  }));
  const res = response();
  await getDoctorProfile({ user: { _id: "user1" } }, res);
  assert.deepEqual(res.body, doctor);
});

test("getDoctorProfile returns 404 when no profile exists", async (t) => {
  t.mock.method(Doctor, "findOne", () => ({
    populate: () => ({ populate: async () => null }),
  }));
  const res = response();
  await getDoctorProfile({ user: { _id: "user1" } }, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Doctor profile not found");
});

test("getDoctorProfile handles query errors", async (t) => {
  t.mock.method(Doctor, "findOne", () => ({
    populate: () => ({ populate: async () => { throw new Error("query error"); } }),
  }));
  const res = response();
  await getDoctorProfile({ user: { _id: "user1" } }, res);
  assert.equal(res.statusCode, 500);
});

test("createDoctor creates a doctor record", async (t) => {
  const doctor = { _id: "doc1" };
  t.mock.method(Doctor, "create", async () => doctor);
  const res = response();
  await createDoctor({ body: { userId: "user1" } }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, doctor);
});

test("createDoctor handles database errors", async (t) => {
  t.mock.method(Doctor, "create", async () => { throw new Error("create failed"); });
  const res = response();
  await createDoctor({ body: {} }, res);
  assert.equal(res.statusCode, 500);
});

test("updateDoctorProfile returns updated profile", async (t) => {
  const doctor = { _id: "doc1", fees: 500 };
  t.mock.method(Doctor, "findByIdAndUpdate", () => ({ populate: async () => doctor }));
  const res = response();
  await updateDoctorProfile({ params: { id: "doc1" }, body: { fees: 500 } }, res);
  assert.deepEqual(res.body, { message: "Doctor profile updated successfully", doctor });
});

test("updateDoctorProfile returns 404 for an unknown doctor", async (t) => {
  t.mock.method(Doctor, "findByIdAndUpdate", () => ({ populate: async () => null }));
  const res = response();
  await updateDoctorProfile({ params: { id: "missing" }, body: {} }, res);
  assert.equal(res.statusCode, 404);
});

test("updateDoctorProfile handles update errors", async (t) => {
  t.mock.method(Doctor, "findByIdAndUpdate", () => ({ populate: async () => { throw new Error("update failed"); } }));
  const res = response();
  await updateDoctorProfile({ params: { id: "doc1" }, body: {} }, res);
  assert.equal(res.statusCode, 500);
});

test("deleteDoctor deletes an existing doctor", async (t) => {
  t.mock.method(Doctor, "findByIdAndDelete", async () => ({ _id: "doc1" }));
  const res = response();
  await deleteDoctor({ params: { id: "doc1" } }, res);
  assert.deepEqual(res.body, { message: "Doctor deleted" });
});

test("deleteDoctor returns 404 when doctor is missing", async (t) => {
  t.mock.method(Doctor, "findByIdAndDelete", async () => null);
  const res = response();
  await deleteDoctor({ params: { id: "missing" } }, res);
  assert.equal(res.statusCode, 404);
});

test("deleteDoctor handles delete errors", async (t) => {
  t.mock.method(Doctor, "findByIdAndDelete", async () => { throw new Error("delete failed"); });
  const res = response();
  await deleteDoctor({ params: { id: "doc1" } }, res);
  assert.equal(res.statusCode, 500);
});
