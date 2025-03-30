import express from "express";
import Persist from "node-persist";
import path from "node:path";
import routes from "./routes";
import { DATA_DIR, multistore } from "./common";

const app = express();
const port = 3000;

const store: multistore = {
  file: Persist.create({ dir: path.join(DATA_DIR, "db", "file") }),
  obj: Persist.create({ dir: path.join(DATA_DIR, "db", "obj") }),
};

(async () => {
  Object.values(store).map((s) => s.init());

  // exam crd endpoints
  app.post("/exam/upload", (...args) => routes.exam.upload(store, ...args));
  app.get("/exam/download", (...args) => routes.exam.download(store, ...args));
  app.delete("/exam/delete", (...args) => routes.exam.delete(store, ...args));

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
})();
