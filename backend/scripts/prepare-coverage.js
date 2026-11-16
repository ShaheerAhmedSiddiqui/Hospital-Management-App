import { mkdirSync } from "node:fs";

mkdirSync(new URL("../coverage/", import.meta.url), { recursive: true });
