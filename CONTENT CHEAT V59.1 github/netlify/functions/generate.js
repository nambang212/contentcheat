// Import 'node-fetch' untuk bisa menggunakan fetch di lingkungan Node.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Hanya izinkan metode POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Ambil API Key yang sudah kita simpan dengan aman di Netlify
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key tidak ditemukan. Pastikan sudah di-set di Environment Variables Netlify.");
    }

    // Ambil prompt yang dikirim dari frontend (index.html)
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt tidak boleh kosong.' }) };
    }

    // Siapkan payload untuk dikirim ke Google
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };
    
    // Ini adalah URL asli Google Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Panggil API Google dari server Netlify
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Google API Error:", errorBody);
      return { statusCode: response.status, body: JSON.stringify({ error: `Google API Error: ${response.statusText}` }) };
    }

    const data = await response.json();

    // Kirim kembali hasil dari Google ke frontend
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("Server Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
