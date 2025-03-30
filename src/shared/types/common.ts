export type Id = string;

/**
 * Represents a point distribution between the different types of questions.
 */
export type PointWeighting = {
  "multiple-choice": number;
  "numerical-response": number;
  "freeform-response": number;
};
