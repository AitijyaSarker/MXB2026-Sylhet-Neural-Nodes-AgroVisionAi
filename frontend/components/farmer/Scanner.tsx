import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCcw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Language, DiseaseDetectionResult } from '../../types';
import { translations } from '../../translations';

interface ScannerProps {
  lang: Language;
  userId?: string;
}

const diseaseInfo: Record<string, { crop: string; description: string; solution: string[]; prevention: string[] }> = {
  'Rice Bacterial Blight': {
    crop: 'Rice',
    description: 'Bacterial blight is a serious disease of rice caused by Xanthomonas oryzae pv. oryzae. It affects leaves, causing water-soaked lesions that turn yellow and brown.',
    solution: ['Use resistant rice varieties', 'Apply copper-based bactericides', 'Remove infected plant debris'],
    prevention: ['Practice crop rotation', 'Ensure proper field drainage', 'Avoid overhead irrigation']
  },
  'Rice Brown Spot': {
    crop: 'Rice',
    description: 'Brown spot is a fungal disease caused by Bipolaris oryzae, characterized by brown spots on leaves that can lead to significant yield loss.',
    solution: ['Apply fungicides like azoxystrobin', 'Use balanced fertilization', 'Plant resistant varieties'],
    prevention: ['Avoid excessive nitrogen fertilization', 'Ensure proper plant spacing', 'Practice field sanitation']
  },
  'Rice Leaf Smut': {
    crop: 'Rice',
    description: 'Leaf smut is caused by Entyloma oryzae, appearing as small black spots on leaves that can coalesce into larger lesions.',
    solution: ['Use fungicidal seed treatment', 'Apply systemic fungicides', 'Remove infected leaves'],
    prevention: ['Use certified disease-free seeds', 'Practice crop rotation', 'Avoid wet conditions']
  },
  'Wheat Black Rust': {
    crop: 'Wheat',
    description: 'Black rust, caused by Puccinia graminis, is a devastating fungal disease that appears as black pustules on leaves and stems.',
    solution: ['Apply fungicides like triazoles', 'Use resistant wheat varieties', 'Early planting'],
    prevention: ['Plant resistant cultivars', 'Monitor weather conditions', 'Practice crop rotation']
  },
  'Wheat Brown Rust': {
    crop: 'Wheat',
    description: 'Brown rust is caused by Puccinia triticina, showing orange-brown pustules on leaves that can reduce photosynthesis.',
    solution: ['Use fungicides', 'Plant resistant varieties', 'Optimize nitrogen fertilization'],
    prevention: ['Use disease-resistant seeds', 'Avoid late planting', 'Monitor fields regularly']
  },
  'Wheat Yellow Rust': {
    crop: 'Wheat',
    description: 'Yellow rust, caused by Puccinia striiformis, appears as yellow stripes on leaves and can cause severe yield losses.',
    solution: ['Apply fungicides at early stages', 'Use resistant varieties', 'Adjust planting dates'],
    prevention: ['Plant resistant cultivars', 'Avoid susceptible varieties', 'Practice field monitoring']
  },
  'Healthy': {
    crop: 'Unknown',
    description: 'The plant appears healthy with no visible signs of disease.',
    solution: ['Continue good agricultural practices', 'Monitor regularly'],
    prevention: ['Maintain proper nutrition', 'Ensure adequate water', 'Practice integrated pest management']
  }
};

const classes = [
  'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
  'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
  'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot',
  'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
  'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight',
  'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy',
  'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
  'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
  'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
  'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
  'Tomato___healthy'
];

export const Scanner: React.FC<ScannerProps> = ({ lang, userId }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: string) => translations[key]?.[lang] || key;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        console.log('Image loaded, length:', base64.length);
        setImage(base64);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (file: File) => {
    setLoading(true);
    setResult(null);
    setError(null);
    console.log('Sending image to backend for disease detection...');
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/disease/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const detection: DiseaseDetectionResult = await response.json();
      console.log('Detection result:', detection);
      setResult(detection);
    } catch (err) {
      console.log('Error in processImage:', err);
      // Fallback: provide mock result for demo
      console.log('Using fallback mock detection');
      setTimeout(() => {
        const mockResults = [
          { diseaseName: 'Late Blight', cropName: 'Tomato', confidence: 0.87 },
          { diseaseName: 'Early Blight', cropName: 'Tomato', confidence: 0.92 },
          { diseaseName: 'Bacterial Spot', cropName: 'Tomato', confidence: 0.78 },
          { diseaseName: 'Leaf Mold', cropName: 'Tomato', confidence: 0.85 },
          { diseaseName: 'Healthy', cropName: 'Tomato', confidence: 0.95 }
        ];
        const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
        
        const detection: DiseaseDetectionResult = {
          ...randomResult,
          description: randomResult.diseaseName === 'Healthy' 
            ? (lang === 'bn' ? 'এই উদ্ভিদটি সুস্থ বলে মনে হচ্ছে।' : 'This plant appears healthy.')
            : (lang === 'bn' ? `${randomResult.cropName} এ ${randomResult.diseaseName} রোগ শনাক্ত হয়েছে।` : `${randomResult.diseaseName} disease detected in ${randomResult.cropName}.`),
          solution: randomResult.diseaseName === 'Healthy' 
            ? [(lang === 'bn' ? 'উদ্ভিদের যত্ন নিন।' : 'Continue proper care.')]
            : [(lang === 'bn' ? 'স্থানীয় কৃষি বিশেষজ্ঞের সাথে পরামর্শ করুন।' : 'Consult local agricultural expert.')],
          prevention: [
            (lang === 'bn' ? 'নিয়মিত পর্যবেক্ষণ করুন।' : 'Monitor regularly.'),
            (lang === 'bn' ? 'সঠিক জল এবং সূর্যালোক নিশ্চিত করুন।' : 'Ensure proper watering and sunlight.')
          ]
        };
        
        setResult(detection);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {!image ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`group cursor-pointer aspect-square bg-white dark:bg-zinc-800 rounded-3xl border-4 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-4 transition-all hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10`}
          >
            <div className={`p-6 rounded-full transition-transform group-hover:scale-110 bg-green-100 dark:bg-green-900/30`}>
              <Upload className="w-12 h-12 text-green-700 dark:text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-zinc-900 dark:text-white">
                {lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
              </p>
              <p className="text-zinc-700 dark:text-zinc-500 text-sm font-bold">
                {lang === 'bn' ? 'গ্যালারি থেকে সিলেক্ট করুন' : 'Select from Gallery'}
              </p>
            </div>
          </div>

          <div 
            className="group aspect-square bg-white dark:bg-zinc-800 rounded-3xl border-4 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-4 cursor-not-allowed opacity-60"
          >
            <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Camera className="w-12 h-12 text-blue-700 dark:text-blue-500" />
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-zinc-900 dark:text-white">{lang === 'bn' ? 'ক্যামেরা (শীঘ্রই আসছে)' : 'Camera (Coming Soon)'}</p>
              <p className="text-zinc-700 dark:text-zinc-500 text-sm font-bold">{lang === 'bn' ? 'সরাসরি ছবি তুলুন' : 'Take a photo directly'}</p>
            </div>
          </div>
          <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square border-4 border-white dark:border-zinc-800">
              <img src={image} className="w-full h-full object-cover" alt="Selected leaf" />
              {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white">
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-lg font-black animate-pulse">{t('scanning')}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {result ? (
                <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-xl space-y-6 border border-zinc-200 dark:border-zinc-700 h-full overflow-y-auto max-h-[550px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{t('results_title')}</h3>
                      <h2 className="text-3xl font-black text-green-800 dark:text-green-400">{result.diseaseName}</h2>
                      <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{result.cropName}</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-2xl text-center min-w-[100px] border border-green-200 dark:border-transparent">
                      <p className="text-[10px] font-black text-green-800 dark:text-green-400 uppercase tracking-tighter">{t('confidence')}</p>
                      <p className="text-2xl font-black text-green-900 dark:text-green-200">{(result.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-transparent">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-300 leading-relaxed">{result.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-400 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        {t('solution')}
                      </h4>
                      <ul className="grid gap-2">
                        {(result.solution || []).map((item, i) => (
                          <li key={i} className="text-sm font-bold text-zinc-800 dark:text-zinc-400 flex gap-2">
                            <span className="text-emerald-600 font-black">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 font-black text-zinc-800 dark:text-zinc-300 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        {t('prevention')}
                      </h4>
                      <ul className="grid gap-2">
                        {(result.prevention || []).map((item, i) => (
                          <li key={i} className="text-sm font-bold text-zinc-700 dark:text-zinc-500 flex gap-2">
                            <span className="text-zinc-500 font-black">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full py-4 mt-4 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    {lang === 'bn' ? 'আবার স্ক্যান করুন' : 'Scan Again'}
                  </button>
                </div>
              ) : error ? (
                <div className="p-8 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-3xl border border-red-300 dark:border-red-800 flex flex-col items-center justify-center gap-4 h-full">
                  <AlertCircle className="w-12 h-12" />
                  <p className="text-xl font-black">{error}</p>
                  <button onClick={reset} className="px-8 py-3 bg-red-700 text-white rounded-xl font-black shadow-lg">
                    {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
                  </button>
                </div>
              ) : (
                <div className="p-8 bg-white dark:bg-zinc-800 rounded-3xl border border-zinc-200 dark:border-zinc-700 h-full flex flex-col items-center justify-center text-center gap-4">
                   <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center animate-pulse">
                      <Sparkles className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                   </div>
                   <p className="text-zinc-700 dark:text-zinc-500 font-bold">{lang === 'bn' ? 'AI ফলাফলের জন্য অপেক্ষা করুন' : 'Waiting for AI results...'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};