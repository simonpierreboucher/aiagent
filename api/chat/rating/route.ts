import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messageId, rating } = body;

    if (!messageId || (rating !== 1 && rating !== -1)) {
      return NextResponse.json(
        { error: "messageId and valid rating (1 or -1) are required" },
        { status: 400 }
      );
    }

    // Find the conversation to verify ownership
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: messageId,
      },
      include: {
        chatbot: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.chatbot.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to rate this message" },
        { status: 403 }
      );
    }

    // Update the rating
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: messageId,
      },
      data: {
        rating,
      },
    });

    return NextResponse.json({
      id: updatedConversation.id,
      rating: updatedConversation.rating,
    });
  } catch (error) {
    console.error("Error rating message:", error);
    return NextResponse.json(
      { error: "An error occurred while rating the message" },
      { status: 500 }
    );
  }
} 