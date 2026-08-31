// Generate minimal valid PNG files for PWA icons
// These are simple solid-color PNGs

function createPNG(size) {
  // Minimal valid PNG: 1x1 pixel, solid indigo color (#6366f1)
  // We'll use a proper PNG structure
  const width = size;
  const height = size;
  
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // IDAT chunk - create image data
  // Each row: filter byte (0) + RGB pixels
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 3;
      // Create a circle/rounded square pattern
      const cx = width / 2;
      const cy = height / 2;
      const r = width * 0.4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < r) {
        // Inside circle: white rupee symbol area
        rawData[px] = 255;     // R
        rawData[px + 1] = 255; // G
        rawData[px + 2] = 255; // B
      } else if (dist < r + width * 0.05) {
        // Border: slightly lighter indigo
        rawData[px] = 99;      // R
        rawData[px + 1] = 102; // G
        rawData[px + 2] = 241; // B
      } else {
        // Background: indigo
        rawData[px] = 79;      // R
        rawData[px + 1] = 70;  // G
        rawData[px + 2] = 229; // B
      }
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons
const fs = require('fs');
fs.writeFileSync('pwa-192x192.png', createPNG(192));
fs.writeFileSync('pwa-512x512.png', createPNG(512));
console.log('Icons generated successfully');
