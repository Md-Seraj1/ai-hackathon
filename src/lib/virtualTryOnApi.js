// Update 3
// Update 2
// Update 1
/**
 * AI Virtual Try-On - Google Gemini API (Nano Banana / Imagen)
 * Uses gemini-2.5-flash-image for image editing
 */

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

// Category-based placement prompts
const CATEGORY_PROMPTS = {
  clothes: 'Upper and lower body alignment. Ensure the clothing fits naturally on the person\'s torso and limbs.',
  jewellery: 'Neck, ear, or hand placement. Position the jewellery on the appropriate body part with natural proportions.',
  watches: 'Wrist alignment. Place the watch on the person\'s visible wrist with correct size and perspective.',
  default: 'Natural placement on the person. Match lighting, pose, and body proportions.',
};

// Default model images for Model mode (full-body, front-facing)
const DEFAULT_MODEL_IMAGES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=512&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512&q=80',
];

/**
 * Resize/compress image to max dimension for API (reduce payload)
 */
function compressImage(base64, maxWidth = 1024, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxWidth || h > maxWidth) {
        if (w > h) {
          h = (h * maxWidth) / w;
          w = maxWidth;
        } else {
          w = (w * maxWidth) / h;
          h = maxWidth;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
    };
    img.onerror = () => resolve(base64);
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

/**
 * Fetch image URL and return base64
 */
async function urlToBase64(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('Could not load product image');
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result.split(',')[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Virtual try-on via Google Gemini API
 */
export async function virtualTryOn(personImageBase64, product, categorySlug, onProgress) {
  const apiKey = import.meta.env.VITE_NANO_BANANA_API_KEY;
  if (!apiKey) throw new Error('API key not configured. Add VITE_NANO_BANANA_API_KEY to .env');

  onProgress?.('Preparing images...');

  // Get garment image
  const garmentUrl = product?.image || product?.images?.[0];
  if (!garmentUrl) throw new Error('Product image not found');

  let garmentBase64;
  try {
    garmentBase64 = await urlToBase64(garmentUrl);
  } catch {
    throw new Error('Could not load product image. Check the image URL.');
  }

  // Compress images for faster upload
  onProgress?.('Optimizing images...');
  const [personB64, garmentB64] = await Promise.all([
    compressImage(personImageBase64),
    compressImage(garmentBase64),
  ]);

  const placement = CATEGORY_PROMPTS[categorySlug?.toLowerCase()] || CATEGORY_PROMPTS.default;
  const prompt = `Virtual try-on: Create a professional e-commerce photo. The first image is the clothing/product. The second image is the person. Put the clothing/product from the first image onto the person in the second image. ${placement} Preserve the person's pose, face, and background. Output a single photorealistic image of the person wearing the product.`;

  onProgress?.('Generating try-on...');

  const parts = [
    { inline_data: { mime_type: 'image/jpeg', data: garmentB64 } },
    { inline_data: { mime_type: 'image/jpeg', data: personB64 } },
    { text: prompt },
  ];

  const res = await fetch(`${GEMINI_API}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || data?.error?.details?.[0]?.reason || 'API request failed';
    if (res.status === 401 || res.status === 403 || /permission|quota|api.key/i.test(msg)) {
      throw new Error('Invalid API key or quota exceeded. Check your Google AI Studio API key.');
    }
    throw new Error(msg);
  }

  const partsOut = data?.candidates?.[0]?.content?.parts || [];
  for (const p of partsOut) {
    if (p.inlineData?.data) {
      return `data:image/${p.inlineData.mimeType?.replace('image/', '') || 'png'};base64,${p.inlineData.data}`;
    }
  }

  throw new Error('No image in response. Please try again.');
}

/**
 * Capture frame from video element
 */
export function captureFrameFromVideo(videoEl, quality = 0.9) {
  if (!videoEl || videoEl.readyState < 2) return null;
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, 0, 0);
  return canvas.toDataURL('image/jpeg', quality).split(',')[1];
}

/**
 * Get default model image for Model mode
 */
export function getDefaultModelImage(index = 0) {
  return DEFAULT_MODEL_IMAGES[index % DEFAULT_MODEL_IMAGES.length];
}

/**
 * Fetch model image as base64
 */
export async function fetchModelImageAsBase64(index = 0) {
  const url = getDefaultModelImage(index);
  return urlToBase64(url);
}
