const express = require('express');
const next = require('next');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 3000;

// Embedding service using sentence-transformers/all-MiniLM-L6-v2
class EmbeddingService {
  constructor() {
    this.modelName = 'sentence-transformers/all-MiniLM-L6-v2';
    this.apiUrl = process.env.HUGGING_FACE_API_URL || 'https://api-inference.huggingface.co';
    this.apiKey = process.env.HUGGING_FACE_API_KEY;
  }

  async generateEmbedding(text) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/pipeline/feature-extraction`,
        {
          inputs: text,
          options: {
            wait_for_model: true,
            use_cache: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'x-use-cache': 'false'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateEmbeddings(texts) {
    try {
      const embeddings = await Promise.all(
        texts.map(text => this.generateEmbedding(text))
      );
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  // Calculate cosine similarity between two embeddings
  calculateSimilarity(embedding1, embedding2) {
    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));
    return dotProduct / (magnitude1 * magnitude2);
  }

  // Find most similar texts
  async findSimilar(queryText, candidateTexts, threshold = 0.7) {
    try {
      const queryEmbedding = await this.generateEmbedding(queryText);
      const candidateEmbeddings = await this.generateEmbeddings(candidateTexts);

      const similarities = candidateEmbeddings.map((embedding, index) => ({
        text: candidateTexts[index],
        similarity: this.calculateSimilarity(queryEmbedding, embedding),
        index
      }));

      return similarities
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Error finding similar texts:', error);
      throw new Error('Failed to find similar texts');
    }
  }
}

nextApp.prepare().then(() => {
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Initialize embedding service
  const embeddingService = new EmbeddingService();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      model: embeddingService.modelName
    });
  });

  // Embedding endpoints
  app.post('/api/embeddings/generate', async (req, res) => {
    try {
      const { text, texts } = req.body;

      if (text) {
        const embedding = await embeddingService.generateEmbedding(text);
        res.json({ embedding, model: embeddingService.modelName });
      } else if (texts && Array.isArray(texts)) {
        const embeddings = await embeddingService.generateEmbeddings(texts);
        res.json({ embeddings, model: embeddingService.modelName });
      } else {
        res.status(400).json({ error: 'Please provide either "text" or "texts" parameter' });
      }
    } catch (error) {
      console.error('Embedding generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/embeddings/similarity', async (req, res) => {
    try {
      const { query, candidates, threshold = 0.7 } = req.body;

      if (!query || !candidates || !Array.isArray(candidates)) {
        return res.status(400).json({ 
          error: 'Please provide "query" and "candidates" array' 
        });
      }

      const results = await embeddingService.findSimilar(query, candidates, threshold);
      res.json({ 
        results, 
        model: embeddingService.modelName,
        threshold 
      });
    } catch (error) {
      console.error('Similarity calculation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('generate-embedding', async (data) => {
      try {
        const { text, texts, requestId } = data;
        let result;

        if (text) {
          const embedding = await embeddingService.generateEmbedding(text);
          result = { embedding, model: embeddingService.modelName };
        } else if (texts && Array.isArray(texts)) {
          const embeddings = await embeddingService.generateEmbeddings(texts);
          result = { embeddings, model: embeddingService.modelName };
        } else {
          socket.emit('embedding-error', { 
            error: 'Please provide either "text" or "texts" parameter',
            requestId 
          });
          return;
        }

        socket.emit('embedding-result', { ...result, requestId });
      } catch (error) {
        console.error('WebSocket embedding error:', error);
        socket.emit('embedding-error', { 
          error: error.message, 
          requestId: data.requestId 
        });
      }
    });

    socket.on('find-similar', async (data) => {
      try {
        const { query, candidates, threshold = 0.7, requestId } = data;

        if (!query || !candidates || !Array.isArray(candidates)) {
          socket.emit('similarity-error', { 
            error: 'Please provide "query" and "candidates" array',
            requestId 
          });
          return;
        }

        const results = await embeddingService.findSimilar(query, candidates, threshold);
        socket.emit('similarity-result', { 
          results, 
          model: embeddingService.modelName,
          threshold,
          requestId 
        });
      } catch (error) {
        console.error('WebSocket similarity error:', error);
        socket.emit('similarity-error', { 
          error: error.message, 
          requestId: data.requestId 
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Handle all other routes with Next.js
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Server ready on http://localhost:${port}`);
    console.log(`> Using embedding model: ${embeddingService.modelName}`);
    console.log(`> WebSocket server ready for real-time embedding operations`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});

module.exports = { EmbeddingService };
