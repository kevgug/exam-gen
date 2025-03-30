import Persist from "node-persist";

export const DATA_DIR = "data";

export type multistore = {
  file: Persist.LocalStorage;
  obj: Persist.LocalStorage;
};

export type FileMetadata = {
  path: string;
  filename: string;
};
