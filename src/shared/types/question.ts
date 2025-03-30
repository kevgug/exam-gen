import { Id, PointWeighting } from "./common";

export type QuestionTree = {
  examId: Id;
  pointWeighting: PointWeighting;
  root: (QuestionNode | QuestionGroupNode)[];
};

export type QuestionNode = {
  type: "multiple-choice" | "written-response" | "numerical-response";
  content: string;
  numMultipleChoice: number | null;
  points: number;
};

export type QuestionGroupNode = {
  content: string;
  children: (QuestionNode | QuestionGroupNode)[];
};
