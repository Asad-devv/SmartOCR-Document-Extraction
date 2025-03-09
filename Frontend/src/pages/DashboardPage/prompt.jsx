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
      ?.replace(/```json/g, '') 
      ?.replace(/```/g, '') 
      ?.replace(/^json\s*/i, '') 
      ?.replace(/,\s*}/g, '}') 
      ?.replace(/,\s*\]/g, ']')
      ?.trim(); 

    cleanedData = JSON.parse(cleanedString);
    console.log(cleanedData);
  } catch (error) {
    console.error("Invalid JSON:", error);
    return <p className="text-red-500">Loading...</p>;
  }

  const exportToExcel = () => {
    let cleanedArray = [];
  
    if (Array.isArray(cleanedData)) {
      if (cleanedData.every(item => typeof item === "object" && !Array.isArray(item))) {
        cleanedArray = cleanedData; 
      } else if (cleanedData.every(item => typeof item === "string")) {
       
        cleanedArray = [{ Text: cleanedData.join(" ") }];
      } else {
        cleanedArray = cleanedData.map(row => {
          if (Array.isArray(row)) {
            return row.reduce((acc, obj) => ({ ...acc, ...obj }), {});
          }
          return row; 
        });
      }
    } else if (typeof cleanedData === "object") {
      cleanedArray = [cleanedData]; 
    } else if (typeof cleanedData === "string") {
     
      cleanedArray = [{ Text: cleanedData }];
    } else {
      console.error("Unexpected data format:", cleanedData);
      return;
    }
  
    if (cleanedArray.length === 0) {
      console.error("No data to export");
      return;
    }
  
    
    const worksheet = XLSX.utils.json_to_sheet(cleanedArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
    XLSX.writeFile(workbook, "extracted_data.xlsx");
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
