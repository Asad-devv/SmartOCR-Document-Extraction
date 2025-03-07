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

  const textPart = { text: prompt };

  try {
    const result = await model.generateContent([imagePart, textPart]);

    const responseText = result.response.text() || "No response received";
    console.log("📝 Model Response:", responseText);

    return responseText;

  } catch (error) {
    console.error(' Error generating content:', error);
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
export const RenderJson = ({ data }) => {
  let cleanedData;

  try {
    const cleanedString = data
      ?.replace(/```json/g, '') // Remove markdown JSON block start
      ?.replace(/```/g, '') // Remove markdown block end
      ?.replace(/^json\s*/i, '') // Remove "json" if present at the start
      ?.replace(/,\s*}/g, '}') // Remove trailing commas in objects
      ?.replace(/,\s*\]/g, ']') // Remove trailing commas in arrays
      ?.trim(); // Remove extra spaces

    cleanedData = JSON.parse(cleanedString);
    console.log(cleanedData);
  } catch (error) {
    console.error("Invalid JSON:", error);
    return <p className="text-red-500">Loading...</p>;
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      Array.isArray(cleanedData) ? cleanedData : [cleanedData]
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "exported_data.xlsx");
  };

  return (
    <div className="space-y-2 p-4 bg-white border rounded-lg shadow-md">
      <button
        onClick={exportToExcel}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Download Excel
      </button>
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
