import { Mistral } from "@mistralai/mistralai";
import { OCRResponse } from "@mistralai/mistralai/models/components";

const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});

export class OcrService {
  private static replaceImagesInMd({
    mdString,
    imgRecord: imageMap,
  }: {
    mdString: string;
    imgRecord: Record<string, string>;
  }): string {
    for (const [imgName, base64] of Object.entries(imageMap)) {
      mdString = mdString.replace(
        `![${imgName}](${imgName})`,
        `![${imgName}](${base64})`,
      );
    }
    return mdString;
  }

  private static getCombinedMd(ocrResponse: OCRResponse): string {
    const markdowns: string[] = [];

    for (const page of ocrResponse.pages) {
      let imgData: Record<string, string> = {};
      for (const img of page.images) {
        imgData[img.id] = img.imageBase64 ?? "";
      }

      // replace img placeholders with actual imgs
      markdowns.push(
        this.replaceImagesInMd({
          mdString: page.markdown,
          imgRecord: imgData,
        }),
      );
    }

    return markdowns.join("\n\n");
  }

  public static async extractTextFromPdf({
    pdfName,
    pdfBuffer,
  }: {
    pdfName: string;
    pdfBuffer: Buffer;
  }): Promise<String> {
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
}
