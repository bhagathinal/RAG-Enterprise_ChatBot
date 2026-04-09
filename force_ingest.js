require('dotenv').config({ path: 'D:/JOB_PREP/Projects/RAG_Enterprise/server/.env' });
const mongoose = require('mongoose');
const { ingestAllPdfs } = require('./server/src/services/ragService');

async function forceIngest() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        await ingestAllPdfs();
        console.log('✅ Re-ingestion successful with LangChain chunking.');

    } catch (err) {
        console.error('ERROR during force ingest:', err);
    } finally {
        await mongoose.connection.close();
    }
}

forceIngest();
