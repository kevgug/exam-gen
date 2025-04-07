export type ExamPartChunk = {
  chunkType: "text" | "table" | "image";
  chunkValue: string;
};
export type ExamPart = {
  partName: string;
  partLevel: number;
  content: {
    setupChunks: ExamPartChunk[] | null;
    task: string | null;
  };
  partType: "parent" | "question";
  questionType: "write" | "multipleChoice" | "table" | "sketch" | null;
  writeIsComputational: boolean | null;
  writeNumAnswersExpected: number | null;
  multipleChoiceOptionChunks: ExamPartChunk[] | null;
  tableBaseMarkdown: string | null;
  sketchBaseImage: string | null;
  pointsAvailable: number | null;
  answerChunks: ExamPartChunk[] | null;
};
export type Exam = {
  generated?: boolean;
  parts: ExamPart[];
};
