import { ID, PointWeighting } from "../common";

export type ExamMetadata = {
  id: ID;
  file: string;
  length: number;
  weighting: PointWeighting;
};
