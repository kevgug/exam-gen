import Persist from "node-persist";
import path from "path";

export const DATA_DIR = "data";
export const PROMPT_DIR = path.join("src", "server", "core", "prompts");

export type multistore = {
  file: Persist.LocalStorage;
  obj: Persist.LocalStorage;
};

export type FileMetadata = {
  path: string;
  filename: string;
};
