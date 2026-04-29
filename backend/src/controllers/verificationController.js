// BACKEND: controllers/verificationController.js
import {
  RekognitionClient,
  CompareFacesCommand,
  DetectFacesCommand,
  DetectModerationLabelsCommand,
} from '@aws-sdk/client-rekognition';
import { PrismaClient } from '@prisma/client';
import { uploadDispatcherDocs } from '../lib/cloudinary.js';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

const rekognition = new RekognitionClient({
  region:      process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ── Helper: download image URL as Buffer ──────────────────────────────────────
const urlToBuffer = async (url) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

// ── Main verification function ────────────────────────────────────────────────
export const verifyDispatcherDocuments = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.idCardUrl || !user?.selfieUrl) {
      return res.status(400).json({ message: 'ID card and selfie URLs missing' });
    }

    // Download both images as buffers for Rekognition
    const [idCardBuffer, selfieBuffer] = await Promise.all([
      urlToBuffer(user.idCardUrl),
      urlToBuffer(user.selfieUrl),
    ]);

    // ── CHECK 1: Detect face on ID card ──────────────────────────────────────
    const idFaceResult = await rekognition.send(new DetectFacesCommand({
      Image: { Bytes: idCardBuffer },
      Attributes: ['DEFAULT'],
    }));

    const idHasFace = idFaceResult.FaceDetails?.length > 0;

    // ── CHECK 2: Detect face on selfie ───────────────────────────────────────
    const selfieFaceResult = await rekognition.send(new DetectFacesCommand({
      Image: { Bytes: selfieBuffer },
      Attributes: ['DEFAULT'],
    }));

    const selfieHasFace    = selfieFaceResult.FaceDetails?.length > 0;
    const selfieConfidence = selfieFaceResult.FaceDetails?.[0]?.Confidence ?? 0;

    // ── CHECK 3: Compare faces (ID card vs selfie) ────────────────────────────
    let faceMatchScore  = 0;
    let facesMatch      = false;

    if (idHasFace && selfieHasFace) {
      const compareResult = await rekognition.send(new CompareFacesCommand({
        SourceImage: { Bytes: selfieBuffer },  // selfie is source
        TargetImage: { Bytes: idCardBuffer },  // ID card is target
        SimilarityThreshold: 70,
      }));

      if (compareResult.FaceMatches?.length > 0) {
        faceMatchScore = compareResult.FaceMatches[0].Similarity ?? 0;
        facesMatch     = faceMatchScore >= 80; // 80% similarity threshold
      }
    }

    // ── CHECK 4: Moderation check on selfie (detect fake/inappropriate) ───────
    const moderationResult = await rekognition.send(new DetectModerationLabelsCommand({
      Image: { Bytes: selfieBuffer },
      MinConfidence: 60,
    }));

    const isFlagged = (moderationResult.ModerationLabels?.length ?? 0) > 0;

    // ── Decision logic ────────────────────────────────────────────────────────
    const passed = idHasFace && selfieHasFace && facesMatch && !isFlagged;

    // Save results to DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiIdCardReal:       idHasFace,
        aiFaceMatchScore:   faceMatchScore / 100, // normalize to 0-1
        aiVerificationFlag: isFlagged || !passed,
        applicationStatus:  passed ? 'PENDING_REVIEW' : 'REJECTED',
      },
    });

    return res.status(200).json({
      passed,
      idHasFace,
      selfieHasFace,
      facesMatch,
      faceMatchScore: Math.round(faceMatchScore),
      isFlagged,
      message: passed
        ? 'Verification passed. Application under review.'
        : !idHasFace
          ? 'No face detected on ID card. Please resubmit.'
          : !selfieHasFace
            ? 'No face detected in selfie. Please retake.'
            : !facesMatch
              ? 'Face on ID card does not match selfie.'
              : 'Documents flagged. Please resubmit.',
    });

  } catch (error) {
    console.error('Rekognition Error:', error.message);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// ── Handle file upload + save URLs to DB ──────────────────────────────────────
export const uploadDocuments = (req, res) => {
  uploadDispatcherDocs(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { userId } = req.body;
      const idCardUrl  = req.files?.idCard?.[0]?.path;   // Cloudinary URL
      const selfieUrl  = req.files?.selfie?.[0]?.path;   // Cloudinary URL

      if (!idCardUrl || !selfieUrl) {
        return res.status(400).json({ message: 'Both ID card and selfie are required' });
      }

      // Save URLs to DB — actual files live in Cloudinary
      await prisma.user.update({
        where: { id: userId },
        data: { idCardUrl, selfieUrl },
      });

      return res.status(200).json({
        message:    'Files uploaded successfully',
        idCardUrl,
        selfieUrl,
      });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
};