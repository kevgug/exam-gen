"use client"

import { useState } from "react"
import { FileUp, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUploader } from "./file-uploader"
import { GeneratedExam } from "./generated-exam"

export function ExamGenerator() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedExams, setGeneratedExams] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("upload")

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const generateExams = async () => {
    setIsGenerating(true)

    // Simulate API call with a timeout
    setTimeout(() => {
      // Mock generated exams
      const newExams = [
        {
          id: Date.now(),
          name: "Generated Exam 1",
          questions: 10,
          date: new Date().toISOString(),
        },
      ]

      setGeneratedExams((prev) => [...newExams, ...prev])
      setIsGenerating(false)
      setActiveTab("generated")
    }, 2000)
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Upload & Configure</TabsTrigger>
        <TabsTrigger value="generated">Generated Exams</TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <Card>
          <CardHeader>
            <CardTitle>Upload Exam PDFs</CardTitle>
            <CardDescription>
              Upload previous exam PDFs to use as source material for generating new exams
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUploader onFilesUploaded={handleFilesUploaded} />

            {uploadedFiles.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Uploaded Files ({uploadedFiles.length})</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <FileUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Generation Options</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="examTitle">Exam Title</Label>
                  <Input id="examTitle" placeholder="Midterm Exam" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select defaultValue="mixed">
                    <SelectTrigger id="examType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="essay">Essay Questions</SelectItem>
                      <SelectItem value="mixed">Mixed Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <span className="text-sm text-muted-foreground">10</span>
                </div>
                <Slider id="questionCount" defaultValue={[10]} max={30} min={5} step={1} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Additional Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any specific topics or instructions for the exam generation..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="includeAnswers" />
                <Label htmlFor="includeAnswers">Include Answer Key</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={generateExams} disabled={isGenerating || uploadedFiles.length === 0} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Exam...
                </>
              ) : (
                <>Generate New Exam</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="generated">
        <Card>
          <CardHeader>
            <CardTitle>Generated Exams</CardTitle>
            <CardDescription>View and download your generated exams</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedExams.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No exams generated yet</AlertTitle>
                <AlertDescription>
                  Upload exam PDFs and configure generation options to create new exams.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {generatedExams.map((exam) => (
                  <GeneratedExam key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

