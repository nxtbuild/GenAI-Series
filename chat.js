import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

const client = new OpenAI();

async function query(userQuery) {
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

  const vectorRerival = vectorStore.asRetriever({ k: 3 });

  const relavantChunks = await vectorRerival.invoke(userQuery);

  const system_prompt = `
    
    You are an expert in answring user query based on the provided context about document.

    Do not answer anything beyond what is not provided.

    Always also answer the user in short and tell on which page number that content is available and also name of the book.

    Context:
     ${JSON.stringify(relavantChunks)}
    
    `;

  const llmResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: system_prompt,
      },
      { role: "user", content: userQuery },
    ],
  });

  console.log(`Response: `, llmResponse.choices[0].message.content);
}

query("how to make http request in nodejs");
