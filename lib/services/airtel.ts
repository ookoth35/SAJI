import axios from "axios";

interface AirtelAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface AirtelPaymentResponse {
  status: string;
  message: string;
  data?: {
    transaction_id: string;
  };
}

const AIRTEL_BASE_URL = "https://openapiuat.airtel.africa"; // Use production URL for live
const CLIENT_ID = process.env.AIRTEL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET || "";
const API_KEY = process.env.AIRTEL_API_KEY || "";
const MERCHANT_ID = process.env.AIRTEL_MERCHANT_ID || "";
const CALLBACK_URL = process.env.AIRTEL_CALLBACK_URL || "";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Get Airtel Auth Token
export async function getAirtelAccessToken(): Promise<string> {
  try {
    // Return cached token if still valid
    if (cachedToken && tokenExpiry > Date.now()) {
      console.log("Using cached Airtel token");
      return cachedToken;
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const response = await axios.post<AirtelAuthResponse>(
      `${AIRTEL_BASE_URL}/auth/oauth2/token`,
      {
        grant_type: "client_credentials",
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;

    console.log("Airtel access token generated");
    return cachedToken;
  } catch (error) {
    console.error("Error getting Airtel token:", error);
    throw new Error("Failed to get Airtel access token");
  }
}

// Initialize Airtel Money Payment
export async function initializeAirtelPayment(
  phoneNumber: string,
  amount: number,
  bookingId: string,
  reference: string
): Promise<AirtelPaymentResponse> {
  try {
    const token = await getAirtelAccessToken();

    // Normalize phone number to Airtel format
    const normalizedPhone = phoneNumber.startsWith("254")
      ? phoneNumber
      : "254" + phoneNumber.slice(-9);

    const payload = {
      reference: reference,
      subscriber: {
        email: "payment@saji.local",
        msisdn: normalizedPhone,
      },
      transaction: {
        amount: amount,
        currency: "KES",
        id: bookingId,
      },
      merchant: {
        email: "merchant@saji.local",
        id: MERCHANT_ID,
      },
      callbacks: {
        failed: CALLBACK_URL,
        successful: CALLBACK_URL,
      },
      pin: API_KEY, // API Key acts as PIN for verification
    };

    console.log("Airtel payment payload:", {
      ...payload,
      pin: "***",
    });

    const response = await axios.post<AirtelPaymentResponse>(
      `${AIRTEL_BASE_URL}/merchant/v2/payments/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
      }
    );

    console.log(" Airtel payment initiated:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ Error initializing Airtel payment:", error);
    throw new Error("Failed to initialize Airtel payment");
  }
}

// Query Airtel Payment Status
export async function queryAirtelPaymentStatus(
  transactionId: string
): Promise<any> {
  try {
    const token = await getAirtelAccessToken();

    const response = await axios.get(
      `${AIRTEL_BASE_URL}/merchant/v2/payments/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Key": API_KEY,
        },
      }
    );

    console.log("Airtel payment status:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error querying Airtel payment status:", error);
    throw new Error("Failed to query Airtel payment status");
  }
}

// Process Airtel Callback
export function processAirtelCallback(callbackData: any): {
  success: boolean;
  message: string;
  transactionId?: string;
} {
  try {
    if (
      callbackData.status === "successful" ||
      callbackData.status === "success"
    ) {
      console.log("Airtel payment successful:", callbackData);
      return {
        success: true,
        message: "Payment successful",
        transactionId: callbackData.transaction?.id,
      };
    }

    return {
      success: false,
      message: callbackData.message || "Payment failed",
    };
  } catch (error) {
    console.error("Error processing Airtel callback:", error);
    return {
      success: false,
      message: "Error processing callback",
    };
  }
}
