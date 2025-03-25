// PROMPT.JSX

import { useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from "xlsx";

async function processImageWithPrompt(imageFile, prompt) {
  if (!imageFile || !prompt) {
    throw new Error("Both image and prompt are required.");
  }

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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
CRITICAL INSTRUCTIONS FOR TABLE EXTRACTION:
1. Extract ONLY valid JSON array of objects.
2. Each object MUST have consistent key names.
3. If no data found, return EXACTLY: []
4. STRICT JSON FORMAT: No extra text, comments, or explanations.
5. Keys must match table headers exactly.
6. Always quote string values.
7. **Every key must have a value. If a value is missing, set it as an empty string ("").**
8. Do NOT leave standalone keys without values.

EXAMPLE OUTPUT FORMAT:
[
  {"Column1": "Value1", "Column2": "Value2"},
  {"Column1": "Value3", "Column2": ""}
]

Do NOT include any text before or after the JSON array.
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
    // Remove duplicate keys and add missing values
    const cleanedString = data
      ?.replace(/```json/g, "")
      ?.replace(/```/g, "")
      ?.replace(/^json\s*/i, "")
      ?.trim();

    const rawData = JSON.parse(cleanedString);

    // Remove duplicate keys and ensure all keys have a value
    const cleanedData = rawData.map((item) => {
      const uniqueItem = {};
      Object.keys(item).forEach((key) => {
        // If the value is undefined, set it to an empty string
        uniqueItem[key] = item[key] !== undefined ? item[key] : "";
      });
      return uniqueItem;
    });

    useEffect(() => {
      setConsolidatedData((prev) => {
        const newData = { ...prev };
        newData[pdfId] = cleanedData;
        return newData;
      });
    }, [data, pdfId, setConsolidatedData]);

    return (
      <div className="space-y-2 p-4 bg-white border rounded-lg shadow-md">
        {cleanedData.map((item, index) => (
          <p key={index} className="text-lg text-gray-900">
            {JSON.stringify(item)}
          </p>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Invalid JSON:", error);
    console.error("Raw data:", data); // Log the raw data for debugging

    return (
      <div className="space-y-2 p-4 bg-red-100 border rounded-lg shadow-md">
        <p className="text-lg text-red-900">
          Failed to parse JSON: {error.message}
        </p>
        <pre className="text-sm text-gray-700 overflow-x-auto">{data}</pre>
      </div>
    );
  }
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
        ?.trim();

      rows = JSON.parse(cleanedString);

      // Remove duplicate keys and ensure all keys have a value
      rows = rows.map((item) => {
        const uniqueItem = {};
        Object.keys(item).forEach((key) => {
          // If the value is undefined, set it to an empty string
          uniqueItem[key] = item[key] !== undefined ? item[key] : "";
        });
        return uniqueItem;
      });

      if (!Array.isArray(rows)) {
        rows = [rows];
      }
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

  console.log("Successfully exported extracted data to Excel.");
};
