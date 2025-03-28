import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { searchVectorStore } from "@/lib/vector-store";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Search for relevant chunks using vector search
async function searchRelevantChunks(chatbotId: string, query: string) {
  try {
    // Use vector store search
    const searchResults = await searchVectorStore(chatbotId, query, 5);
    
    if (searchResults.length === 0) {
      return [];
    }
    
    // Get the full chunks from database
    const chunkIds = searchResults.map(result => result.id);
    const chunks = await prisma.chunk.findMany({
      where: {
        id: {
          in: chunkIds
        }
      },
      include: {
        document: {
          select: {
            filename: true,
          },
        },
      },
    });
    
    // Sort by the same order as search results
    const orderedChunks = chunkIds.map(id => 
      chunks.find(chunk => chunk.id === id)
    ).filter(Boolean);
    
    // Map to the expected format
    return orderedChunks.map(chunk => ({
      id: chunk!.id,
      text: chunk!.chunkText,
      metadata: chunk!.metadata,
      filename: chunk!.document.filename,
      similarity: searchResults.find(r => r.id === chunk!.id)?.similarity || 0
    }));
  } catch (error) {
    console.error("Error searching for relevant chunks:", error);
    return [];
  }
}

// Generate response using OpenAI with RAG context
async function generateResponse(message: string, systemPrompt: string | null | undefined, context: any[]) {
  try {
    // Build the messages array for the OpenAI chat completion
    const messages: ChatCompletionMessageParam[] = [];
    
    // Add system message with prompt and context
    let systemMessage = systemPrompt || "You are a helpful assistant that answers questions based on the provided context.";
    
    if (context.length > 0) {
      systemMessage += "\n\nContext information is below.\n";
      systemMessage += "---------------------\n";
      
      context.forEach((item, index) => {
        systemMessage += `[Document ${index + 1}] ${item.filename}\n${item.text}\n\n`;
      });
      
      systemMessage += "---------------------\n";
      systemMessage += "Given this information, please answer the user's question or respond to their request.";
    } else {
      systemMessage += "\n\nYou don't have specific context for this query. If you don't know the answer, say so clearly.";
    }
    
    messages.push({
      role: "system",
      content: systemMessage,
    });
    
    // Add user message
    messages.push({
      role: "user",
      content: message,
    });
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm sorry, but I encountered an error while processing your request. Please try again.";
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chatbotId, message } = body;

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: "chatbotId and message are required" },
        { status: 400 }
      );
    }

    // Check if the chatbot belongs to the user
    const chatbot = await prisma.chatbot.findUnique({
      where: {
        id: chatbotId,
        userId: session.user.id,
      },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: "Chatbot not found or doesn't belong to the user" },
        { status: 404 }
      );
    }

    // Search for relevant chunks using RAG
    const relevantChunks = await searchRelevantChunks(chatbotId, message);

    // Generate a response using OpenAI
    const response = await generateResponse(
      message,
      chatbot.systemPrompt,
      relevantChunks
    );

    // Save the conversation
    const conversation = await prisma.conversation.create({
      data: {
        userMsg: message,
        botMsg: response,
        chatbotId,
        sourcesUsed: relevantChunks.length > 0 ? relevantChunks : undefined,
      },
    });

    // Return the response
    return NextResponse.json({
      id: conversation.id,
      response,
      sources: relevantChunks.map(chunk => ({
        text: chunk.text.substring(0, 150) + "...",
        filename: chunk.filename,
        sourceId: chunk.id,
        similarity: chunk.similarity,
      })),
    });
  } catch (error) {
    console.error("Error processing chat message:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your message" },
      { status: 500 }
    );
  }
} 