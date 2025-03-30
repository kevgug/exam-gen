import path from "path";
import fs from "node:fs";
import busboy from "busboy";
import { Request, Response } from "express";
import { DATA_DIR, FileMetadata, multistore } from "../config";

export default {
  upload: (store: multistore, req: Request, res: Response, ..._: any[]) => {
    // grab file and store
    const bb = busboy({
      headers: req.headers,
    });

    bb.on("file", async (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      const [_, ext] = filename.split("."); // XXX: filename cannot contain more than one .

      // generate unique id for this file
      const id = crypto.randomUUID();
      const filemeta: FileMetadata = {
        path: path.join(DATA_DIR, "file", `${id}.${ext}`),
        filename,
      };

      // setup stream to write file
      const stream = fs.createWriteStream(filemeta.path);

      file.pipe(stream);
      await store.file.set(id, filemeta);

      stream.on("finish", () => {
        res.status(200).send({ id }).end();
      });
    });

    req.pipe(bb);
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
};
