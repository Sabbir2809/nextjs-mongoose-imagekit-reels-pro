import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { IVideo, Video } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find({}).sort({ createdAt: -1 }).lean();
    if (!videos || videos.length === 0) {
      return NextResponse.json({ success: true, data: [], status: 200 });
    }
    return NextResponse.json(
      {
        success: true,
        status: 200,
        data: videos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        error: "Failed to fetch video",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      NextResponse.json(
        {
          success: false,
          status: 401,
          error: "Unauthorized!",
        },
        { status: 401 }
      );
    }
    await connectToDatabase();

    const reqBody: IVideo = await req.json();

    if (
      !reqBody.title ||
      !reqBody.description ||
      !reqBody.videoUrl ||
      !reqBody.thumbnailUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          error: "Messing Required Fields",
        },
        { status: 400 }
      );
    }

    const videoData = {
      ...reqBody,
      controls: reqBody.controls ?? true,
      transformation: {
        height: 1920,
        width: 1080,
        quality: reqBody.transformation?.quality ?? 100,
      },
    };

    const newVideo = await Video.create(videoData);
    return NextResponse.json(
      {
        success: true,
        status: 201,
        message: "Video Created Successfully",
        data: newVideo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        status: 500,
        error: "Failed to create a video",
      },
      { status: 500 }
    );
  }
}
