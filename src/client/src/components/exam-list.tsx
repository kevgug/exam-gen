"use client";

import { useState, useEffect } from "react";
import { FileDown, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Exam {
  id: string;
  name: string;
  createdAt: string;
}

interface ExamListProps {
  isLoading: boolean;
}

export function ExamList({
  isLoading,
}: ExamListProps) {
  const [exams, setExams] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

    useEffect(() => {
        setExams(JSON.parse(localStorage.getItem("generatedExamIds")));
    }, []);

  const handleDownload = async (examId: string) => {
    setDownloadingId(examId);
    try {
      window.location.href = `http://localhost:3000/exam/download?id=${examId}`;
    } catch (error) {
      console.error("Error downloading exam:", error);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  const confirmDelete = (examId: string) => {
    setExamToDelete(examId);
  };

  const handleDeleteConfirm = () => {
    if (examToDelete) {
      const updatedExams = exams.filter((id) => id !== examToDelete);
      setExams(updatedExams);
      localStorage.setItem("generatedExamIds", JSON.stringify(updatedExams));
      setExamToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No exams found</AlertTitle>
        <AlertDescription>
          Upload exam PDFs and generate new exams to see them here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {exams.map((id) => (
        <Card key={id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
                <div></div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(id)}
                  disabled={downloadingId === id}
                >
                  {downloadingId === id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-1" />
                  )}
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => confirmDelete(id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog
        open={examToDelete !== null}
        onOpenChange={(open) => !open && setExamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
