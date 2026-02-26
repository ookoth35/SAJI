import axios from "axios";

interface MpesaTokenResponse {
  access_token: string;
  expires_in: number;
}

interface MpesaInitializeResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

const MPESA_BASE_URL = "https://sandbox.safaricom.co.ke"; // Use production URL for live
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const SHORTCODE = process.env.MPESA_SHORTCODE || "";
const PASSKEY = process.env.MPESA_PASSKEY || "";
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Get M-Pesa Access Token
export async function getMpesaAccessToken(): Promise<string> {
  try {
    // Return cached token if still valid
    if (cachedToken && tokenExpiry > Date.now()) {
      console.log("Using cached M-Pesa token");
      return cachedToken;
    }

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
      "base64"
    );

    const response = await axios.get<MpesaTokenResponse>(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000; // Refresh 1 min before expiry

    console.log("M-Pesa access token generated");
    return cachedToken;
  } catch (error) {
    console.error("Error getting M-Pesa token:", error);
    throw new Error("Failed to get M-Pesa access token");
  }
}

// Initialize M-Pesa STK Push
export async function initializeMpesaPayment(
  phoneNumber: string,
  amount: number,
  bookingId: string,
  accountReference: string
): Promise<MpesaInitializeResponse> {
  try {
    const token = await getMpesaAccessToken();

    // Generate timestamp in format: YYYYMMDDHHmmss
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);

    // Generate password: base64(shortcode + passkey + timestamp)
    const password = Buffer.from(
      `${SHORTCODE}${PASSKEY}${timestamp}`
    ).toString("base64");

    // Normalize phone number to Safaricom format
    const normalizedPhone = phoneNumber.startsWith("254")
      ? phoneNumber
      : "254" + phoneNumber.slice(-9);

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount), // M-Pesa requires whole numbers
      PartyA: normalizedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: `Booking ${bookingId}`,
    };

    console.log(" M-Pesa payload:", {
      ...payload,
      Password: "***", // Don't log password
    });

    const response = await axios.post<MpesaInitializeResponse>(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("M-Pesa STK push initiated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error initializing M-Pesa payment:", error);
    throw new Error("Failed to initialize M-Pesa payment");
  }
}

// Query M-Pesa transaction status
export async function queryMpesaStatus(
  businessShortCode: string,
  checkoutRequestId: string
): Promise<any> {
  try {
    const token = await getMpesaAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `${businessShortCode}${PASSKEY}${timestamp}`
    ).toString("base64");

    const payload = {
      BusinessShortCode: businessShortCode,
      CheckoutRequestID: checkoutRequestId,
      Password: password,
      Timestamp: timestamp,
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("M-Pesa status query result:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error querying M-Pesa status:", error);
    throw new Error("Failed to query M-Pesa status");
  }
}

// Process M-Pesa callback
export function processMpesaCallback(
  callbackData: MpesaCallbackData
): { success: boolean; message: string; mpesaCode?: string } {
  try {
    const { stkCallback } = callbackData.Body;

    if (stkCallback.ResultCode !== 0) {
      return {
        success: false,
        message: stkCallback.ResultDesc || "Payment failed",
      };
    }

    // Extract M-Pesa receipt code
    const items = stkCallback.CallbackMetadata?.Item || [];
    const mpesaReceiptItem = items.find((item) => item.Name === "MpesaReceiptNumber");
    const mpesaCode = mpesaReceiptItem?.Value as string;

    console.log("M-Pesa payment successful. Receipt:", mpesaCode);

    return {
      success: true,
      message: "Payment successful",
      mpesaCode,
    };
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error);
    return {
      success: false,
      message: "Error processing callback",
    };
  }
}
