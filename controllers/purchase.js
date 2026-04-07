import { google } from "googleapis";
import { User } from "../models.js";
import { Purchase } from "../models.js";

const PRODUCT_CREDITS = {
  credits_10: 10,
  credits_50: 50,
  credits_100: 100,
  credits_500: 500,
};

const PACKAGE_NAME = "com.dk_video_ai";

let cachedAuthClient = null;

async function getPlayVerifier() {
  if (cachedAuthClient) return cachedAuthClient;

  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) return null;

  const credentials = JSON.parse(serviceAccountKey);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });

  cachedAuthClient = google.androidpublisher({
    version: "v3",
    auth: await auth.getClient(),
  });
  return cachedAuthClient;
}

export const verifyPurchase = async (req, res) => {
  try {
    const { userId, productId, purchaseToken, orderId } = req.body;

    if (!userId || !productId || !purchaseToken) {
      return res.status(400).json({
        success: false,
        message: "userId, productId, and purchaseToken are required",
      });
    }

    const credits = PRODUCT_CREDITS[productId];
    if (!credits) {
      return res.status(400).json({
        success: false,
        message: `Unknown product: ${productId}`,
      });
    }

    const existing = await Purchase.findOne({ purchase_token: purchaseToken });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This purchase has already been processed",
      });
    }

    let verified = false;
    const publisher = await getPlayVerifier();

    if (publisher) {
      try {
        const result = await publisher.purchases.products.get({
          packageName: PACKAGE_NAME,
          productId,
          token: purchaseToken,
        });

        const { purchaseState, acknowledgementState } = result.data;
        if (purchaseState !== 0) {
          return res.status(400).json({
            success: false,
            message: "Purchase is not in a valid state",
          });
        }

        if (acknowledgementState === 0) {
          await publisher.purchases.products.acknowledge({
            packageName: PACKAGE_NAME,
            productId,
            token: purchaseToken,
          });
        }

        verified = true;
      } catch (verifyErr) {
        console.error("Google Play verification failed:", verifyErr.message);
        return res.status(400).json({
          success: false,
          message: "Purchase verification failed with Google Play",
        });
      }
    } else {
      console.warn(
        "GOOGLE_SERVICE_ACCOUNT_KEY not set — skipping server-side verification. " +
        "Credits will be granted on trust. Set the env var for production.",
      );
      verified = false;
    }

    await Purchase.create({
      user_id: userId,
      product_id: productId,
      purchase_token: purchaseToken,
      credits_awarded: credits,
      order_id: orderId || null,
      verified,
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: `${credits} credits added`,
      data: user,
    });
  } catch (error) {
    console.error("verifyPurchase error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
