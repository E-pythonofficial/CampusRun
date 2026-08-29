import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

const prisma = new PrismaClient();


router.post('/subscribe', protect, async (req, res) => {

  try {

    const { token } = req.body;


    if (!token) {
      return res.status(400).json({
        message: "Token required"
      });
    }


    await prisma.pushToken.upsert({

      where:{
        token
      },

      update:{
        userId:req.user.id
      },

      create:{
        userId:req.user.id,
        token
      }

    });


    res.json({
      status:"success"
    });


  } catch(error){

    console.error(
      "Push subscribe error:",
      error
    );

    res.status(500).json({
      message:error.message
    });

  }

});


export default router;