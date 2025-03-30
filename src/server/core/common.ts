export enum QuestionType {
  MULTIPLE_CHOICE,
  WRITTEN_RESPONSE,
  NUMERICAL_RESPONSE,
}

export type ID = string;
export type Unit = string; // TODO: could be more careful and make an enumeration

/**
 * Represents a normalized point distribution between the different types of questions.
 */
export type PointWeighting = {
  [QuestionType.MULTIPLE_CHOICE]: number;
  [QuestionType.NUMERICAL_RESPONSE]: number;
  [QuestionType.WRITTEN_RESPONSE]: number;
};
