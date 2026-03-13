// api/generate.js
export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "API_KEY not defined" });

  const prompt = req.query.prompt;
  let count = parseInt(req.query.count) || 1; // default 1
  if (count < 1) count = 1;

  try {
    const results = [];

    for (let i = 0; i < count; i++) {
      const formData = new FormData();
      formData.append("prompt", prompt);

      const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Error ${response.status}`;
        } catch {
          errorMessage = await response.text(); // fallback
        }
        throw new Error(errorMessage);
      }

      // ... inside your try block for-loop
      const buffer = await response.arrayBuffer();
      // Convert the buffer to a Base64 string
      const base64Image = Buffer.from(buffer).toString('base64');
      // Create a Data URL that the browser understands
      const dataUrl = `data:image/png;base64,${base64Image}`;
      results.push(dataUrl);
      // ...
    }

    res.status(200).json({ urls: results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}