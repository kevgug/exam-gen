import { Mistral } from "@mistralai/mistralai";
import { OCRResponse } from "@mistralai/mistralai/models/components";
import { PromptService } from "./prompt";
import { generateText } from "ai";
import Anthropic from "@anthropic-ai/sdk";

const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});
const anthropicClient = new Anthropic();

export type CombinedMarkdown = {
  str: string;
  imgsById: Record<string, string>;
};

/**
 * Service for Optical Character Recognition (OCR) operations.
 * Handles PDF text extraction using Mistral's OCR API and
 * processes results into markdown with embedded images.
 */
export class OcrService {
  /**
   * Replaces image placeholders in markdown with base64 representations.
   * @param mdString - Markdown string containing image placeholders
   * @param imgsById - Record mapping image names to base64 strings
   * @returns Markdown with replaced image references
   */
  public static fillImagesInMd(md: CombinedMarkdown): string {
    let combinedMdStr = md.str;
    for (const imgName of Object.keys(md.imgsById)) {
      const base64 = md.imgsById[imgName];
      // Create a regex to match ![any alt text](imgName)
      const regex = new RegExp(`!\\[(.*?)\\]\\(${imgName}\\)`, "g");
      // Replace with ![same alt text](base64)
      combinedMdStr = combinedMdStr.replace(regex, `![$1](${base64})`);
    }
    return combinedMdStr;
  }

  private static ocrToCombinedMd(ocrResponse: OCRResponse): CombinedMarkdown {
    const markdowns: string[] = [];
    let imgsById: Record<string, string> = {};

    for (const page of ocrResponse.pages) {
      for (const img of page.images) {
        imgsById[img.id] = img.imageBase64 ?? "";
      }
      // replace img placeholders with actual imgs
      markdowns.push(page.markdown);
    }

    return { str: markdowns.join("\n\n"), imgsById };
  }

  private static async reviseCombinedMd(
    md: CombinedMarkdown,
    pdfBuffer: Buffer,
  ): Promise<CombinedMarkdown> {
    const stream = anthropicClient.messages.stream({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 30000,
      temperature: 1,
      system: (
        await PromptService.system("OcrService_reviseCombinedMd")
      ).fillVar("OCR_TRANSCRIPTION", md.str).text,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBuffer.toString("base64"),
              },
            },
          ],
        },
      ],
      thinking: {
        type: "enabled",
        budget_tokens: 10000,
      },
    });

    let reasoning = "";
    let text = "";
    for await (const event of stream) {
      if (event.type === "content_block_start") {
        console.log(`\nStarting ${event.content_block.type} block...`);
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "thinking_delta") {
          reasoning += event.delta.thinking;
          console.log(`Thinking: ${event.delta.thinking}`);
        } else if (event.delta.type === "text_delta") {
          text += event.delta.text;
          console.log(`Response: ${event.delta.text}`);
        }
      } else if (event.type === "content_block_stop") {
        console.log("\nBlock complete.");
      }
    }

    console.log("reviseCombinedMd reasoning:\n", reasoning);
    return {
      ...md,
      str: text,
    } as CombinedMarkdown;
  }

  /**
   * Extracts text and images from a PDF using Mistral OCR API.
   * Uploads PDF, processes it, and returns combined markdown.
   * @param pdfName - Name of the PDF file
   * @param pdfBuffer - Buffer containing PDF data
   * @returns Promise resolving to markdown with extracted content
   * @throws Error if no pages were processed by OCR
   */
  public static async extractTextFromPdf({
    pdfName,
    pdfBuffer,
  }: {
    pdfName: string;
    pdfBuffer: Buffer;
  }): Promise<CombinedMarkdown> {
    // Upload PDF to Mistral
    const uploadedPdf = await mistralClient.files.upload({
      file: {
        fileName: pdfName,
        content: pdfBuffer,
      },
      purpose: "ocr",
    });

    // Get OCR results
    const signedUrl = await mistralClient.files.getSignedUrl({
      fileId: uploadedPdf.id,
    });
    const ocrResponse = await mistralClient.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: signedUrl.url,
      },
      includeImageBase64: true, // include embedded images
    });

    // Validate processing
    if (ocrResponse.usageInfo.pagesProcessed === 0) {
      throw Error("no pages processed by mistral ocr");
    }

    // First markdown exam produced
    console.log("ocrToCombinedMd");
    const md0 = this.ocrToCombinedMd(ocrResponse);
    // Revise markdown
    console.log("revise md");
    const md1 = await this.reviseCombinedMd(md0, pdfBuffer);
    console.log("md1:\n", md1);

    return md1;
  }

  /**
   * Removes all image references from a markdown string.
   * @param mdStr - Markdown string containing image references
   * @returns Markdown with all image references removed
   */
  public static mdWithoutImgs(mdStr: string) {
    return mdStr.replace(/!\[.*?\]\(.*?\)/g, "");
  }
}
