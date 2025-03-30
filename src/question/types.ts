import { ID, PointWeighting, QuestionType, Unit } from "../common";

/**
 * Represents a part (e.g., part a) to a question. A question part may or may
 *  not have values and/or an answer.
 */
type QuestionPart = {
  type: QuestionType;
  strippedContent: string;
  variables: {
    name: {
      value?: number;
      unit: Unit;
    };
  };
  answer?: string | number;
  points: number;
};

/**
 * Represents the phrasing of a question. A question scheme is used to generate
 *  new variations to the question.
 */
type QuestionScheme = {
  /**
   * ID of exam that this question scheme was sourced from.
   */
  location: ID;
  /**
   * Pages of the containing exam that contain this question.
   */
  pages: number[];
  content: string;
  diagram?: string;
  points: PointWeighting;
  parts: QuestionPart[];
};

/**
 * Represents an instance of a generated question. All generated questions will
 *  originate from a question scheme (which can be backreferenced by schemeId).
 */
type GeneratedQuestion = {
  schemeId: ID;
  diagram?: string;
  parts: QuestionPart[];
};
