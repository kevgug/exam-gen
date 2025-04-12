import { Mistral } from "@mistralai/mistralai";
import { OCRResponse } from "@mistralai/mistralai/models/components";
import { PromptService } from "./prompt";

const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});

export type CombinedMarkdown = {
  mdStr: string;
  imgsById: Record<string, string>;
  imgDescriptionsById: Record<string, string>;
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
  public static fillImagesInMd(
    combinedMd: CombinedMarkdown,
    replaceImgs: boolean,
  ): string {
    let combinedMdStr = combinedMd.mdStr;
    if (replaceImgs) {
      for (const imgName of Object.keys(combinedMd.imgsById)) {
        const base64 = combinedMd.imgsById[imgName];
        const description = combinedMd.imgDescriptionsById[imgName];
        combinedMdStr = combinedMdStr.replace(
          `![${imgName}](${imgName})`,
          `![${description}](${base64})`,
        );
      }
    } else {
      for (const [imgName, description] of Object.entries(
        combinedMd.imgDescriptionsById,
      )) {
        combinedMdStr = combinedMdStr.replace(
          `![${imgName}](${imgName})`,
          `![${description}](${imgName})`,
        );
      }
    }
    return combinedMdStr;
  }

  private static async generateImgDescription(
    base64Img: string,
  ): Promise<string> {
    const response = await mistralClient.chat.complete({
      model: "pixtral-12b",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: await PromptService.sysPrompt(
                "OcrService_generateImgDescription",
              ),
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "image_url", imageUrl: base64Img }],
        },
      ],
    });
    return response.object;
  }

  private static async getCombinedMd(
    ocrResponse: OCRResponse,
  ): Promise<CombinedMarkdown> {
    const markdowns: string[] = [];
    let imgsById: Record<string, string> = {};
    let imgDescriptionsById: Record<string, string> = {};

    for (const page of ocrResponse.pages) {
      for (const img of page.images) {
        imgsById[img.id] = img.imageBase64 ?? "";
        imgDescriptionsById[img.id] = await this.generateImgDescription(
          img.imageBase64 ?? "",
        );
      }
      // replace img placeholders with actual imgs
      markdowns.push(page.markdown);
    }

    return { mdStr: markdowns.join("\n\n"), imgsById, imgDescriptionsById };
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

    // Return combined markdown
    return this.getCombinedMd(ocrResponse);
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
