import { useRef, useEffect, useState } from "react";

export default function ImageWithShapes() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded) {
      drawImageWithShapes();
    }
  }, [imageLoaded]);

  const drawImageWithShapes = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size based on the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw static centered rectangles
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const shapes = [
      { x: centerX - 150, y: centerY - 100, width: 300, height: 200 },
      { x: centerX - 200, y: centerY + 50, width: 400, height: 250 },
      { x: centerX - 100, y: centerY - 250, width: 200, height: 100 },
    ];

    shapes.forEach(({ x, y, width, height }) => {
      ctx.strokeRect(x, y, width, height);
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageLoaded(true); // Ensure image is fully loaded before drawing
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const exportImage = () => {
    if (!imageLoaded) {
      alert("Please upload and process an image first!");
      return;
    }
    const canvas = canvasRef.current;
    const imageURL = canvas.toDataURL("image/png");

    // Create and trigger download
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "processed_image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <input type="file" accept="image/*" onChange={handleImageUpload} className="pt-40 mb-4 p-2 border rounded" />
      <canvas ref={canvasRef} className="border shadow-lg mt-2" />
      <button
        onClick={exportImage}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        disabled={!imageLoaded}
      >
        Download Processed Image
      </button>
    </div>
  );
}
