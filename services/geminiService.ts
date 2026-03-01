
import { GoogleGenAI, Type } from "@google/genai";
import { Garment, GeminiOutfitResponse, TravelPlan } from "../types";

// Initialize Gemini API client with API key from environment
const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("An API Key must be set when running in a browser. Please check your Netlify environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

const cleanBase64 = (base64: string) => {
  if (base64.includes(',')) {
    return base64.split(',')[1];
  }
  return base64;
};

/**
 * Hàm trích xuất JSON từ văn bản phản hồi của AI
 * Đôi khi AI trả về text kèm theo khối ```json ... ``` hoặc văn bản giải thích.
 */
const extractJson = (text: string) => {
  try {
    // Thử parse trực tiếp trước
    return JSON.parse(text);
  } catch (e) {
    // Nếu lỗi, tìm khối JSON trong Markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerE) {
        console.error("Không thể parse khối JSON tìm thấy:", innerE);
      }
    }
    return null;
  }
};

export const generateOutfitsFromImages = async (
  tops: Garment[],
  bottoms: Garment[]
): Promise<GeminiOutfitResponse | null> => {
  try {
    const ai = getAI();
    
    // Convert top garments to API-compatible parts
    const topParts = tops.map((g, index) => ([
      { text: `Áo số ${index}:` },
      {
        inlineData: {
          data: cleanBase64(g.image),
          mimeType: "image/png",
        }
      }
    ])).flat();

    // Convert bottom garments to API-compatible parts
    const bottomParts = bottoms.map((g, index) => ([
      { text: `Quần/Váy số ${index}:` },
      {
        inlineData: {
          data: cleanBase64(g.image),
          mimeType: "image/png",
        }
      }
    ])).flat();

    const prompt = `
      Bạn là một chuyên gia thời trang cao cấp người Việt Nam. 
      Nhiệm vụ: Phân tích danh sách áo và quần/váy tôi đã gửi. 
      Hãy chọn ra 3 bộ phối đồ (outfits) ĐẸP NHẤT và HỢP THỜI TRANG NHẤT.
      Trả về JSON chính xác theo cấu trúc yêu cầu.
    `;

    // Always use responseSchema when responseMimeType is application/json for guaranteed structure
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Đổi sang 2.5-flash để có hạn mức 1500/ngày
      contents: [
        {
          parts: [
            ...topParts,
            ...bottomParts,
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topIndex: { type: Type.INTEGER },
                  bottomIndex: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  personality: { type: Type.STRING },
                  locations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["topIndex", "bottomIndex", "name", "description", "personality", "locations"]
              }
            }
          },
          required: ["outfits"]
        }
      }
    });

    const parsed = extractJson(response.text || "{}");
    if (!parsed) throw new Error("Không thể parse JSON từ AI");
    
    // Validation to ensure AI indices are within range of provided garments
    const safeOutfits = (parsed.outfits || []).filter((o: any) => 
      o.topIndex >= 0 && o.topIndex < tops.length && 
      o.bottomIndex >= 0 && o.bottomIndex < bottoms.length
    );

    if (safeOutfits.length === 0) throw new Error("AI không trả về bộ phối đồ hợp lệ");

    return { outfits: safeOutfits };
  } catch (error: any) {
    console.warn("Lỗi Gemini hoặc hết hạn mức, đang kích hoạt chế độ phối đồ dự phòng:", error);
    
    // CHẾ ĐỘ DỰ PHÒNG (SMART FALLBACK)
    // Khi hết token, hệ thống vẫn tự động phối đồ dựa trên danh sách đồ hiện có
    const fallbackOutfits = [];
    const count = Math.min(3, tops.length, bottoms.length);
    
    for (let i = 0; i < count; i++) {
      const top = tops[i];
      const bottom = bottoms[i];
      
      // Tạo tên và mô tả dựa trên tên món đồ (nếu có)
      const topName = top.name || "Áo thời thượng";
      const bottomName = bottom.name || "Quần đẳng cấp";
      
      fallbackOutfits.push({
        topIndex: i,
        bottomIndex: i,
        name: `Mix & Match: ${topName}`,
        description: `Sự kết hợp tinh tế giữa ${topName} và ${bottomName}. Đây là lựa chọn hoàn hảo để tôn vinh vẻ đẹp sang trọng và phong cách cá nhân của bạn trong mọi hoàn cảnh.`,
        personality: "Thanh lịch, hiện đại và tràn đầy năng lượng thành công.",
        locations: ["Buổi tiệc tối", "Hẹn hò sang trọng", "Gặp gỡ đối tác", "Sự kiện thời trang"]
      });
    }

    return { outfits: fallbackOutfits.length > 0 ? fallbackOutfits : null } as any;
  }
};

export const generateTravelPlan = async (
  city: string,
  outfitDescription: string,
  vibe: string
): Promise<{plan: TravelPlan, sources: any[]} | null> => {
  const ai = getAI();
  const prompt = `
    Tôi đang ở thành phố "${city}" tại Việt Nam. Tôi đang mặc một bộ đồ: "${outfitDescription}" với vibe "${vibe}".
    Hãy đề xuất hành trình du lịch THỰC TẾ tại ${city} bao gồm địa điểm sang trọng, địa điểm địa phương và phương tiện di chuyển.
    
    YÊU CẦU TRẢ VỀ CHỈ DUY NHẤT KHỐI JSON theo cấu trúc:
    {
      "luxury": [{"name": "Tên", "address": "Địa chỉ", "description": "Lý do chọn", "specialtyFood": "Món nên thử", "foodAddress": "Nơi ăn"}],
      "local": [{"name": "Tên", "address": "Địa chỉ", "description": "Tại sao nổi tiếng", "specialtyFood": "Món ngon", "foodAddress": "Địa chỉ quán"}],
      "transportation": [{"service": "Tên dịch vụ", "description": "Ưu điểm", "contactInfo": "Thông tin liên hệ/app"}],
      "culturalNote": "Lưu ý văn hóa ngắn gọn"
    }
  `;

  // Thử lần 1: Có Google Search
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Sử dụng model 2.5-flash ổn định và hạn mức cao
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const parsed = extractJson(response.text || "{}");
    if (parsed) {
      return {
        plan: parsed as TravelPlan,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    }
  } catch (error: any) {
    console.warn("Thử nghiệm Google Search thất bại hoặc hết hạn mức:", error.message || error);
    console.log("Đang chuyển sang chế độ dự phòng (Fallback)...");
    
    // Nếu lỗi không phải do hết hạn mức (429), ta vẫn thử fallback một lần nữa cho chắc chắn
    if (!error.message?.includes('429') && !error.message?.includes('quota')) {
      console.error("Lỗi chi tiết:", error);
    }
  }

  // Thử lần 2 (Fallback): Không có Google Search (Dùng kiến thức nội tại của AI)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Đảm bảo fallback cũng dùng model có hạn mức cao
      contents: prompt + "\n(Lưu ý: Hãy sử dụng kiến thức của bạn về thành phố này để trả lời vì dịch vụ tìm kiếm đang tạm bảo trì).",
    });

    const parsed = extractJson(response.text || "{}");
    if (parsed) {
      return {
        plan: parsed as TravelPlan,
        sources: []
      };
    }
  } catch (fallbackError) {
    console.error("Cả chế độ dự phòng cũng thất bại:", fallbackError);
  }

  return null;
};
