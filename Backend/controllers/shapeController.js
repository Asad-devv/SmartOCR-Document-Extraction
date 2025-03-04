const { PDFDocument, rgb } = require('pdf-lib');
const PDF = require('../models/Pdf');
const Shape = require('../models/Shape');
const fs = require('fs');
const path = require('path');
const poppler = require('pdf-poppler');

exports.processPageWithShapes = async (req, res) => {
  try {
    const { pdfId, pageNumber, shapes } = req.body;
    if (!pdfId || !pageNumber || !shapes) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Fetching PDF record for pdfId:', pdfId);
    const pdfRecord = await PDF.findOne({ pdfId });
    if (!pdfRecord) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    console.log('PDF fileData length:', pdfRecord.fileData.length);
    const pdfDoc = await PDFDocument.load(pdfRecord.fileData);
    const pages = pdfDoc.getPages();
    if (pageNumber < 1 || pageNumber > pages.length) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    const page = pages[pageNumber - 1];
    const { width: pdfWidth, height: pdfHeight } = page.getSize();
    console.log('PDF page dimensions:', { width: pdfWidth, height: pdfHeight });

   
    shapes.forEach(shape => {
      if (shape.type === 'rectangle' && shape.page === pageNumber - 1) {
        page.drawRectangle({
          x: shape.x,
          y: pdfHeight - shape.y - shape.height, 
          width: shape.width,
          height: shape.height,
          borderColor: rgb(1, 0, 0),
          borderWidth: 2,
        });
      }
    });

    console.log('Saving modified PDF...');
    const modifiedPdfBytes = await pdfDoc.save();

    const outputDir = path.join(__dirname, 'output_images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const modifiedPdfPath = path.join(outputDir, 'modified_pdf.pdf');
    await fs.promises.writeFile(modifiedPdfPath, modifiedPdfBytes);

    console.log('Converting PDF to image using pdf-poppler...');
    const opts = {
      format: 'png',
      out_dir: outputDir,
      out_prefix: 'output_page',
      page: pageNumber,
      scale: 300,
    };
    await poppler.convert(modifiedPdfPath, opts);

    const outputImagePath = path.join(outputDir, `output_page-${pageNumber}.png`);
    console.log(`Checking generated file: ${outputImagePath}`);

    if (!fs.existsSync(outputImagePath)) {
      throw new Error(`Image conversion failed. Expected file not found: ${outputImagePath}`);
    }

    const imageBuffer = await fs.promises.readFile(outputImagePath);
    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error processing page with shapes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




exports.getShapes = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const shapeRecords = await Shape.find({ pdfId });
    res.status(200).json({ shapes: shapeRecords || [] });
  } catch (error) {
    console.error('Error fetching shapes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.drawShapesOnPDF = async (req, res) => {
  try {
    const { pdfId, shapes, pageNumber } = req.body;

    const pdfRecord = await PDF.findOne({ pdfId });
    if (!pdfRecord) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    const pdfDoc = await PDFDocument.load(pdfRecord.fileData);
    const pages = pdfDoc.getPages();
    if (pageNumber < 1 || pageNumber > pages.length) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    const page = pages[pageNumber - 1];
    const { height } = page.getSize();

    shapes.forEach(shape => {
      if (shape.type === 'rectangle') {
        page.drawRectangle({
          x: shape.x,
          y: height - shape.y - shape.height,
          width: shape.width,
          height: shape.height,
          borderColor: rgb(1, 0, 0),
          borderWidth: 2,
        });
      }
    });

    const modifiedPdfBytes = await pdfDoc.save();
    pdfRecord.fileData = Buffer.from(modifiedPdfBytes);
    await pdfRecord.save();

    res.status(200).json({ message: 'Shapes embedded successfully', pdfId });
  } catch (error) {
    console.error('Error embedding shapes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.embedShapesInPDF = async (req, res) => {
  try {
    const { pdfId, shapes, pageNumber } = req.body;
    if (!pdfId || !shapes || shapes.length === 0) {
      return res.status(400).json({ message: 'Invalid request. Missing pdfId or shapes.' });
    }

    const pdf = await PDF.findOne({ pdfId });
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found.' });
    }

    await Shape.findOneAndUpdate(
      { pdfId, pageNumber },
      { shapes },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Shapes embedded successfully!' });
  } catch (error) {
    console.error('Error embedding shapes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.saveShapes = async (req, res) => {
  try {
    const { pdfId, pageNumber, shapes } = req.body;
    let shapeRecord = await Shape.findOne({ pdfId, pageNumber });
    if (shapeRecord) {
      shapeRecord.shapes = shapes;
    } else {
      shapeRecord = new Shape({ pdfId, pageNumber, shapes });
    }
    await shapeRecord.save();
    res.status(200).json({ message: 'Shapes saved successfully' });
  } catch (error) {
    console.error('Error saving shapes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};