// PROMPT.JSX
import { useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as XLSX from "xlsx";

async function processImageWithPrompt(imageFile, prompt) {
  if (!imageFile || !prompt) {
    throw new Error('Both image and prompt are required.');
  }

  const genAI = new GoogleGenerativeAI("AIzaSyAApY6krRmx34MGniuUMsTFIMMQEYJuMH8");
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const imageBase64 = await fileToBase64(imageFile);

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: imageFile.type,
    },
  };

  const refinedPrompt = `
    Extract the table data from the provided image into a JSON array. Each object in the array should represent a single row from the table, with keys matching the column headers exactly:
    . Ensure that no row is split across multiple objects due to newlines or formatting issues. If a value is missing, use an empty string (""). Return the result as a JSON string.
  ` + prompt;

  const textPart = { text: refinedPrompt };

  try {
    const result = await model.generateContent([imagePart, textPart]);
    const responseText = result.response.text() || "No response received";
    console.log("📝 Model Response:", responseText);
    return responseText;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('An error occurred while generating the content.');
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

export default processImageWithPrompt;

export const RenderJson = ({ data, pdfId, allJsonResponses, setConsolidatedData }) => {
  let cleanedData;

  try {
    const cleanedString = data
      ?.replace(/```json/g, '')
      ?.replace(/```/g, '')
      ?.replace(/^json\s*/i, '')
      ?.replace(/,\s*}/g, '}')
      ?.replace(/,\s*\]/g, ']')
      ?.trim();

    cleanedData = JSON.parse(cleanedString);
    console.log("Cleaned Data:", cleanedData);
  } catch (error) {
    console.error("Invalid JSON:", error);
    return <p className="text-red-500">Loading...</p>;
  }

  useEffect(() => {
    setConsolidatedData((prev) => {
      const newData = { ...prev };
      newData[pdfId] = Array.isArray(cleanedData) ? cleanedData : [cleanedData];
      return newData;
    });
  }, [data, pdfId, setConsolidatedData]);

  return (
    <div className="space-y-2 p-4 bg-white border rounded-lg shadow-md">
      {typeof cleanedData === "string" ? (
        <p className="text-lg font-medium text-gray-800">{cleanedData}</p>
      ) : Array.isArray(cleanedData) ? (
        cleanedData.map((item, index) => (
          <p key={index} className="text-lg text-gray-900">{JSON.stringify(item)}</p>
        ))
      ) : typeof cleanedData === "object" ? (
        Object.entries(cleanedData).map(([key, value], index) => (
          <p key={index} className="text-sm text-gray-900">
            <strong>{key}:</strong> {JSON.stringify(value)}
          </p>
        ))
      ) : null}
    </div>
  );
};



// PROMPT.JSX
export const exportConsolidatedDataToExcel = (allJsonResponses, pdfFiles) => {
  let consolidatedArray = [];
  let columnHeaders = null;
  let isFirstEntry = true;

  // Sort keys to ensure page order
  const sortedKeys = Object.keys(allJsonResponses).sort((a, b) => {
    const [pdfIdA, pageA] = a.split('_page_');
    const [pdfIdB, pageB] = b.split('_page_');
    if (pdfIdA === pdfIdB) return parseInt(pageA) - parseInt(pageB);
    return pdfIdA.localeCompare(pdfIdB);
  });

  sortedKeys.forEach((pdfPageKey) => {
    const data = allJsonResponses[pdfPageKey];
    let rows = [];

    // Clean and parse the JSON data
    try {
      const cleanedString = data
        ?.replace(/```json/g, '')
        ?.replace(/```/g, '')
        ?.replace(/^json\s*/i, '')
        ?.replace(/,\s*}/g, '}')
        ?.replace(/,\s*\]/g, ']')
        ?.trim();
      rows = JSON.parse(cleanedString);
      if (!Array.isArray(rows)) rows = [rows]; // Ensure it’s an array
    } catch (error) {
      console.error(`Error parsing JSON for ${pdfPageKey}:`, error, "Raw data:", data);
      rows = [{ "Error": `Failed to parse data for ${pdfPageKey}` }];
    }

    if (rows.length === 0) {
      console.warn(`No rows extracted for ${pdfPageKey}`);
      return;
    }

    // Set headers from the first valid page
    if (isFirstEntry && rows.length > 0) {
      columnHeaders = Object.keys(rows[0]);
      consolidatedArray.push(columnHeaders); // Add headers as first row
      isFirstEntry = false;
    }

    // Append rows, aligning with headers
    rows.forEach((row) => {
      if (columnHeaders) {
        const rowValues = columnHeaders.map(header => row[header] !== undefined ? row[header] : "");
        consolidatedArray.push(rowValues);
      } else {
        consolidatedArray.push(Object.values(row)); // Fallback if no headers yet
      }
    });
  });

  if (consolidatedArray.length === 0) {
    console.error("No data to export");
    return;
  }

  console.log("Consolidated Array for Excel:", consolidatedArray);

  const worksheet = XLSX.utils.aoa_to_sheet(consolidatedArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
  XLSX.writeFile(workbook, "extracted_data.xlsx");

  console.log("✅ Successfully exported extracted data to Excel.");
};

