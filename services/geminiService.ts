
export const generateOutfitsFromImages = async (
  tops: any[],
  bottoms: any[],
  bodyImage?: string,
  height?: string,
  weight?: string,
  fullBodies?: any[]
): Promise<any> => {
  const response = await fetch('/api/generate-outfits', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ tops, bottoms, bodyImage, height, weight, fullBodies })
  });
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON response:", text);
    throw new Error("API did not return JSON");
  }

  return response.json();
};

export const analyzeOutfitFromCamera = async (
  imageData: string
): Promise<any> => {
  const response = await fetch('/api/analyze-outfit-camera', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ imageData })
  });
  
  return response.json();
};

export const chatWithAI = async (
  messages: { role: 'user' | 'assistant', content: string }[],
  context: any
): Promise<string | null> => {
  const response = await fetch('/api/chat-with-ai', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ messages, context })
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON response:", text);
    throw new Error("API did not return JSON");
  }

  const data = await response.json();
  return data.text;
};

export const generateAITryOn = async (
  bodyImage: string | null,
  topImage: string | null,
  bottomImage: string | null,
  bgMode: string = "studio",
  fullBodyImage: string | null = null
): Promise<string | null> => {
  const response = await fetch('/api/generate-ai-tryon', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ bodyImage, topImage, bottomImage, bgMode, fullBodyImage })
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON response:", text);
    throw new Error("API did not return JSON");
  }

  const data = await response.json();
  return data.imageUrl;
};

export const generateTravelPlan = async (
  city: string,
  outfitDescription: string,
  vibe: string
): Promise<any> => {
  const response = await fetch('/api/generate-travel-plan', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ city, outfitDescription, vibe })
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON response:", text);
    throw new Error("API did not return JSON");
  }

  return response.json();
};
