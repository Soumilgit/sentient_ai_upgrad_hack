import { embeddingService } from '../lib/embedding-service';
import { socketEmbeddingClient } from '../lib/socket-client';

// Example 1: Basic embedding generation
async function basicEmbeddingExample() {
  console.log('=== Basic Embedding Example ===');
  
  try {
    const text = "This is a sample text for embedding generation using sentence-transformers/all-MiniLM-L6-v2";
    const embedding = await embeddingService.generateEmbedding(text);
    
    console.log('Text:', text);
    console.log('Embedding length:', embedding.length);
    console.log('Model used:', embeddingService.getModelName());
    console.log('First 5 dimensions:', embedding.slice(0, 5));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 2: Similarity search
async function similaritySearchExample() {
  console.log('\n=== Similarity Search Example ===');
  
  try {
    const query = "machine learning algorithms";
    const candidates = [
      "Deep learning neural networks",
      "Supervised learning techniques",
      "Natural language processing",
      "Computer vision applications",
      "Cooking recipes and ingredients",
      "Travel destinations in Europe"
    ];
    
    const results = await embeddingService.findSimilar(query, candidates, 0.5);
    
    console.log('Query:', query);
    console.log('Similar texts found:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. "${result.text}" (similarity: ${result.similarity.toFixed(3)})`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 3: Semantic search in documents
async function semanticSearchExample() {
  console.log('\n=== Semantic Search Example ===');
  
  try {
    const documents = [
      {
        id: 'doc1',
        content: 'Introduction to machine learning and artificial intelligence concepts',
        metadata: { category: 'AI', author: 'John Doe' }
      },
      {
        id: 'doc2',
        content: 'Web development with React and Next.js framework',
        metadata: { category: 'Web Dev', author: 'Jane Smith' }
      },
      {
        id: 'doc3',
        content: 'Data science and statistical analysis methods',
        metadata: { category: 'Data Science', author: 'Bob Johnson' }
      },
      {
        id: 'doc4',
        content: 'Mobile app development using React Native',
        metadata: { category: 'Mobile', author: 'Alice Brown' }
      }
    ];
    
    const query = "artificial intelligence and machine learning";
    const results = await embeddingService.semanticSearch(query, documents, 3, 0.3);
    
    console.log('Query:', query);
    console.log('Relevant documents:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. Document ID: ${result.document.id}`);
      console.log(`   Content: ${result.document.content}`);
      console.log(`   Similarity: ${result.similarity.toFixed(3)}`);
      console.log(`   Author: ${result.document.metadata.author}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 4: Text clustering
async function textClusteringExample() {
  console.log('\n=== Text Clustering Example ===');
  
  try {
    const texts = [
      "Machine learning algorithms",
      "Deep learning neural networks",
      "React components and hooks",
      "Next.js routing system",
      "Supervised learning models",
      "JavaScript frameworks",
      "Artificial intelligence applications",
      "Frontend development tools"
    ];
    
    const clusters = await embeddingService.clusterTexts(texts, 0.6);
    
    console.log('Text clustering results:');
    clusters.forEach((cluster, clusterIndex) => {
      console.log(`Cluster ${clusterIndex + 1}:`);
      cluster.forEach(item => {
        console.log(`  - "${item.text}"`);
      });
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 5: WebSocket client usage
async function websocketExample() {
  console.log('\n=== WebSocket Client Example ===');
  
  try {
    // Connect to the WebSocket server
    await socketEmbeddingClient.connect();
    console.log('Connected to WebSocket server');
    
    // Generate embedding via WebSocket
    const text = "Real-time embedding generation using WebSocket";
    const result = await socketEmbeddingClient.generateEmbedding(text);
    
    console.log('Text:', text);
    console.log('Embedding length:', result.embedding?.length);
    console.log('Model used:', result.model);
    
    // Find similar texts via WebSocket
    const query = "web development";
    const candidates = [
      "Frontend frameworks like React",
      "Backend APIs with Node.js",
      "Database design patterns",
      "Machine learning models"
    ];
    
    const similarityResult = await socketEmbeddingClient.findSimilar(query, candidates);
    console.log('\nSimilarity results via WebSocket:');
    similarityResult.results.forEach((item, index) => {
      console.log(`${index + 1}. "${item.text}" (similarity: ${item.similarity.toFixed(3)})`);
    });
    
    // Disconnect
    socketEmbeddingClient.disconnect();
    console.log('Disconnected from WebSocket server');
  } catch (error) {
    console.error('WebSocket Error:', error);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 Running Embedding Service Examples with sentence-transformers/all-MiniLM-L6-v2\n');
  
  await basicEmbeddingExample();
  await similaritySearchExample();
  await semanticSearchExample();
  await textClusteringExample();
  await websocketExample();
  
  console.log('\n✅ All examples completed!');
}

// Export for use in other files
export {
  basicEmbeddingExample,
  similaritySearchExample,
  semanticSearchExample,
  textClusteringExample,
  websocketExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
