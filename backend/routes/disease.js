const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const ort = require('onnxruntime-node');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Cache the model
let model = null;

const loadModel = async () => {
  if (model) return model;

  try {
    console.log('Loading ONNX tomato disease model...');
    const response = await fetch('https://huggingface.co/asankisan/plant-disease-model/resolve/main/tomato_disease.onnx');
    const modelData = await response.arrayBuffer();
    const modelBuffer = new Uint8Array(modelData);

    model = await ort.InferenceSession.create(modelBuffer, {
      logId: 'tomato-disease-model'
    });

    console.log('Model loaded successfully');
    return model;
  } catch (err) {
    console.error('Error loading model:', err);
    throw err;
  }
};

const preprocessImage = async (buffer) => {
  // Resize and normalize image
  const image = sharp(buffer);
  const { data, info } = await image
    .resize(224, 224, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const input = new Float32Array(3 * 224 * 224);

  // Convert to CHW format with ImageNet normalization
  for (let i = 0; i < data.length; i += 3) {
    const r = (data[i] / 255 - 0.485) / 0.229;
    const g = (data[i + 1] / 255 - 0.456) / 0.224;
    const b = (data[i + 2] / 255 - 0.406) / 0.225;
    const idx = (i / 3) * 3;
    input[idx] = r;
    input[idx + 1] = g;
    input[idx + 2] = b;
  }

  return new ort.Tensor('float32', input, [1, 3, 224, 224]);
};

// Disease classes for tomato
const diseaseClasses = [
  'Tomato_bacterial_spot', 'Tomato_early_blight', 'Tomato_late_blight',
  'Tomato_leaf_mold', 'Tomato_septoria_leaf_spot', 'Tomato_spider_mites',
  'Tomato_target_spot', 'Tomato_yellow_leaf_curl_virus', 'Tomato_mosaic_virus',
  'Tomato_healthy'
];

router.post('/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Load model if not loaded
    const session = await loadModel();

    // Preprocess image
    const tensor = await preprocessImage(req.file.buffer);

    // Run inference
    const results = await session.run({ input: tensor });
    const output = results.output.data;
    const maxIndex = output.indexOf(Math.max(...output));
    const confidence = output[maxIndex];

    // Get disease info
    const diseaseClass = diseaseClasses[maxIndex];
    const [crop, disease] = diseaseClass.split('_', 2);
    const isHealthy = disease.toLowerCase().includes('healthy');

    const result = {
      diseaseName: isHealthy ? 'Healthy' : disease.replace(/_/g, ' '),
      cropName: crop.replace(/[()]/g, '').replace('_', ' '),
      confidence: confidence,
      description: isHealthy
        ? 'This plant appears healthy.'
        : `${disease.replace(/_/g, ' ')} disease detected in ${crop}.`,
      solution: isHealthy
        ? ['Continue proper care.']
        : ['Consult local agricultural expert.'],
      prevention: [
        'Monitor regularly.',
        'Ensure proper watering and sunlight.'
      ]
    };

    res.json(result);
  } catch (err) {
    console.error('Detection error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

module.exports = router;