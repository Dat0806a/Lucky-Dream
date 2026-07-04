
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Garment, GeminiOutfitResponse, TravelPlan, Post, OutfitAnalysis } from "../types";

// Initialize Gemini API client with API key from environment
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("An API Key must be set in the environment variables (GEMINI_API_KEY).");
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
    console.error("Invalid JSON response:", text);
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

const getCleanGarmentName = (g: Garment, index: number, type: 'TOP' | 'BOTTOM' | 'FULL_BODY'): string => {
  if (!g) return '';
  let name = g.name || '';
  
  // Strip extension
  name = name.replace(/\.(jpg|jpeg|png|gif|webp|heic|raw)$/i, '');
  
  name = name.trim();

  const isRaw = 
    !/\s/.test(name) && (
      /^[a-z0-9_\-\.]{8,}$/i.test(name) || // purely ascii alphanumeric with no spaces, >= 8 chars
      /^ao\d+$/i.test(name) ||             // e.g. "ao1", "ao2"
      /^quan\d+$/i.test(name) ||           // e.g. "quan1"
      /^vay\d+$/i.test(name) ||            // e.g. "vay1"
      /^dam\d+$/i.test(name) ||            // e.g. "dam1"
      /^body\d+$/i.test(name)              // e.g. "body1"
    ) ||
    /^img_?\d+/i.test(name) ||
    /^\d+$/i.test(name) ||
    /screenshot/i.test(name) ||
    /captured/i.test(name) ||
    /image/i.test(name) ||
    !/[a-zA-Z]/i.test(name); // no letters at all

  if (isRaw || !name) {
    if (type === 'TOP') {
      return `Áo thượng lưu số ${index + 1}`;
    } else if (type === 'BOTTOM') {
      return `Quần/Váy sành điệu số ${index + 1}`;
    } else {
      return `Đầm liền cao cấp số ${index + 1}`;
    }
  }
  
  // Capitalize beautifully and clean extra spaces
  let cleaned = name.replace(/\s+/g, ' ');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const sanitizeText = (text: string): string => {
  if (!text) return '';
  // Remove common image extensions
  let clean = text.replace(/\.(jpg|jpeg|png|gif|webp|heic|raw)/gi, '');
  // Replace long alphanumeric strings (filenames without extensions) with clean terms
  clean = clean.replace(/\b[a-z0-9_-]{12,}\b/gi, 'trang phục');
  return clean.trim();
};

const ensureAllGarmentsCovered = (
  outfits: any[],
  tops: Garment[],
  bottoms: Garment[],
  fullBodies: Garment[] = []
): any[] => {
  const resultOutfits = [...outfits];

  const usedTopIndices = new Set<number>();
  const usedBottomIndices = new Set<number>();
  const usedFullBodyIndices = new Set<number>();

  resultOutfits.forEach(o => {
    if (o.topIndex !== null && o.topIndex !== undefined && o.topIndex >= 0 && o.topIndex < tops.length) {
      usedTopIndices.add(Number(o.topIndex));
    }
    if (o.bottomIndex !== null && o.bottomIndex !== undefined && o.bottomIndex >= 0 && o.bottomIndex < bottoms.length) {
      usedBottomIndices.add(Number(o.bottomIndex));
    }
    if (o.fullBodyIndex !== null && o.fullBodyIndex !== undefined && o.fullBodyIndex >= 0 && o.fullBodyIndex < fullBodies.length) {
      usedFullBodyIndices.add(Number(o.fullBodyIndex));
    }
  });

  const unusedTopIndices: number[] = [];
  for (let i = 0; i < tops.length; i++) {
    if (!usedTopIndices.has(i)) unusedTopIndices.push(i);
  }

  const unusedBottomIndices: number[] = [];
  for (let j = 0; j < bottoms.length; j++) {
    if (!usedBottomIndices.has(j)) unusedBottomIndices.push(j);
  }

  const unusedFullBodyIndices: number[] = [];
  for (let k = 0; k < fullBodies.length; k++) {
    if (!usedFullBodyIndices.has(k)) unusedFullBodyIndices.push(k);
  }

  // If there are unused tops or bottoms, let's pair them up.
  const numUnusedTops = unusedTopIndices.length;
  const numUnusedBottoms = unusedBottomIndices.length;
  const maxUnused = Math.max(numUnusedTops, numUnusedBottoms);

  for (let i = 0; i < maxUnused; i++) {
    const topIdx = i < numUnusedTops ? unusedTopIndices[i] : (tops.length > 0 ? 0 : null);
    const bottomIdx = i < numUnusedBottoms ? unusedBottomIndices[i] : (bottoms.length > 0 ? 0 : null);

    if (topIdx !== null || bottomIdx !== null) {
      const topName = topIdx !== null ? (tops[topIdx]?.name || `Áo số ${topIdx + 1}`) : '';
      const bottomName = bottomIdx !== null ? (bottoms[bottomIdx]?.name || `Quần/Váy số ${bottomIdx + 1}`) : '';
      
      let outfitName = '';
      let description = '';
      let personality = 'Modern Stylist';
      let mood = 'Tự tin';
      
      if (topIdx !== null && bottomIdx !== null) {
        outfitName = `Phối đồ Thượng lưu: ${topName} & ${bottomName}`;
        description = `Bản phối hoàn hảo giữa ${topName} và ${bottomName} được tạo riêng để đảm bảo phong cách thời thượng và tối ưu hóa tủ đồ của bạn.`;
      } else if (topIdx !== null) {
        outfitName = `Phối đồ Sáng tạo: ${topName}`;
        description = `Bộ phối làm nổi bật chiếc áo ${topName} cá tính của bạn, kết hợp hài hòa đem lại diện mạo ấn tượng.`;
      } else {
        outfitName = `Phối đồ Sành điệu: ${bottomName}`;
        description = `Chiếc quần/váy ${bottomName} được phối khéo léo để tôn lên vóc dáng và phong cách sành điệu của bạn.`;
      }

      resultOutfits.push({
        topIndex: topIdx,
        bottomIndex: bottomIdx,
        fullBodyIndex: null,
        name: outfitName,
        description: description,
        personality: personality,
        mood: mood,
        locations: ["Hẹn hò", "Dạo phố", "Gặp gỡ bạn bè"]
      });
    }
  }

  // For unused full body items, create standalone outfits.
  for (const fullBodyIdx of unusedFullBodyIndices) {
    const fullBodyName = fullBodies[fullBodyIdx]?.name || `Đầm/Đồ liền số ${fullBodyIdx + 1}`;
    resultOutfits.push({
      topIndex: null,
      bottomIndex: null,
      fullBodyIndex: fullBodyIdx,
      name: `Phối đồ Đẳng cấp: ${fullBodyName}`,
      description: `Sự lựa chọn đầm/set đồ liền thân ${fullBodyName} sang trọng mang phong cách thượng lưu, sẵn sàng cho những buổi tiệc hoặc dịp đặc biệt.`,
      personality: "Luxury Dress",
      mood: "Sang trọng",
      locations: ["Sự kiện", "Dạ tiệc", "Hẹn hò sang trọng"]
    });
  }

  return resultOutfits;
};

const analyzeSingleCandidate = async (
  rawTops: Garment[],
  rawBottoms: Garment[],
  bodyImage?: string,
  height?: string,
  weight?: string,
  rawFullBodies?: Garment[],
  skipPadding: boolean = false
): Promise<GeminiOutfitResponse | null> => {
  const tops = rawTops.map((g, idx) => ({ ...g, name: getCleanGarmentName(g, idx, 'TOP') }));
  const bottoms = rawBottoms.map((g, idx) => ({ ...g, name: getCleanGarmentName(g, idx, 'BOTTOM') }));
  const fullBodies = (rawFullBodies || []).map((g, idx) => ({ ...g, name: getCleanGarmentName(g, idx, 'FULL_BODY') }));

  try {
    console.log("analyzeSingleCandidate inputs:", { 
      topsLength: tops?.length, 
      bottomsLength: bottoms?.length, 
      fullBodiesLength: fullBodies?.length 
    });
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

    // Convert full body garments to API-compatible parts
    const fullBodyParts = (fullBodies || []).map((g, index) => ([
      { text: `Đồ liền/Đầm/Full body số ${index}:` },
      {
        inlineData: {
          data: cleanBase64(g.image),
          mimeType: "image/png",
        }
      }
    ])).flat();

    const parts: any[] = [...topParts, ...bottomParts, ...fullBodyParts];

    if (bodyImage) {
      parts.push({ text: "Ảnh cơ thể người dùng:" });
      parts.push({
        inlineData: {
          data: cleanBase64(bodyImage),
          mimeType: "image/png"
        }
      });
    }

    const bodyMetrics = `
      Thông tin người dùng:
      - Chiều cao: ${height || "Không cung cấp"}
      - Cân nặng: ${weight || "Không cung cấp"}
    `;

    const prompt = `
      Bạn là một chuyên gia thời trang cao cấp và tư vấn vóc dáng chuyên nghiệp người Việt Nam.
      
      NHIỆM VỤ:
      1. Phân tích các ảnh áo (tops), quần/váy (bottoms), và đồ liền thân/đầm/jumpsuit/set nguyên bộ (full_body) đã gửi. 
      2. TẠO DANH SÁCH PHỐI ĐỒ (OUTFITS):
         - Với áo (tops) và quần/váy (bottoms): phối chúng lại thành các bộ đồ gồm cả áo và quần/váy.
         - Với đồ liền thân/đầm/jumpsuit/set nguyên bộ (full_body): tạo các bộ đồ tương ứng chỉ gồm món full_body đó, không bắt buộc phải đi cùng áo/quần từ danh sách áo/quần.
         - Đảm bảo MỖI chiếc áo, MỖI chiếc quần, và MỖI chiếc đầm/đồ liền thân đã gửi PHẢI được xuất hiện TRONG ÍT NHẤT 1 bộ đồ đề xuất.
         - KHÔNG giới hạn số lượng bộ đồ là 3. Hãy tạo đủ số lượng bộ đồ để toàn bộ item input đều được sử dụng ít nhất một lần. 
         - Nếu có N áo, M quần và F đồ liền thân, hãy tạo đủ số lượng bộ phối đồ tương ứng.
         - Nếu bộ đồ sử dụng áo (tops) và quần (bottoms), hãy điền "topIndex" and "bottomIndex" tương ứng with index of chúng (bắt đầu từ 0). Để "fullBodyIndex" là null hoặc không điền.
         - Nếu bộ đồ sử dụng đồ liền thân/đầm/set nguyên bộ (full_body), hãy điền "fullBodyIndex" tương ứng với index của nó (bắt đầu từ 0). Để "topIndex" và "bottomIndex" là null hoặc không điền.
         - Các bộ đồ phải hài hòa về màu sắc, phong cách và tính ứng dụng cao.
      3. NẾU CÓ ẢNH CƠ THỂ:
         - Phân tích dáng người (silhouette): Tam giác, Tam giác ngược, Đồng hồ cát, Chữ nhật, Oval. Đưa ra confidence score.
         - Tỉ lệ cơ thể: Vai/eo/hông, Chân/thân, Upper/lower balance.
         - Ước lượng metrics: BMI, Weight range, Bust/Waist/Hip range (có thể điều chỉnh dựa trên ảnh).
         - Smart Try-on: Cung cấp tọa độ và phép biến đổi để "mặc" quần áo lên ảnh cơ thể người dùng.
           + garment_offsets.top: {x, y, scale, rotation, skewX, zIndex}. 
             * rotation: góc xoay (độ) để khớp với vai/dáng đứng.
             * skewX: độ nghiêng để tạo cảm giác 3D theo hướng xoay của cơ thể.
             * zIndex: 1 = mặc trong, 2 = mặc ngoài (ví dụ áo khoác đè lên áo thun).
           + garment_offsets.bottom: {x, y, scale, rotation, skewX, zIndex}.
           + garment_offsets.full_body: {x, y, scale, rotation, skewX, zIndex}.
           + Scale: Điều chỉnh để áo vừa vai (fit to shoulders), quần vừa hông, đầm vừa toàn thân.
         - Mô tả về Avatar: Một Mannequin 2D thực tế phản ánh đúng tỷ lệ người dùng.
      
      YÊU CẦU:
      - Trả về JSON chính xác.
      - NẾU CÓ ẢNH CƠ THỂ: PHẢI tính toán x, y cho từng áo/quần/đồ liền thân để chúng khớp chính xác với người trong ảnh.
      - NẾU KHÔNG CÓ ẢNH CƠ THỂ: set body_analysis.enabled = false, avatar.generated = false, smart_try_on.enabled = false.
      - Tone: fashion stylist AI trung lập + tích cực. KHÔNG body shaming.
    `;

    // Standard @google/genai SDK usage
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", 
      contents: { 
        parts: [
          ...parts,
          { text: bodyMetrics },
          { text: prompt }
        ] 
      },
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
                  fullBodyIndex: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  personality: { type: Type.STRING },
                  mood: { type: Type.STRING, description: "Tính cách tỏa ra khi mặc bộ đồ này (Vd: Tự tin, Phóng khoáng, Lôi cuốn...)" },
                  locations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["name", "description", "personality", "mood", "locations"]
              }
            },
            body_analysis: {
              type: Type.OBJECT,
              properties: {
                enabled: { type: Type.BOOLEAN },
                silhouette: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                ratios: {
                  type: Type.OBJECT,
                  properties: {
                    shoulder_waist_hip: { type: Type.STRING },
                    leg_body_ratio: { type: Type.STRING }
                  }
                },
                estimated_metrics: {
                  type: Type.OBJECT,
                  properties: {
                    bmi: { type: Type.STRING },
                    weight_range: { type: Type.STRING },
                    bust_waist_hip: { type: Type.STRING }
                  }
                }
              }
            },
            avatar: {
              type: Type.OBJECT,
              properties: {
                generated: { type: Type.BOOLEAN },
                type: { type: Type.STRING },
                views: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            },
            smart_try_on: {
              type: Type.OBJECT,
              properties: {
                enabled: { type: Type.BOOLEAN },
                image_description: { type: Type.STRING, description: "Mô tả chi tiết hình ảnh sau khi ghép đồ vào người dùng" },
                fit_score: { type: Type.NUMBER },
                garment_offsets: {
                  type: Type.OBJECT,
                  properties: {
                    top: { 
                      type: Type.OBJECT, 
                      properties: { 
                        x: { type: Type.NUMBER, description: "X coordinate percentage (0-100)" },
                        y: { type: Type.NUMBER, description: "Y coordinate percentage (0-100)" },
                        scale: { type: Type.NUMBER, description: "Scale multiplier (e.g. 1.0)" },
                        rotation: { type: Type.NUMBER, description: "Rotation in degrees" },
                        skewX: { type: Type.NUMBER, description: "Skew X factor" },
                        zIndex: { type: Type.NUMBER, description: "Layering index (higher is front)" }
                      }
                    },
                    bottom: { 
                      type: Type.OBJECT, 
                      properties: { 
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        scale: { type: Type.NUMBER },
                        rotation: { type: Type.NUMBER },
                        skewX: { type: Type.NUMBER },
                        zIndex: { type: Type.NUMBER }
                      }
                    },
                    full_body: { 
                      type: Type.OBJECT, 
                      properties: { 
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        scale: { type: Type.NUMBER },
                        rotation: { type: Type.NUMBER },
                        skewX: { type: Type.NUMBER },
                        zIndex: { type: Type.NUMBER }
                      }
                    }
                  }
                },
                analysis: {
                  type: Type.OBJECT,
                  properties: {
                    style_match: { type: Type.STRING },
                    body_compatibility: { type: Type.STRING },
                    recommendation: { type: Type.STRING }
                  }
                }
              }
            },
            fallback_mode: { type: Type.BOOLEAN }
          },
          required: ["outfits", "fallback_mode"]
        }
      }
    });

    const parsed = extractJson(response.text || "{}");
    if (!parsed) throw new Error("Không thể parse JSON từ AI");
    
    // Support snake_case mapping and default indices if they are missing/null
    const rawOutfits = (parsed.outfits || []).map((o: any) => {
      let topIdx = o.topIndex !== undefined ? o.topIndex : o.top_index;
      let bottomIdx = o.bottomIndex !== undefined ? o.bottomIndex : o.bottom_index;
      let fullBodyIdx = o.fullBodyIndex !== undefined ? o.fullBodyIndex : o.full_body_index;

      if (topIdx === undefined) topIdx = null;
      if (bottomIdx === undefined) bottomIdx = null;
      if (fullBodyIdx === undefined) fullBodyIdx = null;

      // Smart index normalization and boundary safety
      const hasFullBodyItems = fullBodies && fullBodies.length > 0;
      const wantsFullBody = fullBodyIdx !== null && fullBodyIdx !== undefined;

      if (hasFullBodyItems && wantsFullBody) {
        const parsedFullBodyIdx = Number(fullBodyIdx);
        if (!isNaN(parsedFullBodyIdx) && parsedFullBodyIdx >= 0 && parsedFullBodyIdx < fullBodies.length) {
          fullBodyIdx = parsedFullBodyIdx;
          topIdx = null;
          bottomIdx = null;
        } else {
          fullBodyIdx = null;
        }
      } else {
        fullBodyIdx = null;
      }

      if (fullBodyIdx === null) {
        // Handle tops
        if (tops.length > 0) {
          if (topIdx === null || topIdx === undefined) {
            topIdx = 0;
          } else {
            const parsedTopIdx = Number(topIdx);
            topIdx = (!isNaN(parsedTopIdx) && parsedTopIdx >= 0 && parsedTopIdx < tops.length) ? parsedTopIdx : 0;
          }
        } else {
          topIdx = null;
        }

        // Handle bottoms
        if (bottoms.length > 0) {
          if (bottomIdx === null || bottomIdx === undefined) {
            bottomIdx = 0;
          } else {
            const parsedBottomIdx = Number(bottomIdx);
            bottomIdx = (!isNaN(parsedBottomIdx) && parsedBottomIdx >= 0 && parsedBottomIdx < bottoms.length) ? parsedBottomIdx : 0;
          }
        } else {
          bottomIdx = null;
        }
      }

      return {
        ...o,
        topIndex: topIdx,
        bottomIndex: bottomIdx,
        fullBodyIndex: fullBodyIdx
      };
    });

    const safeOutfits = rawOutfits.filter((o: any) => {
      const hasTop = o.topIndex !== undefined && o.topIndex !== null && o.topIndex >= 0 && o.topIndex < tops.length;
      const hasBottom = o.bottomIndex !== undefined && o.bottomIndex !== null && o.bottomIndex >= 0 && o.bottomIndex < bottoms.length;
      const hasFullBody = o.fullBodyIndex !== undefined && o.fullBodyIndex !== null && o.fullBodyIndex >= 0 && o.fullBodyIndex < (fullBodies?.length || 0);
      return hasTop || hasBottom || hasFullBody;
    });

    if (safeOutfits.length === 0) throw new Error("AI không trả về bộ phối đồ hợp lệ");

    // ĐẢM BẢO TẤT CẢ CÁC MÓN ĐỒ INPUT ĐỀU ĐƯỢC PHỐI ÍT NHẤT 1 LẦN
    const coveredOutfits = ensureAllGarmentsCovered(safeOutfits, tops, bottoms, fullBodies || []);

    // ĐẢM BẢO LUÔN CÓ ÍT NHẤT 3 OUTFIT VỚI CÁC GÓC NHÌN PHONG CÁCH KHÁC NHAU (DIVERSE STYLE ANALYSIS)
    const diverseStyles = [
      { name: "Sành điệu & Hiện đại", personality: "Smart Casual", mood: "Tự tin & Phóng khoáng", description: "Sự kết hợp đầy tinh tế giữa vẻ ngoài chỉn chu và tinh thần thoải mái, sẵn sàng cho mọi cuộc gặp gỡ. " },
      { name: "Cá tính Đường phố", personality: "Streetwear", mood: "Năng động & Phá cách", description: "Bản phối mang đậm hơi thở thành thị, tôn vinh cái tôi độc bản và sự tự do trong chuyển động. " },
      { name: "Tối giản Tinh tế", personality: "Minimalism", mood: "Điềm tĩnh & Sang trọng", description: "Vẻ đẹp trường tồn đến từ sự đơn giản, nơi phom dáng và chất vải lên tiếng thay cho mọi sự cầu kỳ. " },
      { name: "Nghệ thuật Phối lớp", personality: "Layering", mood: "Sáng tạo & Chiều sâu", description: "Cách chơi đùa cùng các lớp trang phục để tạo nên một diện mạo đầy chiều sâu và cấu trúc ấn tượng. " },
      { name: "Năng động Sang trọng", personality: "Sporty Chic", mood: "Trẻ trung & Khỏe khoắn", description: "Diện mạo trẻ trung, đầy sức sống nhưng vẫn giữ được nét thanh lịch cần thiết cho những buổi dạo phố sành điệu. " }
    ];

    let finalOutfits = [...coveredOutfits];
    
    // Bước 1: Áp dụng phân tích phong cách độc nhất cho từng outfit hiện có
    finalOutfits = finalOutfits.map((o, idx) => {
      const style = diverseStyles[idx % diverseStyles.length];
      const isCustomExtra = o.name.startsWith("Phối đồ Thượng lưu:") || o.name.startsWith("Phối đồ Sáng tạo:") || o.name.startsWith("Phối đồ Sành điệu:") || o.name.startsWith("Phối đồ Đẳng cấp:");
      return {
        ...o,
        name: isCustomExtra ? o.name : `${o.name} (${style.name} Edition)`,
        personality: o.personality || style.personality,
        mood: o.mood || style.mood,
        description: isCustomExtra ? o.description : `[Góc nhìn chuyên gia: ${style.name}] - ${o.description} ${style.description} Lựa chọn này giúp làm mới hoàn toàn diện mạo dựa trên những món đồ bạn yêu thích.`
      };
    });

    // Bước 2: Bổ sung nếu thiếu để luôn đạt tối thiểu 3 thẻ
    if (!skipPadding && finalOutfits.length < 3) {
      let styleIdx = finalOutfits.length;
      while (finalOutfits.length < 3) {
        // Reuse items từ bộ phối đầu tiên nhưng với style mới hoàn toàn
        const baseOutfit = coveredOutfits[0]; 
        const style = diverseStyles[styleIdx % diverseStyles.length];
        
        finalOutfits.push({
          ...baseOutfit,
          name: `${baseOutfit.name} - ${style.name}`,
          personality: style.personality,
          mood: style.mood,
          description: `Gợi ý phối lại theo hướng ${style.name}: ${style.description} Dù vẫn là những item quen thuộc, nhưng cách tiếp cận mới sẽ giúp bạn tỏa sáng theo một cách rất riêng.`
        });
        styleIdx++;
      }
    }

    const sanitizedFinalOutfits = finalOutfits.map(o => ({
      ...o,
      name: sanitizeText(o.name),
      description: sanitizeText(o.description)
    }));

    return { 
      ...parsed,
      outfits: sanitizedFinalOutfits,
      fallback_mode: false 
    };
  } catch (error: any) {
    console.error("DEBUG: Detailed Gemini Error in sub-analysis:", {
      message: error.message,
      stack: error.stack,
      response: error.response ? error.response.data : 'No response data'
    });
    console.warn("Lỗi Gemini hoặc hết hạn mức, đang kích hoạt chế độ phối đồ dự phòng:", error);
    
    // CHẾ ĐỘ DỰ PHÒNG (SMART FALLBACK)
    const fallbackOutfits = [];
    const n = tops.length;
    const m = bottoms.length;
    const f = fullBodies ? fullBodies.length : 0;
    const totalItems = n + m + f;
    const count = skipPadding ? Math.max(totalItems, 1) : Math.max(totalItems, 3); // Đảm bảo tối thiểu 3 cho cả fallback
    
    const fallbackStyles = [
      { name: "Thanh lịch Hiện đại", personality: "Smart Casual", mood: "Tự tin", desc: "Sự giao thoa hoàn hảo giữa phong cách công sở và sự thoải mái ngày thường." },
      { name: "Cá tính Thành thị", personality: "Streetwear", mood: "Năng động", desc: "Vẻ ngoài phóng khoáng, đậm chất tôi dành cho những tín đồ của phong cách đường phố." },
      { name: "Tối giản Sang trọng", personality: "Minimalism", mood: "Tinh tế", desc: "Tôn vinh vẻ đẹp thuần khiết thông qua sự giản lược nhưng đầy đẳng cấp trong chi tiết." },
      { name: "Phối lớp Đa năng", personality: "Layering", mood: "Sáng tạo", desc: "Tận dụng tối đa các lớp trang phục để tạo nên cấu trúc và chiều sâu cho tổng thể diện mạo." }
    ];
    
    for (let i = 0; i < count; i++) {
      const style = fallbackStyles[i % fallbackStyles.length];
      if (f > 0 && (i % 2 === 0 || n === 0 || m === 0)) {
        // use full body item
        const fullBodyIdx = i % f;
        const fullBody = fullBodies[fullBodyIdx];
        const fullBodyName = fullBody.name || `Đầm/Đồ liền số ${fullBodyIdx + 1}`;
        fallbackOutfits.push({
          fullBodyIndex: fullBodyIdx,
          name: `${style.name}: ${fullBodyName}`,
          description: `[Gợi ý từ Stylist: ${style.name}] - ${style.desc} Thiết kế đầm/đồ liền ${fullBodyName} tinh tế giúp bạn tự tin tỏa sáng mọi lúc mọi nơi.`,
          personality: style.personality,
          mood: style.mood,
          locations: ["Sự kiện", "Dạo phố", "Gặp gỡ bạn bè", "Hẹn hò"]
        });
      } else if (n > 0 && m > 0) {
        // use top and bottom
        const topIdx = i % n;
        const bottomIdx = i % m;
        const top = tops[topIdx];
        const bottom = bottoms[bottomIdx];
        
        const topName = top.name || `Áo số ${topIdx + 1}`;
        const bottomName = bottom.name || `Quần/Váy số ${bottomIdx + 1}`;
        
        fallbackOutfits.push({
          topIndex: topIdx,
          bottomIndex: bottomIdx,
          name: `${style.name}: ${topName}`,
          description: `[Gợi ý từ Stylist: ${style.name}] - ${style.desc} Bản phối giữa ${topName} và ${bottomName} sẽ mang đến cho bạn một diện mạo thật ấn tượng và đầy cuốn hút.`,
          personality: style.personality,
          mood: style.mood,
          locations: ["Công sở", "Dạo phố", "Gặp gỡ bạn bè", "Sự kiện nhẹ nhàng"]
        });
      }
    }

    const coveredFallbackOutfits = ensureAllGarmentsCovered(fallbackOutfits, tops, bottoms, fullBodies || []);
    const sanitizedFallbackOutfits = coveredFallbackOutfits.map(o => ({
      ...o,
      name: sanitizeText(o.name),
      description: sanitizeText(o.description)
    }));

    return { outfits: sanitizedFallbackOutfits, fallback_mode: true } as any;
  }
};

export const generateOutfitsFromImages = async (
  rawTops: Garment[],
  rawBottoms: Garment[],
  bodyImage?: string,
  height?: string,
  weight?: string,
  rawFullBodies?: Garment[]
): Promise<GeminiOutfitResponse | null> => {
  const tops = rawTops.map((g, idx) => ({ ...g, name: getCleanGarmentName(g, idx, 'TOP') }));
  const bottoms = rawBottoms.map((g, idx) => ({ ...g, name: getCleanGarmentName(g, idx, 'BOTTOM') }));
  const fullBodies = (rawFullBodies || []).map((g, idx) => ({ ...g, name: getCleanGarmentName(g, idx, 'FULL_BODY') }));

  console.log("generateOutfitsFromImages Outer Pipeline inputs:", { 
    topsLength: tops?.length, 
    bottomsLength: bottoms?.length, 
    fullBodiesLength: fullBodies?.length 
  });

  const outfitCandidates: Array<{
    tops: Garment[];
    bottoms: Garment[];
    fullBodies: Garment[];
    originalTopIdx?: number;
    originalBottomIdx?: number;
    originalFullBodyIdx?: number;
  }> = [];

  // 1. Generate top + bottom pairs if both exist
  if (tops.length > 0 && bottoms.length > 0) {
    for (let t = 0; t < tops.length; t++) {
      for (let b = 0; b < bottoms.length; b++) {
        outfitCandidates.push({
          tops: [rawTops[t]],
          bottoms: [rawBottoms[b]],
          fullBodies: [],
          originalTopIdx: t,
          originalBottomIdx: b
        });
      }
    }
  }

  // 2. Generate full body candidates
  for (let f = 0; f < fullBodies.length; f++) {
    outfitCandidates.push({
      tops: [],
      bottoms: [],
      fullBodies: [rawFullBodies ? rawFullBodies[f] : fullBodies[f]],
      originalFullBodyIdx: f
    });
  }

  // Ensure robust behavior: if no candidates (e.g., only 1 top, no bottom, no full body),
  // check if we can make any single-item candidates to avoid empty results.
  if (outfitCandidates.length === 0) {
    if (tops.length > 0) {
      for (let t = 0; t < tops.length; t++) {
        outfitCandidates.push({
          tops: [rawTops[t]],
          bottoms: [],
          fullBodies: [],
          originalTopIdx: t
        });
      }
    } else if (bottoms.length > 0) {
      for (let b = 0; b < bottoms.length; b++) {
        outfitCandidates.push({
          tops: [],
          bottoms: [rawBottoms[b]],
          fullBodies: [],
          originalBottomIdx: b
        });
      }
    }
  }

  if (outfitCandidates.length === 0) {
    return null;
  }

  // Process all candidates in parallel using the existing pipeline helper
  const results = await Promise.all(
    outfitCandidates.map(async (candidate) => {
      try {
        const subResult = await analyzeSingleCandidate(
          candidate.tops,
          candidate.bottoms,
          bodyImage,
          height,
          weight,
          candidate.fullBodies,
          true // skipPadding inside each sub-analysis to get authentic individual styles
        );
        return {
          candidate,
          subResult
        };
      } catch (err) {
        console.error("Error analyzing candidate:", err);
        return {
          candidate,
          subResult: null
        };
      }
    })
  );

  const successfulResults = results.filter(r => r.subResult !== null);
  if (successfulResults.length === 0) {
    return null;
  }

  const combinedOutfits: any[] = [];
  let mergedBodyAnalysis: any = null;
  let mergedAvatar: any = null;
  let mergedSmartTryOn: any = null;
  let isAnyFallback = false;

  for (const { candidate, subResult } of successfulResults) {
    if (!subResult) continue;

    if (subResult.fallback_mode) {
      isAnyFallback = true;
    }

    // Capture body analysis, avatar, and default smart try on from the first result that provides it
    if (!mergedBodyAnalysis && subResult.body_analysis) {
      mergedBodyAnalysis = subResult.body_analysis;
    }
    if (!mergedAvatar && subResult.avatar) {
      mergedAvatar = subResult.avatar;
    }
    if (!mergedSmartTryOn && subResult.smart_try_on) {
      mergedSmartTryOn = subResult.smart_try_on;
    }

    if (subResult.outfits && Array.isArray(subResult.outfits)) {
      for (const outfit of subResult.outfits) {
        let finalTopIndex: number | null = null;
        let finalBottomIndex: number | null = null;
        let finalFullBodyIndex: number | null = null;

        if (outfit.topIndex !== null && outfit.topIndex !== undefined && candidate.originalTopIdx !== undefined) {
          finalTopIndex = candidate.originalTopIdx;
        }
        if (outfit.bottomIndex !== null && outfit.bottomIndex !== undefined && candidate.originalBottomIdx !== undefined) {
          finalBottomIndex = candidate.originalBottomIdx;
        }
        if (outfit.fullBodyIndex !== null && outfit.fullBodyIndex !== undefined && candidate.originalFullBodyIdx !== undefined) {
          finalFullBodyIndex = candidate.originalFullBodyIdx;
        }

        // Attach specific subResult smart_try_on metadata to the outfit itself
        const outfitWithMeta = {
          ...outfit,
          topIndex: finalTopIndex,
          bottomIndex: finalBottomIndex,
          fullBodyIndex: finalFullBodyIndex,
          smart_try_on: subResult.smart_try_on
        };

        combinedOutfits.push(outfitWithMeta);
      }
    }
  }

  // Apply padding to combined outfits if they are fewer than 3 to guarantee nice UI presentation
  if (combinedOutfits.length < 3 && combinedOutfits.length > 0) {
    const diverseStyles = [
      { name: "Sành điệu & Hiện đại", personality: "Smart Casual", mood: "Tự tin & Phóng khoáng", description: "Sự kết hợp đầy tinh tế giữa vẻ ngoài chỉn chu và tinh thần thoải mái, sẵn sàng cho mọi cuộc gặp gỡ. " },
      { name: "Cá tính Đường phố", personality: "Streetwear", mood: "Năng động & Phá cách", description: "Bản phối mang đậm hơi thở thành thị, tôn vinh cái tôi độc bản và sự tự do trong chuyển động. " },
      { name: "Tối giản Tinh tế", personality: "Minimalism", mood: "Điềm tĩnh & Sang trọng", description: "Vẻ đẹp trường tồn đến từ sự đơn giản, nơi phom dáng và chất vải lên tiếng thay cho mọi sự cầu kỳ. " },
      { name: "Nghệ thuật Phối lớp", personality: "Layering", mood: "Sáng tạo & Chiều sâu", description: "Cách chơi đùa cùng các lớp trang phục để tạo nên một diện mạo đầy chiều sâu và cấu trúc ấn tượng. " },
      { name: "Năng động Sang trọng", personality: "Sporty Chic", mood: "Trẻ trung & Khỏe khoắn", description: "Diện mạo trẻ trung, đầy sức sống nhưng vẫn giữ được nét thanh lịch cần thiết cho những buổi dạo phố sành điệu. " }
    ];

    let styleIdx = combinedOutfits.length;
    while (combinedOutfits.length < 3) {
      const baseOutfit = combinedOutfits[0];
      const style = diverseStyles[styleIdx % diverseStyles.length];
      
      combinedOutfits.push({
        ...baseOutfit,
        name: `${baseOutfit.name} - ${style.name}`,
        personality: style.personality,
        mood: style.mood,
        description: `Gợi ý phối lại theo hướng ${style.name}: ${style.description} Dù vẫn là những item quen thuộc, nhưng cách tiếp cận mới sẽ giúp bạn tỏa sáng theo một cách rất riêng.`,
        // copy child smart_try_on if any
        smart_try_on: baseOutfit.smart_try_on
      });
      styleIdx++;
    }
  }

  const response: GeminiOutfitResponse = {
    outfits: combinedOutfits,
    body_analysis: mergedBodyAnalysis || { enabled: false },
    avatar: mergedAvatar || { generated: false },
    smart_try_on: mergedSmartTryOn || { enabled: false },
    fallback_mode: isAnyFallback
  };

  return response;
};

export const analyzeOutfitFromCamera = async (
  imageData: string
): Promise<OutfitAnalysis | null> => {
  try {
    const ai = getAI();
    const prompt = `
      Bạn là một chuyên gia thời trang cao cấp người Việt Nam. 
      Hãy phân tích hình ảnh bộ quần áo (outfit/garments) mà người dùng gửi từ camera trực tiếp.
      Hãy chấm điểm thời trang (score) một cách khách quan nhưng truyền cảm hứng, xác định đúng phong cách (style),
      các sản phẩm nhận diện được (clothing items), hashtag thời trang phù hợp (tags), 
      và đưa ra tối thiểu 2-3 lời khuyên cải thiện hữu ích (advice).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64(imageData),
              mimeType: "image/jpeg",
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Fashion score out of 100" },
            style: { type: Type.STRING, description: "Name of the detected style" },
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of detected clothing items"
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Stylist social tags/hashtags"
            },
            advice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific styling tips for improvements"
            }
          },
          required: ["score", "style", "items", "tags", "advice"]
        }
      }
    });

    const parsed = extractJson(response.text || "{}");
    if (!parsed) {
      throw new Error("Could not parse response JSON schema");
    }
    return { ...parsed, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("Error analyzing outfit:", error);
    return null;
  }
};

/**
 * AI Fashion Assistant Chat
 */
export const chatWithAI = async (
  messages: { role: 'user' | 'assistant', content: string }[],
  context: { 
    outfit?: any, 
    post?: Post, 
    source?: 'public_social_post' | 'ai_recommendation' | 'camera_outfit_analysis',
    owner?: { username?: string, displayName?: string }
  }
): Promise<string | null> => {
  try {
    const ai = getAI();
    
    const contextType = context.source === 'public_social_post' ? "COMMUNITY_POST" : "AI_RECOMMENDATION";
    const ownerName = context.owner?.displayName || context.owner?.username || "một tín đồ thời trang";
    
    let contextDescription = "";
    let systemInstruction = "";

    if (context.source === 'camera_outfit_analysis') {
      contextDescription = `
        LOẠI NGUỒN: Phòng Tư vấn Outfit AI từ Camera (AI Outfit Consulting Room).
        ĐIỂM SỐ PHONG CÁCH (FASHION SCORE): ${context.outfit?.score} điểm.
        PHONG CÁCH (STYLE): ${context.outfit?.style}
        CÁC SẢN PHẨM NHẬN DIỆN ĐƯỢC (DETECTED ITEMS): ${context.outfit?.items?.join(', ')}
        TAG PHONG CÁCH (STYLE TAGS): ${context.outfit?.tags?.join(', ')}
        LỜI KHUYÊN CẢI THIỆN OUTFIT (ADVICE): ${context.outfit?.advice?.join('. ')}
      `;
      systemInstruction = `
        Bạn là một nam Stylist / chuyên gia tư vấn thời trang (Fashion Consultant) trẻ tuổi, khoảng 25-30 tuổi ở Việt Nam. Bạn có gu ăn mặc cực kỳ sành điệu, trẻ trung, thân thiện và am hiểu sâu sắc về thời trang cá nhân phong cách Việt.
        Bạn đang trò chuyện trực diện bằng giọng nói trực tiếp để tư vấn về bộ outfit họ đang mặc trên người.

        THÔNG TIN OUTFIT CỦA KHÁCH HÀNG:
        - Điểm số outfit: ${context.outfit?.score}/100
        - Phong cách hiện tại: ${context.outfit?.style}
        - Những món đồ nhận diện được: ${context.outfit?.items?.join(', ')}
        - Những lời khuyên cải thiện tốt nhất: ${context.outfit?.advice?.join('. ')}

        CÁC NGUYÊN TẮC BẮT BUỘC ĐỂ GIỌNG NÓI ĐẠT ĐẲNG CẤP TỰ NHIÊN HỘI THOẠI (CONVERSATIONAL):
        1. XƯNG HÔ THÂN GẦN: Tuyệt đối xưng "mình" và gọi khách hàng là "bạn" (ví dụ: "Mình thấy...", "Bộ đồ này của bạn... nhé", "nha"). Tuyệt đối tránh xưng "Tôi", "Quý khách", "Trợ lý AI" hay "Hệ thống".
        2. VĂN PHONG NÓI (SPOKEN STYLE) tuyệt đối gần gũi, ấm áp, thân thiện, có nhấn nhá cảm xúc:
           - Hãy sử dụng các trợ từ ngữ khí tự nhiên ở cuối câu như: "nhé", "nha", "đấy", "chứ", "à", "ơi", "này".
           - Sử dụng từ ngữ bình dị, sành điệu, hiện đại như: "khá là ổn áp", "xịn sò", "hợp rơ", "rất ra gì và này nọ", "hơi bị đỉnh", "chất chơi".
           - Không nói như robot đọc báo cáo hay máy đọc văn bản. Hãy thêm các từ đệm cảm xúc như: "Ồ", "Ừm", "Mình nghĩ là", "Thực sự thì", "Cá nhân mình thấy".
        3. SIÊU NGẮN GỌN & SÚC TÍCH: Vì đây là cuộc hội thoại giọng nói trực tiếp, người dùng không thể nghe đoạn văn dài lê thê. Phản hồi của bạn CHỈ ĐƯỢC PHÉP dài từ 1 đến 2 câu nói ngắn, trôi chảy, đi thẳng vào ý chính. Không bao giờ gạch đầu dòng, không liệt kê danh sách, không trả lời dông dài lý thuyết hay học thuật.
        4. TỰ ĐỘNG CHUYỂN SỐ THÀNH CHỮ: Hãy luôn viết điểm số hoặc các chữ số thành chữ tiếng Việt đầy đủ (ví dụ: viết "tám mươi hai điểm" thay vì "82 điểm", "chín mươi điểm" thay vì "90 điểm") để khi đọc lên không bị khô khan, vấp giọng.
        5. TẬP TRUNG GIÚP ĐỠ: Hãy khen ngợi điểm tốt trước bằng sự nhiệt tình chân thành, rồi gợi ý điểm có thể cải thiện dựa trên chính phong cách "${context.outfit?.style}" và những món đồ họ đang mặc.
      `;
    } else if (!context.outfit && !context.post) {
      // General Assistant Mode
      contextDescription = "NGUỒN: Trợ lý thời trang tổng quát.";
      systemInstruction = `
        Bạn là một chuyên gia thời trang AI cao cấp trong ứng dụng LuckyDream. 
        Bạn là một trợ lý thông minh hỗ trợ người dùng về mọi vấn đề thời trang.
        
        NHIỆM VỤ:
        1. Giúp người dùng tìm kiếm cảm hứng thời trang.
        2. Tư vấn các xu hướng mới nhất.
        3. Trả lời các câu hỏi về phối đồ, màu sắc, phom dáng.
        
        QUY TẮC PHẢN HỒI:
        - ĐỊNH DẠNG: Sử dụng xuống dòng, phân đoạn rõ ràng.
        - TONE GIỌNG: Tinh tế, hiện đại, sang trọng.
        - NGÔN NGỮ: Tiếng Việt.
      `;
    } else if (context.source === 'public_social_post' && context.post) {
      contextDescription = `
        LOẠI NGUỒN: Bài đăng cộng đồng (Social Post).
        QUYỀN SỞ HỮU: Đăng bởi @${ownerName}.
        MÔ TẢ BÀI ĐĂNG: ${context.post.description}
        VỊ TRÍ: ${context.post.location}
        TAGS: ${context.post.tags.join(', ')}
      `;
      systemInstruction = `
        Bạn là một chuyên gia thời trang AI cao cấp trong ứng dụng LuckyDream. 
        Bạn đang tư vấn cho người dùng về bài đăng cộng đồng của ${ownerName}.
        
        QUY TẮC PHẢN HỒI:
        1. Hãy trả lời như một người cố vấn thời trang đang cùng user thảo luận về phong cách của ${ownerName}. Hãy khen ngợi và phân tích sâu về cách phối đồ của họ.
        2. ĐỊNH DẠNG: Sử dụng xuống dòng, phân đoạn rõ ràng. Sử dụng bullet points khi liệt kê.
        3. TONE GIỌNG: Tinh tế, hiện đại, sang trọng.
        4. NGÔN NGỮ: Tiếng Việt.
      `;
    } else {
      contextDescription = `
        LOẠI NGUỒN: Đề xuất từ hệ thống AI (AI Recommendation).
        TÊN OUTFIT: ${context.outfit?.name}
        CÁ TÍNH: ${context.outfit?.personality}
        HOÀN CẢNH PHÙ HỢP: ${context.outfit?.locations?.join(', ')}
        MÔ TẢ: ${context.outfit?.description}
      `;
      systemInstruction = `
        Bạn là một chuyên gia thời trang AI cao cấp trong ứng dụng LuckyDream. 
        Bạn đang tư vấn cho người dùng về bộ trang phục được đề xuất bởi AI.
        
        QUY TẮC PHẢN HỒI:
        1. Hãy trả lời như một Stylist cá nhân đang tư vấn riêng cho user. Sử dụng tone giọng "tôi dành riêng bộ này cho bạn".
        2. ĐỊNH DẠNG: Sử dụng xuống dòng, phân đoạn rõ ràng. Sử dụng bullet points khi liệt kê.
        3. TONE GIỌNG: Tinh tế, hiện đại, sang trọng.
        4. NGÔN NGỮ: Tiếng Việt.
      `;
    }

    const chatHistory = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...chatHistory
      ]
    });

    return response.text || "Tôi đã nhận được thông tin, bạn cần tôi tư vấn thêm gì không?";
  } catch (error) {
    console.error("Chat AI Error:", error);
    return "Xin lỗi, tôi gặp một chút trục trặc kỹ thuật. Bạn có thể thử lại sau giây lát được không?";
  }
};

/**
 * TRUE AI VIRTUAL TRY-ON (Editorial Quality)
 * Uses Gemini Specialized Image Models to generate a new image of the user wearing the selected garments.
 */
export const generateAITryOn = async (
  bodyImage: string | null,
  topImage: string | null,
  bottomImage: string | null,
  bgMode: string = "studio",
  fullBodyImage: string | null = null
): Promise<string | null> => {
  try {
    console.log("AI Try-On: Initializing API...");
    const ai = getAI();
    const parts: any[] = [];
    
    // IMAGE 1: Body reference
    if (bodyImage) {
      parts.push({ text: "REFERENCE IMAGE 1 (THE PERSON):" }, {
        inlineData: { data: cleanBase64(bodyImage), mimeType: "image/png" }
      });
    } else {
      parts.push({ text: "REFERENCE IMAGE 1 (MISSING): The user did not provide a body image. Please generate the try-on on a realistic, high-quality fashion mannequin or a generic fit model body that matches standard proportions." });
    }

    let bottom_subtype = "pants";
    let full_body_subtype = "dress";

    if (bottomImage) {
      try {
        const classPrompt = `Analyze this lower-body garment image. Classify it into one of the following exact categories: "skirt", "pants", "shorts", or "other". Respond with only the chosen category name in lowercase.`;
        const classResponse = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: [
            { inlineData: { data: cleanBase64(bottomImage), mimeType: "image/png" } },
            { text: classPrompt }
          ]
        });
        const classified = classResponse.text?.trim().toLowerCase() || "pants";
        if (classified.includes("skirt")) bottom_subtype = "skirt";
        else if (classified.includes("shorts")) bottom_subtype = "shorts";
        else if (classified.includes("pants")) bottom_subtype = "pants";
        else bottom_subtype = "other";
        console.log("Classified bottom subtype:", bottom_subtype);
      } catch (err) {
        console.error("Failed to classify bottom garment:", err);
      }
    }

    if (fullBodyImage) {
      try {
        const classPrompt = `Analyze this full-body garment image. Classify it into one of the following exact categories: "dress", "jumpsuit", "full-set", or "other". Respond with only the chosen category name in lowercase.`;
        const classResponse = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: [
            { inlineData: { data: cleanBase64(fullBodyImage), mimeType: "image/png" } },
            { text: classPrompt }
          ]
        });
        const classified = classResponse.text?.trim().toLowerCase() || "dress";
        if (classified.includes("dress")) full_body_subtype = "dress";
        else if (classified.includes("jumpsuit")) full_body_subtype = "jumpsuit";
        else if (classified.includes("full-set") || classified.includes("set")) full_body_subtype = "full-set";
        else full_body_subtype = "other";
        console.log("Classified full-body subtype:", full_body_subtype);
      } catch (err) {
        console.error("Failed to classify full-body garment:", err);
      }
    }

    let specialInstructions = "";

    if (fullBodyImage) {
      if (full_body_subtype === "dress") {
        specialInstructions = `
          - SPECIFIC DRESS INSTRUCTION: The user is wearing a single full-body dress (váy liền/đầm).
          - ACTION: Completely delete/erase BOTH the original shirt/top AND pants/skirt/bottom from the person in IMAGE 1. Replace them entirely with this new dress.
          - NATURAL LEGS RECONSTRUCTION: You MUST reconstruct natural, bare, clean skin and human legs (thighs, knees, calves, ankles depending on the dress length) beneath the dress's hem.
          - Make sure NO original pants, skirt, or clothing traces are visible underneath. The skin of the legs must blend perfectly with the person's skin tone and body pose.
        `;
      } else {
        specialInstructions = `
          - SPECIFIC FULL-SET/JUMPSUIT INSTRUCTION: The user is wearing a full-body jumpsuit or matching set (${full_body_subtype}).
          - ACTION: Completely replace the entire original outfit on the person's body with this new jumpsuit/full-set.
          - FIT: Ensure it wraps naturally around the body curves, matching the model's pose, contours, and physical proportions seamlessly.
        `;
      }
    } else {
      // Top + Bottom or just Bottom
      if (bottom_subtype === "skirt") {
        specialInstructions = `
          - SPECIFIC SKIRT INSTRUCTION: The lower-body garment is a skirt (chân váy).
          - ACTION: Completely delete/erase the original lower-body garment (pants/shorts/skirt) from the person in IMAGE 1. 
          - NATURAL LEGS RECONSTRUCTION: You MUST reconstruct natural, bare, clean skin and human legs (thighs, knees, calves, ankles depending on the skirt's length) beneath the skirt's hem.
          - Do NOT layer the skirt on top of original pants or clothes. Erase the original lower garment fully, leaving only natural-looking human legs/skin. The skin of the legs must blend perfectly with the person's skin tone and body pose.
        `;
      } else if (bottom_subtype === "shorts" || bottom_subtype === "pants") {
        specialInstructions = `
          - SPECIFIC PANTS/SHORTS INSTRUCTION: The lower-body garment is pants or shorts.
          - ACTION: Reconstruct the pants/shorts over the hips and legs of the person in IMAGE 1. Ensure any original pants or lower-body garment is completely covered and replaced with this new item.
        `;
      }
    }

    // IMAGE 2: Top garment
    if (topImage) {
      parts.push({ text: "REFERENCE IMAGE 2 (THE SHIRT/TOP):" }, {
        inlineData: { data: cleanBase64(topImage), mimeType: "image/png" }
      });
    }

    // IMAGE 3: Bottom garment
    if (bottomImage) {
      parts.push({ text: "REFERENCE IMAGE 3 (THE PANTS/SKIRT):" }, {
        inlineData: { data: cleanBase64(bottomImage), mimeType: "image/png" }
      });
    }

    // IMAGE 4: Full-body garment
    if (fullBodyImage) {
      parts.push({ text: "REFERENCE IMAGE 4 (THE FULL-BODY OUTFIT/DRESS/JUMPSUIT):" }, {
        inlineData: { data: cleanBase64(fullBodyImage), mimeType: "image/png" }
      });
    }

    const prompt = `
      TASK: HIGH-END PHOTOREALISTIC FASHION VIRTUAL TRY-ON.
      
      MANDATORY GOAL: Generate a SINGLE new high-quality image of the person from REFERENCE IMAGE 1 wearing the chosen garment(s):
      ${topImage ? "- Wear the exact shirt/top from REFERENCE IMAGE 2." : ""}
      ${bottomImage ? `- Wear the exact pants/skirt from REFERENCE IMAGE 3 (${bottom_subtype.toUpperCase()}).` : ""}
      ${fullBodyImage ? `- Wear the exact full-body outfit/dress/jumpsuit from REFERENCE IMAGE 4 (${full_body_subtype.toUpperCase()}).` : ""}
      
      SPECIAL GEOMETRY & CLOTHING RULES:
      ${specialInstructions}
      
      CORE DIRECTIVES:
      - PERSON IDENTITY: Use REFERENCE IMAGE 1 as the exact person reference. Preserve face, body shape, skin tone, pose, hairstyle, shoes, and facial expression.
      - CLOTHING RECONSTRUCTION: Physically reconstruct the garments onto the body. 
      - NATURAL PHYSICS: Generate realistic folds, drape, shadows, and seams. Do not simply paste or overlay the clothes.
      - LIGHTING: Apply professional studio fashion lighting with realistic depth.
      - ENVIRONMENT: Set background to ${bgMode}.
      - STYLE: Realistic full-body fashion photography. Sharp focus.
      
      PROHIBITED:
      - DO NOT show the clothing items separately.
      - DO NOT create a collage or multi-panel image.
      - DO NOT overlay images like stickers.
      - DO NOT show floating garments.
      - DO NOT change the person's identity.

      [SYSTEM INSTRUCTION: OUTPUT THE GENERATED IMAGE DIRECTLY AS AN INLINE DATA BYTE PART].
    `;

    console.log("AI Try-On: Sending request to Gemini 2.5 Flash Image (Specialized)...");
    
    // Switch to specialized image model for high-quality virtual try-on
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", 
      contents: {
        parts: [...parts, { text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });
    
    console.log("AI Try-On: Response received. Inspecting parts...");
    
    // Inspect candidates and parts
    if (response.candidates && response.candidates.length > 0) {
      const respParts = response.candidates[0].content.parts;
      for (const part of respParts) {
        if (part.inlineData) {
          console.log("AI Try-On: Found inlineData (Image generated!)");
          return `data:image/png;base64,${part.inlineData.data}`;
        }
        if (part.text) {
          console.log("AI Try-On: Response text part:", part.text.substring(0, 100) + "...");
        }
      }
    }
    
    console.warn("AI Try-On: No image data found in response parts.");
    return null; 
  } catch (error) {
    console.error("AI Try-On Generation Error:", error);
    return null;
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
      model: "gemini-flash-latest", // Sử dụng Gemini Flash Latest
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }] as any
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
  }

  // Thử lần 2 (Fallback): Sử dụng Gemini Flash Latest
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // Model Flash Latest
      contents: [{ role: 'user', parts: [{ text: prompt + "\n(Lưu ý: Hãy sử dụng kiến thức của bạn về thành phố này để trả lời vì dịch vụ tìm kiếm đang tạm bảo trì)." }] }],
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

/**
 * Helpler to prepend a 44-byte WAV header to raw PCM 16-bit Mono 24000Hz audio
 */
export const prependWavHeader = (pcmBuffer: Buffer, sampleRate: number = 24000): Buffer => {
  const header = Buffer.alloc(44);
  const dataLength = pcmBuffer.length;
  const fileLength = dataLength + 36;

  // RIFF identifier
  header.write("RIFF", 0);
  // File length minus 8 bytes
  header.writeUInt32LE(fileLength, 4);
  // WAVE identifier
  header.write("WAVE", 8);
  // format chunk identifier (with trailing space)
  header.write("fmt ", 12);
  // format chunk length (16 bytes)
  header.writeUInt32LE(16, 16);
  // sample format (1 = raw PCM)
  header.writeUInt16LE(1, 20);
  // channel count (1 = mono)
  header.writeUInt16LE(1, 22);
  // sample rate (e.g. 24000)
  header.writeUInt32LE(sampleRate, 24);
  // byte rate (sampleRate * channelCount * bytesPerSample) => 24000 * 1 * 2 = 48000
  header.writeUInt32LE(sampleRate * 2, 28);
  // block align (channelCount * bytesPerSample) => 1 * 2 = 2
  header.writeUInt16LE(2, 32);
  // bits per sample (16)
  header.writeUInt16LE(16, 34);
  // data chunk identifier
  header.write("data", 36);
  // data chunk length
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
};

/**
 * Standardize and clean text before TTS synthesis to prevent stuttering, correct pronunciation,
 * and translate numeric/special characters into natural spoken Vietnamese words.
 */
export const normalizeTextForSpeech = (text: string): string => {
  if (!text) return "";

  // 1. Remove Markdown syntax completely
  let clean = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/#[#\s]+(.*?)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[-*+]\s+/g, " ")
    .replace(/^[0-9]+\.\s+/gm, " ");

  // 2. Clean numeric strings into expressive Vietnamese words
  const numToVietnamese = (numStr: string): string => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return numStr;

    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    if (num === 0) return "không";
    if (num < 10) return units[num];
    if (num === 10) return "mười";
    if (num < 20) {
      const unit = num % 10;
      return "mười " + (unit === 5 ? "lăm" : units[unit]);
    }
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      let unitStr = units[unit];
      if (unit === 1) unitStr = "mốt";
      if (unit === 5) unitStr = "lăm";
      return units[ten] + " mươi " + unitStr;
    }
    return numStr; 
  };

  // Process standard digit patterns
  clean = clean.replace(/\b\d+\b/g, (match) => numToVietnamese(match));

  // 3. Normalise abbreviations and special symbol patterns for verbal delivery
  clean = clean
    .replace(/%/g, " phần trăm ")
    .replace(/\//g, " hoặc ")
    .replace(/&/g, " và ")
    .replace(/\+/g, " cộng ")
    .replace(/-+/g, " ")
    .replace(/([.!?])\s*/g, "$1 ") // guarantee pause spacing
    .replace(/\s+/g, " ")
    .trim();

  return clean;
};

/**
 * Speech synthesis from text using gemini-3.1-flash-tts-preview
 */
export const generateTTS = async (text: string): Promise<Buffer | null> => {
  try {
    const ai = getAI();
    
    // Configure standard User-Agent header for telemetry
    // @ts-ignore
    ai.httpOptions = {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    };

    // Precalculate natural vocal presentation structures
    const normalizedText = normalizeTextForSpeech(text);

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: normalizedText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // "Puck" is a youth-friendly, highly expressive male voice that is excellent with Vietnamese
            prebuiltVoiceConfig: { voiceName: "Puck" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const pcmBuffer = Buffer.from(base64Audio, "base64");
      // Prepend standard WAV container for the browser to decode and play smoothly
      return prependWavHeader(pcmBuffer, 24000);
    }
    return null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

