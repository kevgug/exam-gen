enum QuestionType {
  MULTIPLE_CHOICE,
  WRITTEN_RESPONSE,
  NUMERICAL_RESPONSE,
}

type ID = string;
type Unit = string; // TODO: could be more careful and make an enumeration

/**
 * Represents a normalized point distribution between the different types of questions.
 */
type PointWeighting = {
  [QuestionType.MULTIPLE_CHOICE]: number;
  [QuestionType.NUMERICAL_RESPONSE]: number;
  [QuestionType.WRITTEN_RESPONSE]: number;
};
