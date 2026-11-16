import test from "node:test";
import assert from "node:assert/strict";
import Department from "../models/department.js";
import { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from "../controller/department.js";

const response = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("getAllDepartments returns populated departments", async (t) => {
  const departments = [{ _id: "d1", name: "Cardiology" }];
  t.mock.method(Department, "find", () => ({ populate: async () => departments }));
  const res = response();
  await getAllDepartments({}, res);
  assert.deepEqual(res.body, departments);
});

test("getAllDepartments returns 500 when the database fails", async (t) => {
  t.mock.method(Department, "find", () => ({ populate: async () => { throw new Error("db unavailable"); } }));
  const res = response();
  await getAllDepartments({}, res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, "db unavailable");
});

test("getDepartmentById returns a department", async (t) => {
  const department = { _id: "d1", name: "Cardiology" };
  t.mock.method(Department, "findById", async () => department);
  const res = response();
  await getDepartmentById({ params: { id: "d1" } }, res);
  assert.deepEqual(res.body, department);
});

test("getDepartmentById returns 404 when missing", async (t) => {
  t.mock.method(Department, "findById", async () => null);
  const res = response();
  await getDepartmentById({ params: { id: "missing" } }, res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Not found");
});

test("getDepartmentById returns 500 on query failure", async (t) => {
  t.mock.method(Department, "findById", async () => { throw new Error("query failed"); });
  const res = response();
  await getDepartmentById({ params: { id: "d1" } }, res);
  assert.equal(res.statusCode, 500);
});

test("createDepartment creates and returns a department", async (t) => {
  const payload = { name: "Neurology" };
  t.mock.method(Department, "create", async (value) => ({ _id: "d2", ...value }));
  const res = response();
  await createDepartment({ body: payload }, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { _id: "d2", ...payload });
});

test("createDepartment returns 500 on validation/database failure", async (t) => {
  t.mock.method(Department, "create", async () => { throw new Error("invalid department"); });
  const res = response();
  await createDepartment({ body: {} }, res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, "invalid department");
});

test("updateDepartment returns the updated department", async (t) => {
  const updated = { _id: "d1", name: "Updated" };
  t.mock.method(Department, "findByIdAndUpdate", async () => updated);
  const res = response();
  await updateDepartment({ params: { id: "d1" }, body: { name: "Updated" } }, res);
  assert.deepEqual(res.body, updated);
});

test("updateDepartment returns 404 when department does not exist", async (t) => {
  t.mock.method(Department, "findByIdAndUpdate", async () => null);
  const res = response();
  await updateDepartment({ params: { id: "missing" }, body: {} }, res);
  assert.equal(res.statusCode, 404);
});

test("updateDepartment returns 500 on update failure", async (t) => {
  t.mock.method(Department, "findByIdAndUpdate", async () => { throw new Error("update failed"); });
  const res = response();
  await updateDepartment({ params: { id: "d1" }, body: {} }, res);
  assert.equal(res.statusCode, 500);
});

test("deleteDepartment deletes an existing department", async (t) => {
  t.mock.method(Department, "findByIdAndDelete", async () => ({ _id: "d1" }));
  const res = response();
  await deleteDepartment({ params: { id: "d1" } }, res);
  assert.deepEqual(res.body, { message: "Department deleted" });
});

test("deleteDepartment returns 404 when department is missing", async (t) => {
  t.mock.method(Department, "findByIdAndDelete", async () => null);
  const res = response();
  await deleteDepartment({ params: { id: "missing" } }, res);
  assert.equal(res.statusCode, 404);
});

test("deleteDepartment returns 500 on delete failure", async (t) => {
  t.mock.method(Department, "findByIdAndDelete", async () => { throw new Error("delete failed"); });
  const res = response();
  await deleteDepartment({ params: { id: "d1" } }, res);
  assert.equal(res.statusCode, 500);
});
