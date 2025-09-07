import { io, Socket } from 'socket.io-client';

export interface EmbeddingRequest {
  text?: string;
  texts?: string[];
  requestId: string;
}

export interface SimilarityRequest {
  query: string;
  candidates: string[];
  threshold?: number;
  requestId: string;
}

export interface EmbeddingResponse {
  embedding?: number[];
  embeddings?: number[][];
  model: string;
  requestId: string;
}

export interface SimilarityResponse {
  results: Array<{
    text: string;
    similarity: number;
    index: number;
  }>;
  model: string;
  threshold: number;
  requestId: string;
}

export class SocketEmbeddingClient {
  private socket: Socket | null = null;
  private url: string;

  constructor(url: string = 'http://localhost:3000') {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.url);

      this.socket.on('connect', () => {
        console.log('Connected to embedding server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  generateEmbedding(text: string): Promise<EmbeddingResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      const requestId = Math.random().toString(36).substr(2, 9);

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000);

      this.socket.once('embedding-result', (response: EmbeddingResponse) => {
        if (response.requestId === requestId) {
          clearTimeout(timeout);
          resolve(response);
        }
      });

      this.socket.once('embedding-error', (error: { error: string; requestId: string }) => {
        if (error.requestId === requestId) {
          clearTimeout(timeout);
          reject(new Error(error.error));
        }
      });

      this.socket.emit('generate-embedding', { text, requestId });
    });
  }

  generateEmbeddings(texts: string[]): Promise<EmbeddingResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      const requestId = Math.random().toString(36).substr(2, 9);

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000);

      this.socket.once('embedding-result', (response: EmbeddingResponse) => {
        if (response.requestId === requestId) {
          clearTimeout(timeout);
          resolve(response);
        }
      });

      this.socket.once('embedding-error', (error: { error: string; requestId: string }) => {
        if (error.requestId === requestId) {
          clearTimeout(timeout);
          reject(new Error(error.error));
        }
      });

      this.socket.emit('generate-embedding', { texts, requestId });
    });
  }

  findSimilar(query: string, candidates: string[], threshold: number = 0.7): Promise<SimilarityResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      const requestId = Math.random().toString(36).substr(2, 9);

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 30000);

      this.socket.once('similarity-result', (response: SimilarityResponse) => {
        if (response.requestId === requestId) {
          clearTimeout(timeout);
          resolve(response);
        }
      });

      this.socket.once('similarity-error', (error: { error: string; requestId: string }) => {
        if (error.requestId === requestId) {
          clearTimeout(timeout);
          reject(new Error(error.error));
        }
      });

      this.socket.emit('find-similar', { query, candidates, threshold, requestId });
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const socketEmbeddingClient = new SocketEmbeddingClient();
