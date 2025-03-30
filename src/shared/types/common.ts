export type Id = string;

/**
 * Represents a normalized point distribution between the different types of questions.
 */
export type PointWeighting = {
  "multiple-choice": number;
  "numerical-response": number;
  "written-response": number;
};
