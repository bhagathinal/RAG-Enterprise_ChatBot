const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { ChatGroq } = require('@langchain/groq');

class RagChain {
    constructor() {
        this.model = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.1-8b-instant',
            temperature: 0.1,
        });
        
        this.splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
    }

    async createChunks(text, metadata) {
        const docs = await this.splitter.createDocuments([text], [metadata]);
        return docs;
    }

    async formatContext(relevantChunks) {
        return relevantChunks
            .map(c => `[Source: ${c.title}]\n${c.text}`)
            .join('\n\n');
    }

    async getAnswer(query, context) {
        const systemPrompt = `You are the Aria AI Assistant for AcmeCorp. 
Use the provided context from company policies to answer the user's question accurately and professionally.

FORMATTING RULES:
1. Always use **Bold Heading** for categorized points.
2. Put each point on a NEW LINE.
3. Use bullet points or numbered lists for lists of items.
4. Be concise but thorough.

If the answer is not in the context, politely state that you don't have that information.

CONTEXT:
${context}`;

        const response = await this.model.invoke([
            ['system', systemPrompt],
            ['user', query]
        ]);

        return response.content;
    }
}

module.exports = new RagChain();
