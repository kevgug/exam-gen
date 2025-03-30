"use client"

import { useState } from "react"
import { FileDown, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Exam {
  id: string
  name: string
  createdAt: string
}

interface ExamListProps {
  exams: Exam[]
  isLoading: boolean
  onDelete: (id: string) => void
}

export function ExamList({ exams, isLoading, onDelete }: ExamListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [examToDelete, setExamToDelete] = useState<string | null>(null)

  const handleDownload = async (examId: string) => {
    setDownloadingId(examId)
    try {
      window.location.href = `/exam/download?id=${examId}`
    } catch (error) {
      console.error("Error downloading exam:", error)
    } finally {
      setTimeout(() => setDownloadingId(null), 1000)
    }
  }

  const confirmDelete = (examId: string) => {
    setExamToDelete(examId)
  }

  const handleDeleteConfirm = () => {
    if (examToDelete) {
      onDelete(examToDelete)
      setExamToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No exams found</AlertTitle>
        <AlertDescription>Upload exam PDFs and generate new exams to see them here.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{exam.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Generated on {new Date(exam.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(exam.id)}
                  disabled={downloadingId === exam.id}
                >
                  {downloadingId === exam.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-1" />
                  )}
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => confirmDelete(exam.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={examToDelete !== null} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

