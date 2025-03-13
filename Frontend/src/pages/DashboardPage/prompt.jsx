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

  // Updated prompt to ensure single-row JSON objects
  const refinedPrompt = `
    Extract the table data from the provided image into a JSON array. Each object in the array should represent a single row from the table, with keys matching the column headers exactly: 
      "Tipo de Ordena tivo", "Suministro", "Medidor colocado","Estado","Medidor retirado","Estado", "Precintos de Tapa", "Precintos do Bomera", "ITEM", "Long. Cable (m)","Mono 55%" ,"Trif 83%","100%,"LIN","Cab", "KIT". Ensure that no row is split across multiple objects due to newlines or formatting issues. If a value is missing, use an empty string (""). Return the result as a JSON string.
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

  // Aggregate data for consolidation
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

export const exportConsolidatedDataToExcel = (allJsonResponses, pdfFiles) => {
  let consolidatedArray = [];

  Object.keys(allJsonResponses).forEach((pdfId, index) => {
    const data = allJsonResponses[pdfId];

    let rows = [];
    if (Array.isArray(data)) {
      rows = data; // Use all objects in the array
    } else if (typeof data === "object") {
      rows = [data]; // Wrap single object in an array
    } else if (typeof data === "string") {
      rows = [{ Text: data }]; // Handle string case
    } else {
      console.error("Unexpected data format:", data);
      return;
    }

    // Add each row without PDF Name, ensuring single-row integrity
    rows.forEach((row) => {
      consolidatedArray.push({ ...row });
    });

    // Add a blank row between PDFs (except after the last PDF)
    if (index < Object.keys(allJsonResponses).length - 1) {
      consolidatedArray.push({});
    }
  });

  if (consolidatedArray.length === 0) {
    console.error("No data to export");
    return;
  }

  // Log the consolidated array for debugging
  console.log("Consolidated Array:", consolidatedArray);

  const worksheet = XLSX.utils.json_to_sheet(consolidatedArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidated Data");
  XLSX.writeFile(workbook, "consolidated_extracted_data.xlsx");
};