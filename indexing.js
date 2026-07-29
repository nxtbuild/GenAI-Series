import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

async function generateVectorEmbeddingFile(filepath) {
  const loader = new PDFLoader(filepath);
  const document = await loader.load();

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "nextbuild-docs",
    },
  );

  await vectorStore.addDocuments(document);
}

generateVectorEmbeddingFile("nodejs.pdf");
