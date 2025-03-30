import { QuestionType } from "./question";

export type Id = string;
export type Unit = string; // TODO: could be more careful and make an enumeration

/**
 * Represents a normalized point distribution between the different types of questions.
 */
export type PointWeighting = {
  "multiple-choice": number;
  "numerical-response": number;
  "written-response": number;
};
