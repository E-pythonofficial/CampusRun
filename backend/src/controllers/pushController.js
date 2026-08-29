import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const savePushToken = async(req,res)=>{

 try{
  
  const {token}=req.user.id;
  const {token}=req.body;
  
  await prisma.pushToken.upsert({
   where:{
     token
   },
   update:{
     userId:req.user.id
   },
   create:{
     token,
     userId:req.user.id
   }
 });
 
 
 res.json({
  message:"Push token saved"
 });

 }catch(error){

 res.status(500).json({
   message:error.message
 });

 }

};