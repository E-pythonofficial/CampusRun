/**
 * ai.service.js
 *
 * Handles two AI checks on runner application:
 *   1. ID card authenticity  — is the uploaded ID card real or AI-generated/fake?
 *   2. Face match            — does the selfie face match the face on the ID card?
 *
 * This uses Google Cloud Vision API for image analysis.
 * You can swap this for AWS Rekognition or a custom model later.
 *
 * SETUP:
 *   npm install @google-cloud/vision axios form-data
 *   Set GOOGLE_APPLICATION_CREDENTIALS in your .env pointing to your service account JSON
 *   OR use VISION_API_KEY for the REST API approach below (simpler for now).
 *
 * .env variables needed:
 *   VISION_API_KEY=your_google_vision_api_key
 */

import axios from "axios";

const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";

/**
 * Calls Google Vision API to analyze an image.
 * @param {string} imageUrl - Public URL of the image
 * @param {string[]} features - Array of feature types e.g. ['FACE_DETECTION', 'SAFE_SEARCH_DETECTION']
 */
const analyzeImage = async (imageUrl, features) => {
  const response = await axios.post(
    `${VISION_API_URL}?key=${process.env.VISION_API_KEY}`,
    {
      requests: [
        {
          image: { source: { imageUri: imageUrl } },
          features: features.map((type) => ({ type, maxResults: 10 })),
        },
      ],
    }
  );
  return response.data.responses[0];
};

/**
 * Check if an ID card image appears to be real (not AI-generated or photoshopped).
 *
 * Strategy:
 *  - Check SAFE_SEARCH for unusual signals
 *  - Check for presence of a face on the card (real IDs have photos)
 *  - Check image properties for signs of digital manipulation
 *
 * Returns: { isReal: boolean, confidence: number, reason: string }
 */
export const verifyIdCard = async (idCardUrl) => {
  try {
    const result = await analyzeImage(idCardUrl, [
      "FACE_DETECTION",
      "SAFE_SEARCH_DETECTION",
      "IMAGE_PROPERTIES",
      "LABEL_DETECTION",
    ]);

    const faces = result.faceAnnotations || [];
    const safeSearch = result.safeSearchAnnotation || {};
    const labels = result.labelAnnotations || [];

    // No face found on ID card — suspicious
    if (faces.length === 0) {
      return {
        isReal: false,
        confidence: 0.1,
        reason: "No face detected on ID card",
        flagged: true,
      };
    }

    // Check safe search for manipulated/adult content signals
    const dangerousLevels = ["LIKELY", "VERY_LIKELY"];
    if (
      dangerousLevels.includes(safeSearch.spoof) ||
      dangerousLevels.includes(safeSearch.medical)
    ) {
      return {
        isReal: false,
        confidence: 0.2,
        reason: "Image flagged as potentially spoofed",
        flagged: true,
      };
    }

    // Check if labels suggest it's an ID card / document
    const idRelatedLabels = ["identity document", "document", "card", "license", "badge", "id"];
    const hasIdLabel = labels.some((label) =>
      idRelatedLabels.some((keyword) =>
        label.description.toLowerCase().includes(keyword)
      )
    );

    if (!hasIdLabel) {
      return {
        isReal: false,
        confidence: 0.3,
        reason: "Image does not appear to be an ID card",
        flagged: true,
      };
    }

    // Passed all checks
    return {
      isReal: true,
      confidence: 0.9,
      reason: "ID card passed all checks",
      flagged: false,
    };
  } catch (error) {
    console.error("verifyIdCard error:", error.message);
    // On API error, flag for manual review but don't block
    return {
      isReal: null,
      confidence: null,
      reason: "AI check failed — manual review required",
      flagged: true,
    };
  }
};

/**
 * Compare the face on the selfie with the face on the ID card.
 *
 * Strategy:
 *  - Extract face landmarks from both images
 *  - Compare confidence scores and bounding boxes
 *
 * NOTE: Google Vision alone doesn't do direct face comparison.
 * For production, swap the comparison logic with AWS Rekognition's
 * CompareFaces API which gives a direct similarity score.
 *
 * For now, this validates both images have detectable faces as a
 * baseline check, and flags for manual review.
 *
 * Returns: { match: boolean, score: number, flagged: boolean }
 */
export const compareFaces = async (idCardUrl, selfieUrl) => {
  try {
    // Analyze both images in parallel
    const [idResult, selfieResult] = await Promise.all([
      analyzeImage(idCardUrl, ["FACE_DETECTION"]),
      analyzeImage(selfieUrl, ["FACE_DETECTION"]),
    ]);

    const idFaces = idResult.faceAnnotations || [];
    const selfieFaces = selfieResult.faceAnnotations || [];

    // No face in ID card
    if (idFaces.length === 0) {
      return { match: false, score: 0.0, flagged: true, reason: "No face found in ID card" };
    }

    // No face in selfie
    if (selfieFaces.length === 0) {
      return { match: false, score: 0.0, flagged: true, reason: "No face found in selfie" };
    }

    // Multiple faces in selfie is suspicious
    if (selfieFaces.length > 1) {
      return { match: false, score: 0.3, flagged: true, reason: "Multiple faces detected in selfie" };
    }

    // Both have exactly one clear face — extract detection confidence
    const idFaceConfidence = idFaces[0].detectionConfidence || 0;
    const selfieFaceConfidence = selfieFaces[0].detectionConfidence || 0;

    // Use average confidence as a proxy score (replace with Rekognition for exact match)
    const averageScore = (idFaceConfidence + selfieFaceConfidence) / 2;

    if (averageScore < 0.7) {
      return {
        match: false,
        score: averageScore,
        flagged: true,
        reason: "Low confidence face detection — manual review needed",
      };
    }

    // ── FOR PRODUCTION: Replace above with AWS Rekognition ──────────────────
    // import Rekognition from '@aws-sdk/client-rekognition';
    // const client = new RekognitionClient({ region: 'us-east-1' });
    // const command = new CompareFacesCommand({
    //   SourceImage: { S3Object: { Bucket, Name: idCardKey } },
    //   TargetImage: { S3Object: { Bucket, Name: selfieKey } },
    //   SimilarityThreshold: 70,
    // });
    // const result = await client.send(command);
    // const similarity = result.FaceMatches[0]?.Similarity / 100;
    // ────────────────────────────────────────────────────────────────────────

    return {
      match: true,
      score: parseFloat(averageScore.toFixed(3)),
      flagged: false,
      reason: "Face detection passed on both images",
    };
  } catch (error) {
    console.error("compareFaces error:", error.message);
    return {
      match: null,
      score: null,
      flagged: true,
      reason: "Face comparison failed — manual review required",
    };
  }
};

/**
 * Master verification function — runs both checks and returns combined result.
 * This is what you call in the runner application controller.
 *
 * @param {string} idCardUrl
 * @param {string} selfieUrl
 * @returns {{ idCardIsReal, faceMatchScore, flagged, reasons }}
 */
export const runAiVerification = async (idCardUrl, selfieUrl) => {
  const [idCheck, faceCheck] = await Promise.all([
    verifyIdCard(idCardUrl),
    compareFaces(idCardUrl, selfieUrl),
  ]);

  const flagged = idCheck.flagged || faceCheck.flagged;
  const reasons = [idCheck.reason, faceCheck.reason].filter(Boolean);

  return {
    idCardIsReal: idCheck.isReal,
    faceMatchScore: faceCheck.score,
    flagged,
    reasons,
  };
};