import { Id, PointWeighting } from "./common";
import { QuestionTree } from "./question";

export type ExamMetadata = {
  numQuestions: number;
  weighting: PointWeighting;
};

export type Exam = {
  questions: QuestionTree[];
  metadata: ExamMetadata;
};
