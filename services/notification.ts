
/**
 * Notification Service
 * Integrated with OneWaySMS Philippines Gateway & Mailjet API
 */

const ONEWAY_SMS_CONFIG = {
  // Provided Production Credentials
  apiUsername: 'APII3O5F54QHC',
  apiPassword: 'APII3O5F54QHCI3O5F',
  /**
   * SENDER ID:
   * Leave empty to use the system's DEFAULT sender ID.
   */
  senderId: '',
  /**
   * API ENDPOINT:
   * Using the secure 443 port endpoint as requested.
   * Endpoint: https://sgateway.onewaysms.com/apis10.aspx
   */
  baseUrl: 'https://sgateway.onewaysms.com/apis10.aspx'
};

const MAILJET_CONFIG = {
  apiKey: 'dc3a304922a4370b2f2e9d8fbff0ed0d',
  secretKey: 'dd0e882e794b862af5c4ed2c3460d1cb',
  senderEmail: 'aralinkssys.team@phoenix-ph.co',
  senderName: 'SeniorConnect San Juan',
  baseUrl: 'https://api.mailjet.com/v3.1/send'
};

/**
 * Sends an SMS via OneWaySMS Philippines Gateway.
 * Uses a CORS proxy to bypass browser security limitations.
 */
export const sendSMS = async (to: string, message: string) => {
  if (!to || !message) {
    console.error('[OneWaySMS] Missing recipient or message.');
    return false;
  }

  // Normalize phone number (ensure format: 639XXXXXXXXX)
  let cleanNumber = to.replace(/[^0-9]/g, '');
  
  if (cleanNumber.length === 11 && cleanNumber.startsWith('09')) {
    cleanNumber = '63' + cleanNumber.substring(1);
  } else if (cleanNumber.length === 10 && cleanNumber.startsWith('9')) {
    cleanNumber = '63' + cleanNumber;
  } else if (cleanNumber.startsWith('063')) {
    cleanNumber = cleanNumber.substring(1);
  }

  try {
    /**
     * OneWaySMS apis10.aspx specific parameters:
     * - apiusername
     * - apipassword
     * - mobileno
     * - lmsg (Long Message parameter - preferred by apis10.aspx)
     * - mttype (N = Normal/Default)
     * - DR (N = No Delivery Report)
     */
    const queryParams = new URLSearchParams();
    queryParams.append('apiusername', ONEWAY_SMS_CONFIG.apiUsername);
    queryParams.append('apipassword', ONEWAY_SMS_CONFIG.apiPassword);
    queryParams.append('mobileno', cleanNumber);
    queryParams.append('lmsg', message); 
    queryParams.append('mttype', 'N');
    queryParams.append('DR', 'N');
    
    if (ONEWAY_SMS_CONFIG.senderId && ONEWAY_SMS_CONFIG.senderId.trim() !== '') {
      queryParams.append('senderid', ONEWAY_SMS_CONFIG.senderId);
    }

    // Build the final target URL
    const targetUrl = `${ONEWAY_SMS_CONFIG.baseUrl}?${queryParams.toString()}`;
    
    // Use the CORS proxy to reach the gateway
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    console.log(`[OneWaySMS] Dispatching via proxy to ${cleanNumber}...`);
    
    const response = await fetch(proxyUrl, { 
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error(`[OneWaySMS] Proxy HTTP Error: ${response.status}`);
      return false;
    }

    const result = await response.text();
    const trimmedResult = result.trim();
    
    console.log(`[OneWaySMS] Gateway response: "${trimmedResult}"`);

    // If the response is empty, it might be a connectivity or parameter mismatch issue
    if (!trimmedResult) {
      console.warn('[OneWaySMS] Received empty response. Check API balance or IP restriction.');
      return false;
    }

    /**
     * OneWaySMS API Response Logic:
     * Positive integer = Success (MT ID)
     * Negative integer = Error Code
     */
    const resultCode = parseInt(trimmedResult);

    if (!isNaN(resultCode)) {
      if (resultCode > 0) {
        console.log(`[OneWaySMS] Success! Message ID: ${trimmedResult}`);
        return true;
      } else {
        const errorMap: Record<string, string> = {
          "-100": "Invalid Credentials",
          "-200": "Invalid Mobile Number",
          "-300": "Content Error",
          "-400": "Insufficient Credits",
          "-500": "Invalid Sender ID",
          "-600": "System Error / Restricted IP"
        };
        console.error(`[OneWaySMS] Gateway Error: ${errorMap[trimmedResult] || trimmedResult}`);
        return false;
      }
    } else {
      // Fallback for non-numeric success messages
      return trimmedResult.toLowerCase().includes('success');
    }
  } catch (error) {
    console.error('[OneWaySMS] Network Failure:', error);
    return false;
  }
};

/**
 * Sends an Email via Mailjet API V3.1.
 */
export const sendEmail = async (to: string, subject: string, htmlBody: string, toName: string = 'User') => {
  if (!to || !subject || !htmlBody) return false;

  try {
    // Mailjet V3.1 uses Basic Auth (API Key : Secret Key) encoded in Base64
    const auth = btoa(`${MAILJET_CONFIG.apiKey}:${MAILJET_CONFIG.secretKey}`);
    
    const payload = {
      Messages: [
        {
          From: {
            Email: MAILJET_CONFIG.senderEmail,
            Name: MAILJET_CONFIG.senderName
          },
          To: [
            {
              Email: to,
              Name: toName
            }
          ],
          Subject: subject,
          HTMLPart: htmlBody
        }
      ]
    };

    // Proxied POST request to Mailjet
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(MAILJET_CONFIG.baseUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Mailjet] Error Response:', errText);
      return false;
    }

    console.log(`[Mailjet] Email successfully dispatched to ${to}`);
    return true;
  } catch (error) {
    console.error('[Mailjet] Connection Exception:', error);
    return false;
  }
};

/**
 * Generates and sends a 6-digit OTP for mobile verification.
 */
export const sendOTP = async (to: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const message = `SeniorConnect: Your verification code is ${otp}. Valid for 5 minutes.`;
  
  const success = await sendSMS(to, message);
  
  if (success) {
    console.warn(`[OTP-LOG] VERIFICATION CODE GENERATED: ${otp} (for ${to})`);
  }
  
  return success ? otp : null;
};

/**
 * Sends a notification for successful registration.
 */
export const notifyRegistrationSuccess = async (name: string, phone: string, email: string) => {
  // TEMPORARILY DISABLED: SMS notification for registration success is skipped
  // const smsMessage = "Registration Received. Welcome to SeniorConnect San Juan! Your application is now for approval. Thank you.";
  
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="background-color: #dc2626; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -1px;">SeniorConnect</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; font-weight: bold;">San Juan City OSCA Portal</p>
      </div>
      <div style="padding: 40px; color: #334155; line-height: 1.6;">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 24px; font-weight: 800; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">Complete Registration!</h2>
        <p style="font-size: 16px; margin-top: 25px;">Dear <strong>${name}</strong>,</p>
        <p>Mabuhay! We have successfully received your registration application for the Senior Citizen Management System of San Juan City.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0; font-style: italic; color: #475569;">
          "Your application is now being processed by our administrators for verification and approval. We will notify you once your account is active."
        </div>
        <p>You will receive further updates via SMS and Email. Welcome to our community of seniors!</p>
        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; gap: 10px;">
          <div>
            <p style="margin: 0; font-weight: bold; color: #1e293b; font-size: 14px;">The OSCA Team</p>
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">San Juan City Hall, Metro Manila</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // TEMPORARILY DISABLED: Always resolve SMS promise as true without sending
  const smsPromise = Promise.resolve(true); 
  
  // Email notification remains active
  const emailPromise = email ? sendEmail(email, "Complete Registration!", emailHtml, name) : Promise.resolve(true);

  return Promise.allSettled([smsPromise, emailPromise]);
};

/**
 * Orchestrates notifications for application status updates.
 */
export const notifyStatusUpdate = async (userName: string, contact: string, email: string, type: string, status: string, reason?: string) => {
  const statusMsg = status === 'Approved' ? 'APPROVED' : 'DISAPPROVED';
  const reasonMsg = reason ? ` Reason: ${reason}` : '';
  const smsContent = `SC-Portal: Hello ${userName}, your ${type} application was ${statusMsg}.${reasonMsg}`;
  
  if (contact) {
    await sendSMS(contact, smsContent);
  }
  
  if (email) {
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #f1f5f9; border-radius: 10px;">
        <h2 style="color: #dc2626; border-bottom: 1px solid #eee; padding-bottom: 10px;">Application Update</h2>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Your application for <strong>${type}</strong> has been <strong>${statusMsg}</strong>.</p>
        ${reason ? `<div style="background: #fff5f5; border-radius: 6px; padding: 12px; color: #c53030; font-weight: 600;">Reason: ${reason}</div>` : ''}
        <p style="margin-top: 20px;">Please log in to the portal to view more details.</p>
        <p>Thank you,<br><strong>SeniorConnect Team</strong></p>
      </div>
    `;
    await sendEmail(email, `SeniorConnect: ${type} Update`, emailHtml, userName);
  }
};
