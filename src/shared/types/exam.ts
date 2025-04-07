export type ExamPartChunk = {
  chunkType: "text" | "table" | "image";
  chunkValue: string;
  chunkRole: "context" | "task";
};
export type ExamPart = {
  partName: string;
  partLevel: number;
  contentChunks: ExamPartChunk[] | null;
  partRole: "context" | "task";
  taskDetails: {
    type: "write" | "multipleChoice" | "table" | "sketch";
    pointsAvailable: number | null;
    isComputational: boolean;
    write_isComputational: boolean | null;
    multipleChoice_type: "single" | "multiple";
  };
};
export type Exam = {
  generated?: boolean;
  parts: ExamPart[];
};
