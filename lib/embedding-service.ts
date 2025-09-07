import axios from 'axios';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

export interface SimilarityResult {
  text: string;
  similarity: number;
  index: number;
}

export class EmbeddingService {
  private modelName: string;
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.modelName = 'sentence-transformers/all-MiniLM-L6-v2';
    this.apiUrl = process.env.HUGGING_FACE_API_URL || 'https://api-inference.huggingface.co';
    this.apiKey = process.env.HUGGING_FACE_API_KEY || '';
  }

  async generateEmbedding(text: string): Promise<number[]> {
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

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
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
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));
    return dotProduct / (magnitude1 * magnitude2);
  }

  // Find most similar texts
  async findSimilar(
    queryText: string, 
    candidateTexts: string[], 
    threshold: number = 0.7
  ): Promise<SimilarityResult[]> {
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

  // Semantic search within a collection of documents
  async semanticSearch(
    query: string,
    documents: Array<{ id: string; content: string; metadata?: any }>,
    topK: number = 5,
    threshold: number = 0.5
  ): Promise<Array<{ document: any; similarity: number }>> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const documentTexts = documents.map(doc => doc.content);
      const documentEmbeddings = await this.generateEmbeddings(documentTexts);

      const similarities = documentEmbeddings.map((embedding, index) => ({
        document: documents[index],
        similarity: this.calculateSimilarity(queryEmbedding, embedding)
      }));

      return similarities
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw new Error('Failed to perform semantic search');
    }
  }

  // Cluster similar texts based on embeddings
  async clusterTexts(
    texts: string[], 
    similarityThreshold: number = 0.8
  ): Promise<Array<Array<{ text: string; index: number }>>> {
    try {
      const embeddings = await this.generateEmbeddings(texts);
      const clusters: Array<Array<{ text: string; index: number }>> = [];
      const processed = new Set<number>();

      for (let i = 0; i < texts.length; i++) {
        if (processed.has(i)) continue;

        const cluster = [{ text: texts[i], index: i }];
        processed.add(i);

        for (let j = i + 1; j < texts.length; j++) {
          if (processed.has(j)) continue;

          const similarity = this.calculateSimilarity(embeddings[i], embeddings[j]);
          if (similarity >= similarityThreshold) {
            cluster.push({ text: texts[j], index: j });
            processed.add(j);
          }
        }

        clusters.push(cluster);
      }

      return clusters;
    } catch (error) {
      console.error('Error clustering texts:', error);
      throw new Error('Failed to cluster texts');
    }
  }

  getModelName(): string {
    return this.modelName;
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();
