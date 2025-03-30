import { Id, PointWeighting } from "./common";

export type Question = {
  type: "multiple-choice" | "freeform-response" | "numerical-response";
  content: string;
  multipleChoiceOptions: string[] | null;
  points: number;
};

export type QuestionGroup = {
  groupContent: string; // could be a parent question or context
  subItems: (Question | QuestionGroup)[];
};
