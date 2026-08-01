import { invokeLLM } from "./_core/llm";

/**
 * دالة لحل رمز التحقق (Captcha) تلقائياً باستخدام نموذج رؤية (Vision Model)
 * @param base64Image الصورة بصيغة base64
 * @returns الرمز المستخرج كنص
 */
export async function solveCaptcha(base64Image: string): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the digits from this captcha image. Output ONLY the numbers, no spaces or extra text."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "text" }
    });

    const result = response.choices[0].message.content;
    if (typeof result === "string") {
      // تنظيف النتيجة من أي أحرف غير رقمية
      return result.replace(/\D/g, "");
    }
    return "";
  } catch (error) {
    console.error("[CaptchaSolver] Error solving captcha:", error);
    return "";
  }
}
