const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const PolicyChunk = require('../models/PolicyChunk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function ingestAllPdfs() {
  const dataDir = path.join(__dirname, '..', '..', '..', '_Data');
  if (!fs.existsSync(dataDir)) {
      console.error(`Data directory not found at: ${dataDir}`);
      return;
  }
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));

  console.log(`🚀 Ingesting ${files.length} PDFs from Data folder...`);
  await PolicyChunk.deleteMany({});

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Simple robust chunking for enterprise policies
    const chunks = data.text.split('\n\n').filter(c => c.trim().length > 100);
    
    for (const chunk of chunks) {
      await PolicyChunk.create({
        filename: file,
        title: file.replace('.pdf', '').replace(/-/g, ' '),
        text: chunk.trim()
      });
    }
    console.log(`✅ Indexed ${file}`);
  }
}

async function processQuery(query) {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 3);
  const chunks = await PolicyChunk.find({});
  
  // Keyword-based ranking (simple robust retrieval)
  const relevant = chunks.map(chunk => {
    let score = 0;
    const text = chunk.text.toLowerCase();
    keywords.forEach(kw => { if (text.includes(kw)) score++; });
    return { chunk, score };
  }).filter(r => r.score > 0).sort((a,b) => b.score - a.score).slice(0, 5);

  if (relevant.length === 0) return { 
      answer: "I couldn't find specific information regarding your request in the policy documents. Please try a more specific question.", 
      sources: [] 
  };

  const context = relevant.map(r => `[Source: ${r.chunk.title}]\n${r.chunk.text}`).join('\n\n');
  const sources = [...new Set(relevant.map(r => r.chunk.title))];

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are the Enterprise Policy Assistant. Use the provided context to answer concisely and professionally. If the context does not contain the answer, state that clearly.' },
      { role: 'user', content: `CONTEXT:\n${context}\n\nQUESTION: ${query}` }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.1
  });

  return { answer: completion.choices[0].message.content, sources };
}

module.exports = { ingestAllPdfs, processQuery };
