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

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response received";
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