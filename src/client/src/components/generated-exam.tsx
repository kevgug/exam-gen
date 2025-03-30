"use client"

import { useState } from "react"
import { FileDown, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GeneratedExamProps {
  exam: {
    id: number
    name: string
    questions: number
    date: string
  }
}

export function GeneratedExam({ exam }: GeneratedExamProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)

    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false)

      // Create a fake PDF download
      const link = document.createElement("a")
      link.href = "/placeholder.svg?height=800&width=600"
      link.download = `${exam.name.replace(/\s+/g, "-").toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 1500)
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{exam.name}</h3>
              <p className="text-sm text-muted-foreground">
                {exam.questions} questions • Generated on {new Date(exam.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-1" />
                )}
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{exam.name} - Preview</DialogTitle>
          </DialogHeader>
          <div className="bg-muted/30 p-6 rounded-md border">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-center">{exam.name}</h2>
                <p className="text-center text-muted-foreground">Time allowed: 2 hours</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Question 1 (10 points)</h3>
                  <p>
                    Explain the difference between synchronous and asynchronous programming models and provide an
                    example of each.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Question 2 (15 points)</h3>
                  <p>Which of the following is NOT a valid JavaScript data type?</p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>A. String</li>
                    <li>B. Boolean</li>
                    <li>C. Character</li>
                    <li>D. Object</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium">Question 3 (10 points)</h3>
                  <p>Write a function that determines if a given string is a palindrome.</p>
                </div>

                {/* More sample questions would be here */}
                <p className="text-muted-foreground text-sm italic">
                  (Preview showing 3 of {exam.questions} questions)
                </p>
              </div>
            </div>
          </div>
          <CardFooter className="px-0">
            <Button onClick={handleDownload} className="w-full">
              <FileDown className="h-4 w-4 mr-2" />
              Download Full Exam
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

