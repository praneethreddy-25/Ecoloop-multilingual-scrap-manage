const express = require('express');

const router = express.Router();

const getSerpApiKey = () => process.env.SERPAPI_KEY || process.env.SERP_API_KEY;

router.post('/classify-image', async (req, res) => {
  const { image } = req.body;
  const apiKey = getSerpApiKey();

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'An image is required.' });
  }

  if (!apiKey || apiKey === 'your_serpapi_key_here') {
    return res.status(503).json({ error: 'SerpAPI is not configured. Add SERPAPI_KEY to server/.env and restart the server.' });
  }

  try {
    const imageMatch = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!imageMatch) {
      return res.status(400).json({ error: 'The uploaded image format is invalid.' });
    }

    const imageBuffer = Buffer.from(imageMatch[2], 'base64');
    if (imageBuffer.length > 500 * 1024) {
      return res.status(413).json({ error: 'Image is larger than SerpAPI allows. Please upload an image below 500 KB.' });
    }

    const form = new FormData();
    form.append('image', new Blob([imageBuffer], { type: imageMatch[1] }), 'upload');
    form.append('api_key', apiKey);

    const uploadResponse = await fetch('https://serpapi.com/image', {
      method: 'POST',
      body: form
    });
    const uploadPayload = await uploadResponse.json();
    if (!uploadResponse.ok || uploadPayload.error || !uploadPayload.image_id) {
      return res.status(502).json({ error: uploadPayload.error || 'SerpAPI could not upload this image.' });
    }

    const params = new URLSearchParams({
      engine: 'google_lens',
      image_id: uploadPayload.image_id,
      type: 'all',
      api_key: apiKey
    });
    const response = await fetch(`https://serpapi.com/search.json?${params}`);

    const payload = await response.json();
    if (!response.ok || payload.error) {
      return res.status(502).json({ error: payload.error || 'SerpAPI could not analyze this image.' });
    }

    const eWasteTerms = /computer|laptop|telephone|mobile|phone|smartphone|electronic|electronics|circuit|circuitry|battery|television|monitor|printer|keyboard|mouse|camera|tablet|device|hardware|charger|cable|technology|console|router/i;
    const labels = [
      ...(payload.related_content || []).map(item => item.query),
      ...(payload.visual_matches || []).map(item => item.title)
    ].filter(Boolean);
    const matchingLabel = labels.find(label => eWasteTerms.test(label));
    const isEWaste = Boolean(matchingLabel);

    return res.json({
      isEWaste,
      confidence: isEWaste ? 75 : 0,
      label: matchingLabel || labels[0] || 'Other object',
      labels: labels.slice(0, 8)
    });
  } catch (error) {
    console.error('SerpAPI image classification failed:', error.message);
    return res.status(502).json({ error: `Unable to reach SerpAPI: ${error.message}` });
  }
});

router.get('/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.query;
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
  }

  return res.json({ address: `GPS: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}` });
});

module.exports = router;