const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const PolicyChunk = require('../models/PolicyChunk');
const ragChain = require('./ragChain');

async function ingestAllPdfs() {
    const dataDir = path.join(__dirname, '..', '..', '..', 'Data');
    if (!fs.existsSync(dataDir)) {
        console.error(`Data directory not found at: ${dataDir}`);
        return;
    }
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.pdf'));

    console.log(`🚀 LangChain Ingestion: Processing ${files.length} PDFs...`);
    await PolicyChunk.deleteMany({});

    for (const file of files) {
        try {
            const filePath = path.join(dataDir, file);
            const dataBuffer = fs.readFileSync(filePath);
            const parser = new PDFParse({ data: dataBuffer });
            const data = await parser.getText();
            await parser.destroy();

            const title = file.replace('.pdf', '').replace(/-/g, ' ');
            
            // Use LangChain Recursive Splitter
            const docs = await ragChain.createChunks(data.text, { source: file, title });

            for (const doc of docs) {
                await PolicyChunk.create({
                    filename: file,
                    title: title,
                    text: doc.pageContent.trim()
                });
            }
            console.log(`✅ Indexed ${file} (${docs.length} chunks)`);
        } catch (err) {
            console.error(`❌ Failed to index ${file}:`, err.message);
        }
    }
    console.log('✨ Ingestion complete.');
}

async function processQuery(query) {
    try {
        const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 3);
        const chunks = await PolicyChunk.find({});

        // Keyword-based ranking
        const relevant = chunks.map(chunk => {
            let score = 0;
            const text = chunk.text.toLowerCase();
            keywords.forEach(kw => { if (text.includes(kw)) score++; });
            return { chunk, score };
        })
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4); // Take top 4 chunks (safer for tokens)

        if (relevant.length === 0) {
            return {
                answer: "I couldn't find specific information regarding your request in the policy documents. Please try a more specific question.",
                sources: []
            };
        }

        const context = await ragChain.formatContext(relevant.map(r => ({
            title: r.chunk.title,
            text: r.chunk.text
        })));

        const sources = [...new Set(relevant.map(r => r.chunk.title))];
        const answer = await ragChain.getAnswer(query, context);

        return { answer, sources };
    } catch (err) {
        console.error('RAG Process Error:', err);
        throw err;
    }
}

module.exports = { ingestAllPdfs, processQuery };
