import { Id, PointWeighting } from "./common";
import { QuestionGroup } from "./question";

// export type ExamMetadata = {
//   numQuestions: number;
//   weighting: PointWeighting;
// };

// export type Exam = {
//   generated: boolean | undefined;
//   questionGroups: QuestionGroup[];
//   // metadata: ExamMetadata;
// };

export type ExamPartContentSetupChunk = {
  chunkType: "text" | "table" | "image";
  chunkValue: string;
};
export type ExamPartMultipleChoiceOption = {
  optionType: "text" | "table" | "image";
  optionValue: string;
};
export type ExamPart = {
  partName: string;
  partLevel: number;
  content: {
    setupChunks: ExamPartContentSetupChunk[] | null;
    task: string | null;
  };
  partType: "parent" | "question";
  questionType: "write" | "multipleChoice" | "table" | "sketch" | null;
  writeIsComputational: boolean | null;
  writeNumAnswersExpected: number | null;
  multipleChoiceOptions: ExamPartMultipleChoiceOption[] | null;
  tableBaseMarkdown: string | null;
  sketchBaseImage: string | null;
  sketchBaseReferenceImage: number | null;
  pointsAvailable: number | null;
};
export type Exam = {
  generated?: boolean;
  parts: ExamPart[];
};
