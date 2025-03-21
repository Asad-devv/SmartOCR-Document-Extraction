// PROMPT.JSX

import { useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from "xlsx";

async function processImageWithPrompt(imageFile, prompt) {
  if (!imageFile || !prompt) {
    throw new Error("Both image and prompt are required.");
  }

  const genAI = new GoogleGenerativeAI(
    "AIzaSyAApY6krRmx34MGniuUMsTFIMMQEYJuMH8"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const imageBase64 = await fileToBase64(imageFile);

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: imageFile.type,
    },
  };

  const refinedPrompt =
    `
    Extract the table data from the provided image into a JSON array.
    Each object in the array should represent a single row from the table, with keys matching the column headers exactly.
    The JSON should be in **strict format** without additional text:
    
    Example:
    [{"Column1":"Value1", "Column2":"Value2"}, {"Column1":"Value3", "Column2":"Value4"}]

    Ensure:
    1. The structure is **valid JSON** with no text before or after.
    2. No empty objects, always return structured key-value pairs.
    3. The order of keys follows the **table structure** from left to right.
    4. If a value is missing, use an empty string ("").
    5. If no table is found, return **an empty array []**.
  ` + prompt;

  const textPart = { text: refinedPrompt };

  try {
    const result = await model.generateContent([imagePart, textPart]);
    const responseText = result.response.text() || "No response received";
    console.log("📝 Model Response:", responseText);
    return responseText;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("An error occurred while generating the content.");
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

export default processImageWithPrompt;

export const RenderJson = ({
  data,
  pdfId,
  allJsonResponses,
  setConsolidatedData,
}) => {
  let cleanedData;

  try {
    const cleanedString = data
      ?.replace(/```json/g, "")
      ?.replace(/```/g, "")
      ?.replace(/^json\s*/i, "")
      ?.replace(/,\s*}/g, "}")
      ?.replace(/,\s*\]/g, "]")
      ?.trim();

    cleanedData = JSON.parse(cleanedString);

    if (!Array.isArray(cleanedData)) {
      cleanedData = [cleanedData];
    }

    if (cleanedData.length === 0) {
      throw new Error("Empty extraction");
    }
  } catch (error) {
    console.error("Invalid JSON:", error);
    cleanedData = [{ Error: "Failed to parse JSON, check extraction format" }];
  }

  useEffect(() => {
    setConsolidatedData((prev) => {
      const newData = { ...prev };
      newData[pdfId] = cleanedData;
      return newData;
    });
  }, [data, pdfId, setConsolidatedData]);

  return (
    <div className="space-y-2 p-4 bg-white border rounded-lg shadow-md">
      {Array.isArray(cleanedData) ? (
        cleanedData.map((item, index) => (
          <p key={index} className="text-lg text-gray-900">
            {JSON.stringify(item)}
          </p>
        ))
      ) : (
        <p className="text-lg font-medium text-gray-800">{cleanedData}</p>
      )}
    </div>
  );
};

export const exportConsolidatedDataToExcel = (allJsonResponses, pdfFiles) => {
  let consolidatedArray = [];
  let columnHeaders = null;
  let isFirstEntry = true;

  const sortedKeys = Object.keys(allJsonResponses).sort((a, b) => {
    const [pdfIdA, pageA] = a.split("_page_");
    const [pdfIdB, pageB] = b.split("_page_");
    if (pdfIdA === pdfIdB) return parseInt(pageA) - parseInt(pageB);
    return pdfIdA.localeCompare(pdfIdB);
  });

  sortedKeys.forEach((pdfPageKey) => {
    const data = allJsonResponses[pdfPageKey];
    let rows = [];

    try {
      const cleanedString = data
        ?.replace(/```json/g, "")
        ?.replace(/```/g, "")
        ?.replace(/^json\s*/i, "")
        ?.replace(/,\s*}/g, "}")
        ?.replace(/,\s*\]/g, "]")
        ?.trim();
      rows = JSON.parse(cleanedString);
      if (!Array.isArray(rows)) rows = [rows];
    } catch (error) {
      console.error(
        `Error parsing JSON for ${pdfPageKey}:`,
        error,
        "Raw data:",
        data
      );
      rows = [{ Error: `Failed to parse data for ${pdfPageKey}` }];
    }

    if (rows.length === 0) {
      console.warn(`No rows extracted for ${pdfPageKey}`);
      return;
    }

    if (isFirstEntry && rows.length > 0) {
      columnHeaders = Object.keys(rows[0] || {});
      consolidatedArray.push(columnHeaders);
      isFirstEntry = false;
    }

    rows.forEach((row) => {
      const rowValues = columnHeaders.map((header) =>
        row[header] !== undefined ? row[header] : ""
      );
      consolidatedArray.push(rowValues);
    });
  });

  if (consolidatedArray.length === 0) {
    console.error("No data to export");
    return;
  }

  const worksheet = XLSX.utils.aoa_to_sheet(consolidatedArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
  XLSX.writeFile(workbook, "extracted_data.xlsx");

  console.log(" Successfully exported extracted data to Excel.");
};
