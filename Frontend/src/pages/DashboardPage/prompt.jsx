import { GoogleGenerativeAI } from '@google/generative-ai';
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
    // Remove unwanted characters and fix formatting
    const cleanedString = data
      .replace(/```json/g, '') // Remove markdown JSON block start
      .replace(/```/g, '') // Remove markdown block end
      .replace(/^json\s*/i, '') // Remove "json" if present at the start
      .replace(/,\s*}/g, '}') // Remove trailing commas in objects
      .replace(/,\s*\]/g, ']') // Remove trailing commas in arrays
      .trim(); // Remove extra spaces

    cleanedData = JSON.parse(cleanedString); // Parse the cleaned JSON
  } catch (error) {
    console.error("Invalid JSON:", error);
    return <p className="text-red-500">Invalid JSON data</p>;
  }

  if (typeof cleanedData === "string") {
    return <p className="text-lg font-medium text-gray-800">{cleanedData}</p>;
  }

  if (Array.isArray(cleanedData)) {
    return (
      <div className="space-y-2 p-4 bg-white border rounded-lg shadow-md">
        {cleanedData.map((item, index) => (
          <p key={index} className="text-lg text-gray-900">{item}</p>
        ))}
      </div>
    );
  }

  if (typeof cleanedData === "object" && cleanedData !== null) {
    return (
      <div className="space-y-2 p-4 bg-gray-100 rounded-lg shadow">
        {Object.values(cleanedData).flat().map((value, index) => (
          <p key={index} className="text-lg text-gray-900">{value}</p>
        ))}
      </div>
    );
  }

  return null;
};
