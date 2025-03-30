import { PointWeighting } from "../../server/core/common";

export type ExamMetadata = {
  file: string;
  length: number;
  weighting: PointWeighting;
};
