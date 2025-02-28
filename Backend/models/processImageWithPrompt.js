const { GoogleGenerativeAI } = require('@google/generative-ai');

async function processImageWithPrompt(imageFile, prompt) {
  if (!imageFile || !prompt) {
    throw new Error('Both image and prompt are required.');
  }

  const genAI = new GoogleGenerativeAI("AIzaSyAApY6krRmx34MGniuUMsTFIMMQEYJuMH8"); // Set in .env
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const imageBase64 = imageFile.buffer.toString('base64');

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: imageFile.type,
    },
  };

  const textPart = {
    text: prompt,
  };

  try {
    const result = await model.generateContent([imagePart, textPart]);
    const response = await result.response.text();
    return response;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('An error occurred while generating the content.');
  }
}

module.exports = { processImageWithPrompt };