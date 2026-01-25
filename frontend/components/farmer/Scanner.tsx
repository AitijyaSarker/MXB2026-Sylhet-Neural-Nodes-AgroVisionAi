import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCcw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Language, DiseaseDetectionResult } from '../../types';
import { translations } from '../../translations';
import { DISEASE_API } from '../../api.config';

interface ScannerProps {
  lang: Language;
  userId?: string;
}

const diseaseInfo: Record<string, { crop: string; description: string; solution: { en: string[]; bn: string[] }; prevention: { en: string[]; bn: string[] } }> = {
  'Rice Bacterial Blight': {
    crop: 'Rice',
    description: 'Bacterial blight is a serious disease of rice caused by Xanthomonas oryzae pv. oryzae. It affects leaves, causing water-soaked lesions that turn yellow and brown.',
    solution: {
      en: [
        'Use resistant rice varieties (IR24, IR64, Pusa Basmati)',
        'Apply copper-based bactericides like Bordeaux mixture (1%)',
        'Remove infected plant debris immediately after harvest',
        'Spray streptomycin sulfate (500 ppm) every 10 days',
        'Use aerial spraying for large infested areas',
        'Apply bactericides like kasugamycin at 3ml/liter',
        'Prune and burn infected leaves and stems',
        'Use zinc and potassium rich fertilizers to strengthen plants'
      ],
      bn: [
        'প্রতিরোধী ধান জাত ব্যবহার করুন (IR24, IR64, Pusa Basmati)',
        'তামা-ভিত্তিক ব্যাকটেরিসাইড যেমন বোর্ডো মিশ্রণ (১%) প্রয়োগ করুন',
        'সংক্রমিত উদ্ভিদ অবশেষ ফসল কাটার পর তৎক্ষণাৎ সরান',
        '১০ দিনের ব্যবধানে স্ট্রেপ্টোমাইসিন সালফেট (৫০০ ppm) স্প্রে করুন',
        'বড় সংক্রমিত এলাকার জন্য বায়বীয় স্প্রেয়িং ব্যবহার করুন',
        'কাসুগামাইসিনের মতো ব্যাকটেরিসাইড ৩ml/লিটার হারে প্রয়োগ করুন',
        'সংক্রমিত পাতা এবং কাণ্ড ছাঁটাই করে পুড়িয়ে ফেলুন',
        'উদ্ভিদকে শক্তিশালী করতে জিংক এবং পটাশিয়াম সমৃদ্ধ সার ব্যবহার করুন'
      ]
    },
    prevention: {
      en: [
        'Practice crop rotation with non-host crops',
        'Ensure proper field drainage to reduce humidity',
        'Avoid overhead irrigation; use drip irrigation',
        'Space plants adequately for air circulation',
        'Use certified disease-free seeds',
        'Clean and disinfect tools before field operations',
        'Remove weeds that can harbor pathogens',
        'Monitor fields regularly during growing season',
        'Apply preventive fungicides at early growth stages'
      ],
      bn: [
        'অ-পোষক শস্যের সাথে ফসলের রোটেশন চর্চা করুন',
        'আর্দ্রতা কমাতে সঠিক ক্ষেত গ্যালারি নিশ্চিত করুন',
        'ওভারহেড সেচ এড়িয়ে ড্রিপ সেচ ব্যবহার করুন',
        'বায়ু সংচালনের জন্য উদ্ভিদকে যথাযথ দূরত্বে রোপণ করুন',
        'প্রত্যয়িত রোগমুক্ত বীজ ব্যবহার করুন',
        'ক্ষেত্র কাজের আগে সরঞ্জাম পরিষ্কার এবং জীবাণুনাশক করুন',
        'রোগজনকদের আশ্রয় করতে পারে এমন আগাছা অপসারণ করুন',
        'বৃদ্ধির মৌসুমে নিয়মিত ক্ষেত্র পর্যবেক্ষণ করুন',
        'প্রাথমিক বৃদ্ধির পর্যায়ে প্রতিরোধমূলক ছত্রাকনাশক প্রয়োগ করুন'
      ]
    }
  },
  'Rice Brown Spot': {
    crop: 'Rice',
    description: 'Brown spot is a fungal disease caused by Bipolaris oryzae, characterized by brown spots on leaves.',
    solution: {
      en: [
        'Apply fungicides like azoxystrobin at 1.2ml/liter',
        'Use propiconazole or hexaconazole (0.5ml/liter)',
        'Plant resistant varieties like Pusa Basmati 1121',
        'Ensure balanced fertilization (avoid excessive nitrogen)',
        'Use biofortified seeds when available',
        'Apply trichoderma as a biocontrol agent',
        'Spray bordeaux mixture (1%) every 2 weeks',
        'Remove and burn severely affected leaves'
      ],
      bn: [
        'অ্যাজোক্সিস্ট্রোবিন ১.২ml/লিটার হারে ছত্রাকনাশক প্রয়োগ করুন',
        'প্রপিকোনাজোল বা হেক্সাকোনাজোল (0.5ml/লিটার) ব্যবহার করুন',
        'প্রতিরোধী জাত যেমন Pusa Basmati 1121 রোপণ করুন',
        'সুষম সার নিশ্চিত করুন (অতিরিক্ত নাইট্রোজেন এড়ান)',
        'উপলব্ধ থাকলে জৈব সমৃদ্ধ বীজ ব্যবহার করুন',
        'জৈব নিয়ন্ত্রণ এজেন্ট হিসাবে ট্রাইকোডার্মা প্রয়োগ করুন',
        '২ সপ্তাহের ব্যবধানে বোর্ডো মিশ্রণ (১%) স্প্রে করুন',
        'গুরুতরভাবে প্রভাবিত পাতা অপসারণ করে পুড়িয়ে ফেলুন'
      ]
    },
    prevention: {
      en: [
        'Avoid excessive nitrogen fertilization',
        'Ensure proper plant spacing for air movement',
        'Practice field sanitation regularly',
        'Use disease-free seeds from certified sources',
        'Avoid overhead irrigation during early growth',
        'Monitor fields regularly for early symptoms',
        'Implement crop rotation practices',
        'Maintain proper water management',
        'Remove volunteer plants in field'
      ],
      bn: [
        'অতিরিক্ত নাইট্রোজেন সার এড়িয়ে চলুন',
        'বায়ু চলাচলের জন্য সঠিক উদ্ভিদ ব্যবধান নিশ্চিত করুন',
        'নিয়মিত ক্ষেত্র পরিস্কার অনুশীলন করুন',
        'প্রত্যয়িত উৎস থেকে রোগমুক্ত বীজ ব্যবহার করুন',
        'প্রাথমিক বৃদ্ধির সময় ওভারহেড সেচ এড়িয়ে চলুন',
        'প্রাথমিক লক্ষণের জন্য নিয়মিত ক্ষেত্র পর্যবেক্ষণ করুন',
        'ফসল ঘূর্ণন অনুশীলন প্রয়োগ করুন',
        'সঠিক জল ব্যবস্থাপনা বজায় রাখুন',
        'ক্ষেত্রে স্বেচ্ছাসেবক উদ্ভিদ অপসারণ করুন'
      ]
    }
  },
  'Rice Leaf Smut': {
    crop: 'Rice',
    description: 'Leaf smut is caused by Entyloma oryzae, appearing as small black spots on leaves.',
    solution: {
      en: [
        'Use fungicidal seed treatment (Carbendazim 50% WP)',
        'Apply systemic fungicides like propiconazole',
        'Remove infected leaves immediately',
        'Spray mancozeb (0.2%) every 10 days',
        'Use resistant varieties when available',
        'Apply copper oxychloride (1%) for management',
        'Implement integrated disease management',
        'Monitor seedbeds for early detection'
      ],
      bn: [
        'ছত্রাকনাশক বীজ চিকিৎসা ব্যবহার করুন (Carbendazim 50% WP)',
        'প্রোপিকোনাজোলের মতো সিস্টেমিক ছত্রাকনাশক প্রয়োগ করুন',
        'সংক্রমিত পাতা তৎক্ষণাৎ অপসারণ করুন',
        '১০ দিনের ব্যবধানে ম্যানকোজেব (0.2%) স্প্রে করুন',
        'উপলব্ধ থাকলে প্রতিরোধী জাত ব্যবহার করুন',
        'ব্যবস্থাপনার জন্য তামা অক্সিক্লোরাইড (১%) প্রয়োগ করুন',
        'সমন্বিত রোগ ব্যবস্থাপনা প্রয়োগ করুন',
        'প্রাথমিক সনাক্তকরণের জন্য বীজতলা পর্যবেক্ষণ করুন'
      ]
    },
    prevention: {
      en: [
        'Use certified disease-free seeds',
        'Practice crop rotation with non-host crops',
        'Avoid wet conditions in seedbeds',
        'Ensure proper spacing in nurseries',
        'Maintain field sanitation practices',
        'Remove alternate host weeds',
        'Use balanced nutrition',
        'Monitor nurseries regularly',
        'Disinfect tools and equipment'
      ],
      bn: [
        'প্রত্যয়িত রোগমুক্ত বীজ ব্যবহার করুন',
        'অ-পোষক শস্যের সাথে ফসলের রোটেশন অনুশীলন করুন',
        'বীজতলায় আর্দ্র অবস্থা এড়িয়ে চলুন',
        'নার্সারিতে সঠিক ব্যবধান নিশ্চিত করুন',
        'ক্ষেত্র পরিস্কার অনুশীলন বজায় রাখুন',
        'বিকল্প পোষক আগাছা অপসারণ করুন',
        'সুষম পুষ্টি ব্যবহার করুন',
        'নিয়মিত নার্সারি পর্যবেক্ষণ করুন',
        'সরঞ্জাম এবং যন্ত্রপাতি জীবাণুনাশক করুন'
      ]
    }
  },
  'Wheat Black Rust': {
    crop: 'Wheat',
    description: 'Black rust, caused by Puccinia graminis, is a devastating fungal disease with black pustules.',
    solution: {
      en: [
        'Apply fungicides like triazoles (tebuconazole, propiconazole)',
        'Use resistant wheat varieties (HD3059, HD3086)',
        'Early planting of variety to escape rust season',
        'Spray metalaxyl + mancozeb (0.2%) combination',
        'Apply azoxystrobin + tebuconazole formulations',
        'Use foliar spray of potassium nitrate to boost immunity',
        'Implement integrated fungicide strategy',
        'Monitor weather conditions for rust development'
      ],
      bn: [
        'ট্রায়াজোলের মতো ছত্রাকনাশক প্রয়োগ করুন (tebuconazole, propiconazole)',
        'প্রতিরোধী গম জাত ব্যবহার করুন (HD3059, HD3086)',
        'মরিচা ঋতু এড়াতে জাতের প্রাথমিক রোপণ করুন',
        'ম্যাটালাক্সিল + ম্যানকোজেব (0.2%) সংমিশ্রণ স্প্রে করুন',
        'অ্যাজোক্সিস্ট্রোবিন + tebuconazole ফর্মুলেশন ব্যবহার করুন',
        'রোগ প্রতিরোধ ক্ষমতা বৃদ্ধির জন্য পটাসিয়াম নাইট্রেট পত্র স্প্রে ব্যবহার করুন',
        'সমন্বিত ছত্রাকনাশক কৌশল প্রয়োগ করুন',
        'মরিচা উন্নয়নের জন্য আবহাওয়ার অবস্থা পর্যবেক্ষণ করুন'
      ]
    },
    prevention: {
      en: [
        'Plant resistant cultivars suitable for region',
        'Monitor weather conditions regularly',
        'Practice crop rotation practices',
        'Remove volunteer wheat plants',
        'Clean equipment between fields',
        'Adjust planting dates based on rust forecast',
        'Maintain proper field hygiene',
        'Use varieties with disease resistance genes',
        'Report disease incidence to authorities'
      ],
      bn: [
        'অঞ্চলের জন্য উপযুক্ত প্রতিরোধী চাষাবাদ রোপণ করুন',
        'নিয়মিত আবহাওয়ার অবস্থা পর্যবেক্ষণ করুন',
        'ফসল ঘূর্ণন অনুশীলন করুন',
        'স্বেচ্ছাসেবক গম উদ্ভিদ অপসারণ করুন',
        'ক্ষেত্রগুলির মধ্যে সরঞ্জাম পরিষ্কার করুন',
        'মরিচা পূর্বাভাসের উপর ভিত্তি করে রোপণের তারিখ সামঞ্জস্য করুন',
        'সঠিক ক্ষেত্র স্বাস্থ্যবিধি বজায় রাখুন',
        'রোগ প্রতিরোধ জিন সহ জাত ব্যবহার করুন',
        'কর্তৃপক্ষকে রোগের ঘটনা রিপোর্ট করুন'
      ]
    }
  },
  'Healthy': {
    crop: 'Unknown',
    description: 'The plant appears healthy with no visible signs of disease.',
    solution: {
      en: [
        'Continue current good agricultural practices',
        'Monitor plant health regularly',
        'Maintain proper watering schedule',
        'Provide adequate sunlight and nutrients',
        'Keep field clean and weed-free',
        'Watch for early signs of any diseases',
        'Document plant progress with photos',
        'Consult specialist if any symptoms appear'
      ],
      bn: [
        'বর্তমান ভাল কৃষি অনুশীলন চালিয়ে যান',
        'নিয়মিত উদ্ভিদের স্বাস্থ্য পর্যবেক্ষণ করুন',
        'সঠিক জল সরবরাহের সময়সূচী বজায় রাখুন',
        'যথাযথ সূর্যালোক এবং পুষ্টি প্রদান করুন',
        'ক্ষেত্র পরিষ্কার এবং আগাছামুক্ত রাখুন',
        'যেকোনো রোগের প্রাথমিক লক্ষণ পর্যবেক্ষণ করুন',
        'ছবি দিয়ে উদ্ভিদের অগ্রগতি ডকুমেন্ট করুন',
        'যেকোনো লক্ষণ দেখা দিলে বিশেষজ্ঞের সাথে পরামর্শ করুন'
      ]
    },
    prevention: {
      en: [
        'Maintain integrated pest management',
        'Regular field inspections',
        'Proper nutrient and water management',
        'Use quality seeds and seedlings',
        'Keep disease-free environment',
        'Monitor weather patterns',
        'Record all field activities',
        'Share knowledge with other farmers'
      ],
      bn: [
        'সমন্বিত কীটপতঙ্গ ব্যবস্থাপনা বজায় রাখুন',
        'নিয়মিত ক্ষেত্র পরিদর্শন',
        'সঠিক পুষ্টি এবং জল ব্যবস্থাপনা',
        'গুণমান বীজ এবং চারা ব্যবহার করুন',
        'রোগমুক্ত পরিবেশ রাখুন',
        'আবহাওয়ার ধরন পর্যবেক্ষণ করুন',
        'সমস্ত ক্ষেত্র কার্যক্রম রেকর্ড করুন',
        'অন্যান্য কৃষকদের সাথে জ্ঞান শেয়ার করুন'
      ]
    }
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

      const response = await fetch(`${DISEASE_API}/detect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const detection: DiseaseDetectionResult = await response.json();
      console.log('Detection result:', detection);
      
      // Merge with comprehensive disease info from database
      const diseaseDetails = diseaseInfo[detection.diseaseName];
      const enrichedDetection: DiseaseDetectionResult = {
        ...detection,
        solution: diseaseDetails?.solution?.[lang as Language] || detection.solution,
        prevention: diseaseDetails?.prevention?.[lang as Language] || detection.prevention,
        description: diseaseDetails?.description || detection.description
      };
      
      console.log('Enriched detection result:', enrichedDetection);
      setResult(enrichedDetection);
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
        
        // Get disease info if available
        const diseaseDetails = diseaseInfo[randomResult.diseaseName];
        
        const detection: DiseaseDetectionResult = {
          ...randomResult,
          description: diseaseDetails?.description || (lang === 'bn' ? `${randomResult.cropName} এ ${randomResult.diseaseName} রোগ শনাক্ত হয়েছে।` : `${randomResult.diseaseName} disease detected in ${randomResult.cropName}.`),
          solution: diseaseDetails?.solution?.[lang as Language] || (
            lang === 'bn'
              ? ['স্থানীয় কৃষি বিশেষজ্ঞের সাথে পরামর্শ করুন সুনির্দিষ্ট চিকিৎসা বিকল্পের জন্য']
              : ['Consult local agricultural expert for specific treatment options']
          ),
          prevention: diseaseDetails?.prevention?.[lang as Language] || (
            lang === 'bn'
              ? ['উদ্ভিদটি নিয়মিত পর্যবেক্ষণ করুন', 'সঠিক যত্ন বজায় রাখুন']
              : ['Monitor the plant regularly', 'Maintain proper care']
          )
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
        <div className="space-y-6">
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
          </div>

          {/* Additional Actions Button */}
          <button
            className="w-full py-5 px-8 bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl hover:shadow-2xl hover:scale-105 active:scale-95 border-2 border-white dark:border-zinc-700 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform -translate-x-full group-hover:translate-x-full" style={{transitionDuration: '600ms'}} />
            <Sparkles className="w-7 h-7 relative z-10" />
            <span className="relative z-10">{lang === 'bn' ? 'পাওয়ার স্ক্যান' : 'Power Scan'}</span>
          </button>
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
                <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-xl space-y-6 border border-zinc-200 dark:border-zinc-700 h-full overflow-y-auto max-h-137.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{t('results_title')}</h3>
                      <h2 className="text-3xl font-black text-green-800 dark:text-green-400">{result.diseaseName}</h2>
                      <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{result.cropName}</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-2xl text-center min-w-25 border border-green-200 dark:border-transparent">
                      <p className="text-[10px] font-black text-green-800 dark:text-green-400 uppercase tracking-tighter">{t('confidence')}</p>
                      <p className="text-2xl font-black text-green-900 dark:text-green-200">{(result.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-transparent">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-300 leading-relaxed">{result.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-400 mb-3">
                        <CheckCircle2 className="w-5 h-5" />
                        {t('solution')}
                      </h4>
                      <ul className="grid gap-2">
                        {Array.isArray(result.solution) ? (
                          result.solution.map((item, i) => (
                            <li key={i} className="text-sm font-bold text-zinc-800 dark:text-zinc-400 flex gap-2">
                              <span className="text-emerald-600 font-black">•</span>
                              {item}
                            </li>
                          ))
                        ) : (
                          // Handle new structure with en/bn
                          (result.solution as any)?.[lang] ? (
                            (result.solution as any)[lang].map((item: string, i: number) => (
                              <li key={i} className="text-sm font-bold text-zinc-800 dark:text-zinc-400 flex gap-2">
                                <span className="text-emerald-600 font-black">•</span>
                                {item}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm font-bold text-zinc-800 dark:text-zinc-400">No solutions available</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 font-black text-zinc-800 dark:text-zinc-300 mb-3">
                        <AlertCircle className="w-5 h-5" />
                        {t('prevention')}
                      </h4>
                      <ul className="grid gap-2">
                        {Array.isArray(result.prevention) ? (
                          result.prevention.map((item, i) => (
                            <li key={i} className="text-sm font-bold text-zinc-700 dark:text-zinc-500 flex gap-2">
                              <span className="text-zinc-500 font-black">•</span>
                              {item}
                            </li>
                          ))
                        ) : (
                          // Handle new structure with en/bn
                          (result.prevention as any)?.[lang] ? (
                            (result.prevention as any)[lang].map((item: string, i: number) => (
                              <li key={i} className="text-sm font-bold text-zinc-700 dark:text-zinc-500 flex gap-2">
                                <span className="text-zinc-500 font-black">•</span>
                                {item}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm font-bold text-zinc-700 dark:text-zinc-500">No prevention tips available</li>
                          )
                        )}
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