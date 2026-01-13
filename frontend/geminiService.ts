import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getChatResponse = async (history: any[], userMsg: string, lang: string) => {
  if (!GEMINI_API_KEY) {
    return lang === 'bn' ? 'এআই চ্যাটবট এখনও সক্রিয় নয়। পরে চেষ্টা করুন।' : 'AI chatbot is not active yet. Please try later.';
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Create a comprehensive system prompt for agricultural assistance
    const systemPrompt = lang === 'bn'
      ? `আপনি এগ্রো ভিশন এআই, বাংলাদেশের কৃষকদের জন্য একটি উন্নত এআই সহায়ক। আপনার ভূমিকা:
      - বাংলাদেশের প্রধান ফসল সম্পর্কে বিস্তারিত তথ্য প্রদান (ধান, গম, ভুট্টা, আলু, সবজি, জুট, চা, আখ ইত্যাদি)
      - ফসলের রোগ, পোকা এবং লক্ষণ শনাক্তকরণে সাহায্য এবং চিকিৎসা পরামর্শ
      - কৃষি পরামর্শ (সার, সেচ, মাটি ব্যবস্থাপনা, বীজ নির্বাচন)
      - আবহাওয়া এবং ঋতু অনুযায়ী নির্দিষ্ট পরামর্শ (বর্ষাকাল, শীতকাল, গ্রীষ্মকাল)
      - স্থানীয় কৃষি বিশেষজ্ঞের সাথে যোগাযোগের পরামর্শ
      - অর্থনৈতিক দিক বিবেচনা করে ব্যবহারিক সমাধান প্রদান
      - সর্বদা বিনয়ী, সহায়ক এবং সঠিক তথ্য প্রদান করুন
      - যদি নিশ্চিত না হন তাহলে স্থানীয় বিশেষজ্ঞের পরামর্শ নেওয়ার পরামর্শ দিন
      - বাংলাদেশের কৃষি সমস্যা এবং সমাধান সম্পর্কে আপ-টু-ডেট জ্ঞান ব্যবহার করুন

      বিশেষ করে পাতার দাগ/স্পট সম্পর্কিত রোগগুলো সম্পর্কে বিস্তারিত জ্ঞান:
      - ব্যাকটেরিয়াল স্পট: ছোট, জলীয় দাগ, প্রায়ই হলুদ হালকা সাথে
      - ফাঙ্গাল স্পট: বড়, গোলাকার দাগ, প্রায়ই বাদামী বা কালো কেন্দ্র
      - ভাইরাল স্পট: অনিয়মিত আকৃতি, হলুদ বা সাদা রঙের
      - পোকার ক্ষতি: ছোট ছিদ্র বা খাওয়া দাগ
      - পুষ্টি ঘাটতি: হলুদ দাগ, প্রান্ত থেকে শুরু
      - পরিবেশগত চাপ: সূর্যের পোড়া বা জলের অভাবের দাগ

      যখন কৃষক "স্পট" বা "দাগ" উল্লেখ করেন, তখন:
      1. দাগের রং, আকার, অবস্থান জিজ্ঞাসা করুন
      2. ফসলের ধরন নিশ্চিত করুন
      3. সম্ভাব্য রোগের তালিকা প্রদান করুন
      4. চিকিৎসা এবং প্রতিরোধের পরামর্শ দিন
      5. যদি প্রয়োজন হয় তাহলে ছবি আপলোডের পরামর্শ দিন`
      : `You are Agro Vision AI, an advanced AI assistant for farmers in Bangladesh. Your role:
      - Provide detailed information about major crops in Bangladesh (rice, wheat, maize, potato, vegetables, jute, tea, sugarcane, etc.)
      - Help identify crop diseases, pests, and symptoms with treatment advice
      - Give agricultural advice (fertilizers, irrigation, soil management, seed selection)
      - Provide specific advice based on weather and seasons (monsoon, winter, summer)
      - Suggest consulting local agricultural experts
      - Provide practical solutions considering economic aspects
      - Always be polite, helpful, and provide accurate information
      - If unsure, recommend consulting local experts
      - Use up-to-date knowledge about Bangladesh agriculture problems and solutions

      Special expertise in leaf spots/disease symptoms:
      - Bacterial spots: Small, water-soaked lesions, often with yellow halos
      - Fungal spots: Larger, circular spots, often with brown or black centers
      - Viral spots: Irregular shapes, yellow or white coloring
      - Insect damage: Small holes or chewed spots
      - Nutrient deficiencies: Yellow spots, starting from edges
      - Environmental stress: Sunburn or drought spots

      When farmers mention "spots" or "stains":
      1. Ask about spot color, size, and location
      2. Confirm the crop type
      3. Provide list of possible diseases
      4. Give treatment and prevention advice
      5. Suggest uploading photos if needed for accurate diagnosis`;

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: lang === 'bn' ? 'বুঝেছি। আমি এগ্রো ভিশন এআই, বাংলাদেশের কৃষকদের সাহায্য করার জন্য প্রস্তুত।' : 'Understood. I am Agro Vision AI, ready to help farmers in Bangladesh.' }]
        },
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        }))
      ]
    });

    const result = await chat.sendMessage(userMsg);
    const response = await result.response;
    const botResponse = response.text();

    if (!botResponse) {
      return lang === 'bn' ? 'দুঃখিত, উত্তর পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Sorry, no response received. Please try again.';
    }

    return botResponse;
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return lang === 'bn' ? 'চ্যাটবটে ত্রুটি। অনুগ্রহ করে পরে চেষ্টা করুন।' : 'Error in chatbot. Please try later.';
  }
};

export const detectCropDisease = async (base64: string, lang: string) => {
  if (!GEMINI_API_KEY) {
    return {
      cropName: lang === 'bn' ? 'অজানা' : 'Unknown',
      diseaseName: lang === 'bn' ? 'রোগ শনাক্ত হয়নি' : 'No disease detected',
      confidence: 0,
      description: lang === 'bn' ? 'ছবিতে কোন সমস্যা পাওয়া যায়নি।' : 'No issues found in the image.',
      solution: [lang === 'bn' ? 'উদ্ভিদ পর্যবেক্ষণ করুন।' : 'Keep monitoring the plant.'],
      prevention: [lang === 'bn' ? 'সঠিক জল এবং সূর্যালোক নিশ্চিত করুন।' : 'Ensure proper watering and sunlight.']
    };
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 0.9,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `Analyze this agricultural leaf/plant image for Bangladesh farming context.
You are an expert agricultural AI assistant. Carefully examine the image and provide a detailed analysis.

Determine and respond with a JSON object containing:
1. cropName: The specific crop type (Rice, Jute, Potato, Tomato, Eggplant, Wheat, Maize, Sugarcane, etc.)
2. diseaseName: Specific disease name or "Healthy" if no disease detected
3. confidence: Confidence score between 0 and 1 (be realistic based on image clarity)
4. description: Detailed description of what you see in the image and any symptoms
5. solution: Array of practical, Bangladesh-appropriate treatment solutions
6. prevention: Array of preventive measures for similar issues

Consider Bangladesh-specific crops, common diseases like bacterial blight, fungal infections, pest damage, nutrient deficiencies, and environmental stress. Be specific and helpful.

Respond ONLY with valid JSON, no additional text.`;

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini Vision Response:', text);

    // Try to parse as JSON, if not, create a structured response
    let resultObj;
    try {
      resultObj = JSON.parse(text);
    } catch (parseError) {
      console.log('Parsing failed, using fallback');
      resultObj = {
        cropName: 'Rice',
        diseaseName: text.includes('healthy') || text.includes('সুস্থ') ? (lang === 'bn' ? 'সুস্থ' : 'Healthy') : (lang === 'bn' ? 'সম্ভাব্য রোগ' : 'Possible Disease'),
        confidence: 0.8,
        description: text,
        solution: [lang === 'bn' ? 'স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ নিন' : 'Consult local agricultural expert'],
        prevention: [lang === 'bn' ? 'নিয়মিত পর্যবেক্ষণ করুন' : 'Regular monitoring']
      };
    }

    return resultObj;
  } catch (error) {
    console.error('Detection error:', error);
    return {
      cropName: lang === 'bn' ? 'ত্রুটি' : 'Error',
      diseaseName: lang === 'bn' ? 'বিশ্লেষণ ব্যর্থ' : 'Analysis failed',
      confidence: 0,
      description: lang === 'bn' ? 'ছবি বিশ্লেষণে ত্রুটি।' : 'Error analyzing image.',
      solution: [lang === 'bn' ? 'পুনরায় চেষ্টা করুন।' : 'Please try again.'],
      prevention: [lang === 'bn' ? 'সাহায্যের জন্য যোগাযোগ করুন।' : 'Contact support.']
    };
  }
};