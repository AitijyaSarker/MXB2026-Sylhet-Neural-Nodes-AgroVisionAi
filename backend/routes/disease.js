const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Hugging Face API configuration
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
const HF_MODEL = 'google/vit-base-patch16-224'; // Vision Transformer for accurate classification

// Disease detection using Hugging Face Inference API
const detectDiseaseHuggingFace = async (imageBuffer) => {
  try {
    if (!HF_API_KEY) {
      throw new Error('Hugging Face API key not configured');
    }

    // Convert image buffer to base64 for API
    const base64Image = imageBuffer.toString('base64');
    const imageBlob = Buffer.from(base64Image, 'base64');

    // Call Hugging Face image classification API
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      imageBlob,
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        }
      }
    );

    return response.data;
  } catch (err) {
    console.error('Hugging Face API error:', err.message);
    throw err;
  }
};

// Disease classification mapping
const getDiseaseInfo = (classification) => {
  const label = classification.label?.toLowerCase() || '';
  const score = classification.score || 0;

  // Comprehensive disease mapping
  const diseaseMap = {
    'apple___apple_scab': { crop: 'Apple', disease: 'Apple Scab', type: 'fungal' },
    'apple___black_rot': { crop: 'Apple', disease: 'Black Rot', type: 'fungal' },
    'apple___cedar_apple_rust': { crop: 'Apple', disease: 'Cedar Apple Rust', type: 'fungal' },
    'blueberry___powdery_mildew': { crop: 'Blueberry', disease: 'Powdery Mildew', type: 'fungal' },
    'cherry___powdery_mildew': { crop: 'Cherry', disease: 'Powdery Mildew', type: 'fungal' },
    'corn___cercospora_leaf_spot': { crop: 'Corn', disease: 'Cercospora Leaf Spot', type: 'fungal' },
    'corn___common_rust': { crop: 'Corn', disease: 'Common Rust', type: 'fungal' },
    'corn___northern_leaf_blight': { crop: 'Corn', disease: 'Northern Leaf Blight', type: 'fungal' },
    'grape___black_rot': { crop: 'Grape', disease: 'Black Rot', type: 'fungal' },
    'grape___esca': { crop: 'Grape', disease: 'Esca (Black Measles)', type: 'fungal' },
    'grape___leaf_blight': { crop: 'Grape', disease: 'Leaf Blight', type: 'fungal' },
    'orange___citrus_greening': { crop: 'Orange', disease: 'Citrus Greening', type: 'bacterial' },
    'peach___bacterial_spot': { crop: 'Peach', disease: 'Bacterial Spot', type: 'bacterial' },
    'pepper___bacterial_spot': { crop: 'Pepper', disease: 'Bacterial Spot', type: 'bacterial' },
    'potato___early_blight': { crop: 'Potato', disease: 'Early Blight', type: 'fungal' },
    'potato___late_blight': { crop: 'Potato', disease: 'Late Blight', type: 'fungal' },
    'squash___powdery_mildew': { crop: 'Squash', disease: 'Powdery Mildew', type: 'fungal' },
    'strawberry___leaf_scorch': { crop: 'Strawberry', disease: 'Leaf Scorch', type: 'fungal' },
    'tomato___bacterial_spot': { crop: 'Tomato', disease: 'Bacterial Spot', type: 'bacterial' },
    'tomato___early_blight': { crop: 'Tomato', disease: 'Early Blight', type: 'fungal' },
    'tomato___late_blight': { crop: 'Tomato', disease: 'Late Blight', type: 'fungal' },
    'tomato___leaf_mold': { crop: 'Tomato', disease: 'Leaf Mold', type: 'fungal' },
    'tomato___septoria_leaf_spot': { crop: 'Tomato', disease: 'Septoria Leaf Spot', type: 'fungal' },
    'tomato___spider_mites': { crop: 'Tomato', disease: 'Spider Mites', type: 'pest' },
    'tomato___target_spot': { crop: 'Tomato', disease: 'Target Spot', type: 'fungal' },
    'tomato___yellow_leaf_curl_virus': { crop: 'Tomato', disease: 'Yellow Leaf Curl Virus', type: 'viral' },
    'tomato___mosaic_virus': { crop: 'Tomato', disease: 'Mosaic Virus', type: 'viral' }
  };

  // Find matching disease
  let matchedDisease = null;
  for (const [key, value] of Object.entries(diseaseMap)) {
    if (label.includes(key) || key.includes(label.split('_')[0])) {
      matchedDisease = value;
      break;
    }
  }

  return {
    disease: matchedDisease?.disease || 'Unknown Disease',
    crop: matchedDisease?.crop || 'Unknown Crop',
    type: matchedDisease?.type || 'unknown',
    confidence: score
  };
};

router.post('/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Processing image with Hugging Face API...');

    // Optimize image size
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(224, 224, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Call Hugging Face API
    const classifications = await detectDiseaseHuggingFace(optimizedBuffer);

    // Get top prediction
    const topPrediction = Array.isArray(classifications) ? classifications[0] : classifications;

    if (!topPrediction) {
      throw new Error('No classification results received');
    }

    // Determine if healthy or diseased
    const isHealthy = topPrediction.label?.toLowerCase().includes('healthy');
    const diseaseInfo = getDiseaseInfo(topPrediction);

    const result = {
      diseaseName: isHealthy ? 'Healthy' : diseaseInfo.disease,
      cropName: diseaseInfo.crop,
      confidence: topPrediction.score,
      description: isHealthy
        ? 'This plant appears healthy with no visible signs of disease.'
        : `${diseaseInfo.disease} detected on ${diseaseInfo.crop}. This is a ${diseaseInfo.type} disease.`,
      solution: isHealthy
        ? ['Continue good agricultural practices', 'Monitor regularly']
        : ['Consult local agricultural expert for immediate action', 'Document the symptoms with photos'],
      prevention: [
        'Monitor the plant regularly',
        'Maintain proper irrigation and drainage',
        'Practice crop rotation',
        'Ensure proper plant spacing'
      ],
      confidence_score: (topPrediction.score * 100).toFixed(2),
      raw_predictions: classifications.slice(0, 3) // Top 3 predictions
    };

    console.log('Detection successful:', result);
    res.json(result);

  } catch (err) {
    console.error('Detection error:', err.message);
    res.status(500).json({ 
      error: 'Failed to detect disease',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
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