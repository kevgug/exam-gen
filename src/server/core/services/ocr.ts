import { Mistral } from "@mistralai/mistralai";
import { OCRResponse } from "@mistralai/mistralai/models/components";

const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});

export type CombinedMarkdown = {
  mdStr: string;
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
  public static fillImagesInMd({
    mdString,
    imgsById,
  }: {
    mdString: string;
    imgsById: Record<string, string>;
  }): string {
    for (const [imgName, base64] of Object.entries(imgsById)) {
      mdString = mdString.replace(
        `![${imgName}](${imgName})`,
        `![${imgName}](${base64})`,
      );
    }
    return mdString;
  }

  // /**
  //  * Combines markdown content from all pages in an OCR response.
  //  * Processes embedded images and incorporates them into the markdown.
  //  * @param ocrResponse - OCR response containing pages with markdown and images
  //  * @returns Combined markdown string with all content and embedded images
  //  */
  // private static getCombinedMd(ocrResponse: OCRResponse): string {
  //   const markdowns: string[] = [];

  //   for (const page of ocrResponse.pages) {
  //     let imgData: Record<string, string> = {};
  //     for (const img of page.images) {
  //       imgData[img.id] = img.imageBase64 ?? "";
  //     }

  //     // replace img placeholders with actual imgs
  //     markdowns.push(
  //       this.replaceImagesInMd({
  //         mdString: page.markdown,
  //         imgRecord: imgData,
  //       }),
  //     );
  //   }

  //   return markdowns.join("\n\n");
  // }

  private static getCombinedMd(ocrResponse: OCRResponse): CombinedMarkdown {
    const markdowns: string[] = [];
    let imgData: Record<string, string> = {};

    for (const page of ocrResponse.pages) {
      for (const img of page.images) {
        imgData[img.id] = img.imageBase64 ?? "";
      }

      // replace img placeholders with actual imgs
      markdowns.push(page.markdown);
    }

    return { mdStr: markdowns.join("\n\n"), imgsById: imgData };
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
