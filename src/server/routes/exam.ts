import path from "path";
import fs from "node:fs";
import busboy from "busboy";
import { Request, Response } from "express";
import { DATA_DIR, FileMetadata, multistore } from "../config";
import { ExamGenerationWorker, ExamProcessingWorker } from "../workers";
import { Exam } from "../../shared/types/exam";

export default {
  upload: (store: multistore, req: Request, res: Response, ..._: any[]) => {
    // grab file and store
    const bb = busboy({
      headers: req.headers,
    });

    bb.on("file", async (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      // const [_, ext] = filename.split("."); // XXX: filename cannot contain more than one .

      // generate unique id for this file
      const id = crypto.randomUUID();
      const filemeta: FileMetadata = {
        path: path.join(DATA_DIR, "file", `${id}.pdf`),
        filename,
      };

      // setup stream to write file
      const stream = fs.createWriteStream(filemeta.path);

      file.pipe(stream);
      await store.file.set(id, filemeta);

      stream.on("finish", () => {
        // start exam processing worker
        const worker = new ExamProcessingWorker(store);
        worker.start(id);

        res.status(200).send({ id }).end();
      });
    });

    req.pipe(bb);
  },

  get: async (
    store: multistore,
    req: Request,
    res: Response,
    ...args: any[]
  ) => {
    const id = req.query?.id?.toString();

    if (!id) {
      res.status(422).send("missing id");
      return;
    }

    const exam: Exam | undefined = await store.obj.get(id);

    if (!exam) {
      res.status(404).send("no exam with given id found");
      return;
    }

    res.status(200).json(exam);
  },

  download: async (
    store: multistore,
    req: Request,
    res: Response,
    ...args: any[]
  ) => {
    const id = req.query?.id?.toString();

    if (!id) {
      res.status(422).send("missing id");
      return;
    }

    const file: FileMetadata | undefined = await store.file.get(id);

    if (!file) {
      res.status(404).send("no exam with given id found");
      return;
    }

    res.status(200).sendFile(file.path, {
      root: process.cwd(),
      headers: {
        "Content-Disposition": `attachment; filename=${file.filename}`,
      },
    });
  },

  delete: async (
    store: multistore,
    req: Request,
    res: Response,
    ...args: any[]
  ) => {
    const id = req.query?.id?.toString();

    if (!id) {
      res.status(422).send("missing id");
      return;
    }

    const file: FileMetadata | undefined = await store.file.get(id);

    if (!file) {
      res.status(404).send("no exam with given id found");
      return;
    }

    await fs.promises.unlink(file.path);
    await store.file.del(id);

    res.status(200).send();
  },

  generate: async (
    store: multistore,
    req: Request,
    res: Response,
    ...args: any[]
  ) => {
    const ids = req.query?.ids?.toString().split(",") ?? [];

    console.log(ids);

    if (ids.length === 0) {
      res.status(422).send("missing ids");
      return;
    }

    // start generation worker
    const worker = new ExamGenerationWorker(store);

    const id = crypto.randomUUID();
    worker.start(ids, id);

    res.status(200).send({ id });
  },
};
