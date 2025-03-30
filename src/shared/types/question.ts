import { Id, PointWeighting, Unit } from "./common";

export type QuestionText = string;
export type QuestionImg = string;

/**
 * Represents a part (e.g., part a) to a question. A question part may or may
 *  not have values and/or an answer.
 */
export type QuestionPart = {
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

export type QuestionChunkType = "text" | ";
export type QuestionChunk = {
  type: QuestionChunkType;
  value: QuestionText | QuestionImg | QuestionPart;
};

/**
 * Represents the phrasing of a question. A question scheme is used to generate
 *  new variations to the question.
 */
export type Question = {
  examId: Id;
  content: string;
  diagram?: string;
  points: PointWeighting;
  parts: QuestionChunk[];
};

/**
 * Represents an instance of a generated question. All generated questions will
 *  originate from a question scheme (which can be backreferenced by schemeId).
 */
export type GeneratedQuestion = {
  schemeId: Id;
  diagram?: string;
  parts: QuestionPart[];
};

export type QuestionType =
  | "multiple-choice"
  | "written-response"
  | "numerical-response";
