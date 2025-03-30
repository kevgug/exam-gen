import { Id, PointWeighting } from "./common";
import { QuestionGroup } from "./question";

export type ExamMetadata = {
  numQuestions: number;
  weighting: PointWeighting;
};

export type Exam = {
  generated: boolean | undefined;
  questionGroups: QuestionGroup[];
  // metadata: ExamMetadata;
};
