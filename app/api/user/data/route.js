import connectDB from "@/config/db";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request){
  try{
    const {userId} = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized - Please log in' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(userId)

    if(!user){
      return NextResponse.json({success: false, message: 'User not found'}, {status: 404})
    }

    return NextResponse.json({success:true, user}, {status: 200})
  }
  catch(err){
    console.error('Error in GET /api/user/data', err);  // لاگ برای دیباگ (در terminal ببین)
    return NextResponse.json({success: false, message: err.message}, {status: 500})

  }
}