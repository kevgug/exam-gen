import express from "express";
import cors from "cors"; // Import the cors middleware
import Persist from "node-persist";
import path from "node:path";
import routes from "./routes";
import { DATA_DIR, FileMetadata, multistore } from "./config";
import { convertMdPdf, createMd, ExamProcessingWorker } from "./workers";
import { unlink } from "node:fs/promises";
import { Exam } from "../shared/types/exam";

export default async (port: number) => {
    const app = express();

    // Enable CORS
    app.use(cors());

    const store: multistore = {
        file: Persist.create({ dir: path.join(DATA_DIR, "db", "file") }),
        obj: Persist.create({ dir: path.join(DATA_DIR, "db", "obj") }),
    };

    const wrap =
        (fn: any) =>
        (...args: any[]) =>
            fn(store, ...args);

    Object.values(store).map((s) => s.init());

    // exam crd endpoints
    app.post("/exam/upload", wrap(routes.exam.upload));
    app.get("/exam/get", wrap(routes.exam.get));
    app.get("/exam/download", wrap(routes.exam.download));
    app.delete("/exam/delete", wrap(routes.exam.delete));
    app.get("/exam/generate", wrap(routes.exam.generate));

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};
