import { Id, PointWeighting } from "./common";

export type QuestionRoot = {
  examId: Id;
  pointWeighting: PointWeighting;
  parts: (Question | QuestionWrapper)[];
};

export type Question = {
  type: "multiple-choice" | "written-response" | "numerical-response";
  content: string;
  children: (Question | QuestionWrapper)[];
  numMultipleChoice: number | null;
  points: number;
};

export type QuestionWrapper = {
  content: string;
  children: (Question | QuestionWrapper)[];
};
