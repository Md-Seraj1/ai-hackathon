// Update 1
/**
 * Nano Banana API - Virtual Try-On
 * Supports both api.nano-banana.run (sync) and api.nanobananaapi.ai (async + poll)
 */

const NANO_BANANA_RUN = 'https://api.nano-banana.run/v1/edit';
const NANOBANANA_API = 'https://api.nanobananaapi.ai/api/v1/nanobanana';

/**
 * Capture a frame from a video element as base64 JPEG
 */
export function captureFrameFromVideo(videoEl, quality = 0.9) {
    if (!videoEl || videoEl.readyState < 2) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // Mirror to match display
    ctx.drawImage(videoEl, 0, 0);
    return canvas.toDataURL('image/jpeg', quality).split(',')[1];
}

/**
 * Virtual try-on via api.nano-banana.run (sync, single image + prompt)
 * Person photo base64 + garment description in prompt
 */
async function tryOnNanoBananaRun(apiKey, personImageBase64, product) {
    const prompt = `Virtual try-on: Make the person in this photo wear this exact clothing item. The garment is: ${product?.name || 'the clothing'}${product?.description ? '. ' + product.description : ''}. Render the person wearing it realistically with natural fit, fabric draping, and proper lighting. Keep the same pose, background, and body proportions.`;
    const res = await fetch(NANO_BANANA_RUN, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: personImageBase64,
            prompt,
            model: 'nano-banana-v1',
        }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data?.error?.message || data?.message || data?.detail || data?.error;
        if (res.status === 401 || res.status === 403 || /permission|unauthorized|forbidden|invalid.*key/i.test(String(msg))) {
            throw new Error('Invalid or expired API key. Get a key from nano-banana.run or nanobananaapi.ai and add it to .env as VITE_NANO_BANANA_API_KEY.');
        }
        throw new Error(msg || 'API request failed');
    }
    return data?.edited_image_url || data?.editedImageUrl || data?.resultImageUrl || data?.url || null;
}

/**
 * Virtual try-on via NanoBananaAPI.ai (async + poll)
 * Supports imageUrls for person + garment
 */
async function tryOnNanoBananaApi(apiKey, personImageBase64, product) {
    // NanoBananaAPI requires URLs - use data URI for person photo
    const personDataUrl = `data:image/jpeg;base64,${personImageBase64}`;
    const garmentUrl = product?.image || product?.images?.[0];
    const imageUrls = garmentUrl ? [personDataUrl, garmentUrl] : [personDataUrl];
    const prompt = garmentUrl
        ? 'Virtual try-on: Put the clothing/garment from the second image onto the person in the first image. Make the person wear it realistically with natural fit, fabric draping, and proper lighting. Keep the same pose, background, and body proportions. Output only the result.'
        : `Virtual try-on: Make the person wear ${product?.name || 'this clothing'}. Realistic fit and draping. Same pose and background.`;

    const generateRes = await fetch(`${NANOBANANA_API}/generate`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            type: 'IMAGETOIAMGE',
            numImages: 1,
            imageUrls,
            callBackUrl: 'https://example.com/callback', // Required but we poll instead
        }),
    });
    const genData = await generateRes.json().catch(() => ({}));
    if (!generateRes.ok || genData?.code !== 200) {
        const msg = genData?.msg || genData?.message || genData?.errorMessage;
        if (generateRes.status === 401 || generateRes.status === 403 || /permission|unauthorized|invalid.*key/i.test(String(msg))) {
            throw new Error('Invalid or expired API key. Get a key from nanobananaapi.ai and add it to .env as VITE_NANO_BANANA_API_KEY.');
        }
        throw new Error(msg || 'Failed to start generation');
    }
    const taskId = genData?.data?.taskId;
    if (!taskId) throw new Error('No task ID returned');

    // Poll for result (every 2s, max 60s)
    for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await fetch(`${NANOBANANA_API}/record-info?taskId=${taskId}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        const statusData = await statusRes.json();
        const d = statusData?.data;
        if (d?.successFlag === 1 && d?.response?.resultImageUrl) {
            return d.response.resultImageUrl;
        }
        if (d?.successFlag === 2 || d?.successFlag === 3) {
            throw new Error(d?.errorMessage || 'Generation failed');
        }
    }
    throw new Error('Try-on timed out. Please try again.');
}

/**
 * Run virtual try-on - tries nano-banana.run (sync) first, then NanoBananaAPI.ai (async)
 */
export async function virtualTryOn(personImageBase64, product, onProgress) {
    const apiKey = import.meta.env.VITE_NANO_BANANA_API_KEY;
    if (!apiKey) throw new Error('Nano Banana API key not configured. Add VITE_NANO_BANANA_API_KEY to .env');

    onProgress?.('Starting virtual try-on...');

    // Try nano-banana.run first (sync, simpler)
    let lastError = null;
    try {
        onProgress?.('Processing with AI...');
        const result = await tryOnNanoBananaRun(apiKey, personImageBase64, product);
        if (result) return result;
    } catch (e1) {
        lastError = e1;
        console.warn('nano-banana.run failed:', e1);
    }

    // Fallback to NanoBananaAPI.ai (async + poll, supports garment image)
    try {
        onProgress?.('Trying alternative method...');
        const result = await tryOnNanoBananaApi(apiKey, personImageBase64, product);
        if (result) return result;
    } catch (e2) {
        lastError = e2;
        console.warn('NanoBananaAPI failed:', e2);
    }

    throw lastError || new Error('Virtual try-on failed. Please try again.');
}
