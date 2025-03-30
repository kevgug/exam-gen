"use client";

import { useEffect, useState } from "react";
import { FileUploader } from "@/components/file-uploader";
import { ExamList } from "@/components/exam-list";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [exams, setExams] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  const handleFilesUploaded = async (files: File[]) => {
    setUploadedFiles(files);

    // Upload files to server
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:3000/exam/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const uploadedTestId = data.id; // Assuming the server returns an ID for the uploaded test

        // Retrieve existing IDs from localStorage
        const existingIds = JSON.parse(
          localStorage.getItem("uploadedTestIds") || "[]",
        );
        const updatedIds = [...existingIds, uploadedTestId];

        // Store updated list in localStorage
        localStorage.setItem("uploadedTestIds", JSON.stringify(updatedIds));

        setUploadedFiles([]);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleGenerateExam = async () => {
    setIsGenerating(true);
    try {
      // Retrieve IDs from localStorage
      const uploadedTestIds = JSON.parse(
        localStorage.getItem("uploadedTestIds") || "[]",
      );

      // Construct query parameters
      const queryParams = new URLSearchParams();
      uploadedTestIds.forEach((id: string) => queryParams.append("ids", id));

      const response = await fetch(
        `http://localhost:3000/exam/generate?${queryParams.toString()}`,
      );
      if (response.ok) {
        const data = await response.json();
        const generatedExamId = data.id; // Assuming the server returns an ID for the generated exam

        // Retrieve existing generated exam IDs from localStorage
        const existingGeneratedIds = JSON.parse(
          localStorage.getItem("generatedExamIds") || "[]",
        );
        const updatedGeneratedIds = [...existingGeneratedIds, generatedExamId];

        // Store updated list in localStorage
        localStorage.setItem(
          "generatedExamIds",
          JSON.stringify(updatedGeneratedIds),
        );
        setActiveTab("exams");
      }
    } catch (error) {
      console.error("Error generating exam:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
    const response = await fetch(
      `http://localhost:3000/exam/delete?id=${examId}`,
      {
        method: "DELETE",
      },
    );

    if (response.ok) {
      // Retrieve existing generated exam IDs from localStorage
      const existingGeneratedIds = JSON.parse(
        localStorage.getItem("generatedExamIds") || "[]",
      );

      // Remove the deleted exam ID
      const updatedGeneratedIds = existingGeneratedIds.filter(
        (id: string) => id !== examId,
      );

      // Store updated list in localStorage
      localStorage.setItem(
        "generatedExamIds",
        JSON.stringify(updatedGeneratedIds),
      );

      // Optionally update the state to reflect the change
      setExams((prevExams) =>
        prevExams.filter((exam) => exam.id !== examId),
      );
    }
    } catch (error) {
    console.error("Error deleting exam:", error);
      console.error("Error deleting exam:", error);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Exam Generator</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-4xl mx-auto"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload PDFs</TabsTrigger>
          <TabsTrigger value="exams">Generated Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <FileUploader onFilesUploaded={handleFilesUploaded} />

          <div className="flex justify-center">
            <Button
              onClick={handleGenerateExam}
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating New Exam...
                </>
              ) : (
                <>Generate New Exam</>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="exams">
          <ExamList
            exams={exams}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
