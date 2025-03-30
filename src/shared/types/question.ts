import { Id, PointWeighting } from "./common";

export type Question = {
  type: "multiple-choice" | "freeform-response" | "numerical-response";
  content: string;
  multipleChoiceOptions: string[] | null;
  points: number;
};

export type QuestionGroup = {
  content: string; // could be a parent question or context
  nextQuestionIndex: string | number; // 1,2,3 vs a,b,c vs i,ii,iii
  subItems: (Question | QuestionGroup)[];
};
