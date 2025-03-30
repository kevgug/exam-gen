"use client"

import { useEffect, useState } from "react"
import { FileUploader } from "@/components/file-uploader"
import { ExamList } from "@/components/exam-list"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/exam/get")
      if (response.ok) {
        const data = await response.json()
        setExams(data)
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilesUploaded = async (files: File[]) => {
    setUploadedFiles(files)

    // Upload files to server
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch("/exam/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setUploadedFiles([])
        fetchExams()
      }
    } catch (error) {
      console.error("Error uploading files:", error)
    }
  }

  const handleGenerateExam = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/exam/generate")
      if (response.ok) {
        fetchExams()
        setActiveTab("exams")
      }
    } catch (error) {
      console.error("Error generating exam:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteExam = async (examId: string) => {
    try {
      const response = await fetch(`/exam/delete?id=${examId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchExams()
      }
    } catch (error) {
      console.error("Error deleting exam:", error)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Exam Generator</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload PDFs</TabsTrigger>
          <TabsTrigger value="exams">Generated Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <FileUploader onFilesUploaded={handleFilesUploaded} />

          <div className="flex justify-center">
            <Button onClick={handleGenerateExam} disabled={isGenerating} size="lg">
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
          <ExamList exams={exams} isLoading={isLoading} onDelete={handleDeleteExam} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

