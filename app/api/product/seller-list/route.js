import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request){
  try {

    const {userId} = getAuth(request)

    const isSeller =await authSeller(userId)

    if(!isSeller){
      return NextResponse.json({success: false, message: 'not authorized,only sellers can view their products'})
    } 
    await connectDB()
    const products = await Product.find({userId})
    return NextResponse.json({success: true, products})
    
  } catch (error) {
    console.error('Error in GET /api/product/seller-list:', error);  // اضافه کردن لاگ برای دیباگ
    return NextResponse.json({success:false, message: error.message})
    
  }
}