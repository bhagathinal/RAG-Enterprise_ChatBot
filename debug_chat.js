require('dotenv').config({ path: 'D:/JOB_PREP/Projects/RAG_Enterprise/server/.env' });
const mongoose = require('mongoose');
const ragService = require('./server/src/services/ragService');

async function testChat() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const query = 'How do I apply for remote work?';
        console.log(`Testing query: "${query}"`);

        const result = await ragService.processQuery(query);
        console.log('RESULT:', JSON.stringify(result, null, 2));

    } catch (err) {
        console.error('ERROR during test:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testChat();
