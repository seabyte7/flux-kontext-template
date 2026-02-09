import { Resend } from "resend";
import { WelcomeEmail } from "./templates/welcome";
import { PaymentReceiptEmail } from "./templates/payment-receipt";
import { CreditsLowEmail } from "./templates/credits-low";
import { env } from "@/lib/env";
import { apiLogger } from "@/lib/logger";

// 惰性初始化 Resend 客户端，避免在 RESEND_API_KEY 未配置时模块加载崩溃
let _resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (_resend) return _resend;
  if (!env.RESEND_API_KEY) return null;
  _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

const EMAIL_FROM = env.EMAIL_FROM || "Flux Kontext <noreply@fluxkontext.space>";

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// 发送欢迎邮件
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();
    if (!resend) {
      apiLogger.debug("RESEND_API_KEY not configured, skipping welcome email");
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: "Welcome to Flux Kontext! 🎨",
      react: WelcomeEmail({ name: params.name }),
    });

    if (error) {
      apiLogger.error({ err: error }, "Failed to send welcome email");
      return { success: false, error: error.message };
    }

    apiLogger.info({ to: params.to, id: data?.id }, "Welcome email sent");
    return { success: true, id: data?.id };
  } catch (err) {
    apiLogger.error({ err }, "Error sending welcome email");
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// 发送支付回执邮件
export async function sendPaymentReceiptEmail(params: {
  to: string;
  name: string;
  amount: number;
  currency: string;
  credits: number;
  orderNumber: string;
  paidAt: string;
}): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();
    if (!resend) {
      apiLogger.debug(
        "RESEND_API_KEY not configured, skipping payment receipt email",
      );
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `Payment Confirmed - Order #${params.orderNumber}`,
      react: PaymentReceiptEmail({
        name: params.name,
        amount: params.amount,
        currency: params.currency,
        credits: params.credits,
        orderNumber: params.orderNumber,
        paidAt: params.paidAt,
      }),
    });

    if (error) {
      apiLogger.error({ err: error }, "Failed to send payment receipt email");
      return { success: false, error: error.message };
    }

    apiLogger.info(
      { to: params.to, id: data?.id },
      "Payment receipt email sent",
    );
    return { success: true, id: data?.id };
  } catch (err) {
    apiLogger.error({ err }, "Error sending payment receipt email");
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// 发送积分不足提醒邮件
export async function sendCreditsLowEmail(params: {
  to: string;
  name: string;
  remainingCredits: number;
}): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();
    if (!resend) {
      apiLogger.debug(
        "RESEND_API_KEY not configured, skipping credits low email",
      );
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: "Your Flux Kontext Credits Are Running Low",
      react: CreditsLowEmail({
        name: params.name,
        remainingCredits: params.remainingCredits,
      }),
    });

    if (error) {
      apiLogger.error({ err: error }, "Failed to send credits low email");
      return { success: false, error: error.message };
    }

    apiLogger.info({ to: params.to, id: data?.id }, "Credits low email sent");
    return { success: true, id: data?.id };
  } catch (err) {
    apiLogger.error({ err }, "Error sending credits low email");
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
