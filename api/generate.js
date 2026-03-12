// api/generate.js
export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY; // safe secret
  const prompt = req.query.prompt;

  const response = await fetch("https://api.example.com/generate", {
    method: "POST",
    headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();
  res.status(200).json(data);
}