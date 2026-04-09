require('dotenv').config();
const mongoose = require('mongoose');
const { ingestAllPdfs, processQuery } = require('./src/services/ragService');

async function testEverything() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to:', process.env.MONGODB_URI);

        console.log('--- STEP 1: Forced Re-Ingestion (LangChain) ---');
        await ingestAllPdfs();

        const count = await mongoose.connection.db.collection('policychunks').countDocuments();
        console.log('New chunk count:', count);

        console.log('\n--- STEP 2: Testing AI Chat ---');
        const query = 'How do I apply for remote work?';
        console.log(`Testing query: "${query}"`);

        const result = await processQuery(query);
        console.log('RESULT:', JSON.stringify(result, null, 2));

    } catch (err) {
        console.error('ERROR during test:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testEverything();
