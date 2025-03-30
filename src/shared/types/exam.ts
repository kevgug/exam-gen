import { Id, PointWeighting } from "./common";
import { QuestionGroup } from "./question";

export type ExamMetadata = {
  numQuestions: number;
  weighting: PointWeighting;
};

export type Exam = {
  questionGroups: QuestionGroup[];
  // metadata: ExamMetadata;
};
