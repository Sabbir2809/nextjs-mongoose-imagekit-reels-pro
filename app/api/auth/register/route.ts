import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          status: 409,
          error: "User already exists!",
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Create new user
    await User.create({ email, password });

    return NextResponse.json(
      {
        success: true,
        status: 201,
        message: "User registered successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User Registration Error:", error);

    return NextResponse.json(
      {
        success: false,
        status: 500,
        error: "Failed to register user.",
      },
      { status: 500 }
    );
  }
}
