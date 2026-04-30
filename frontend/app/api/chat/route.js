import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

const SYSTEM_PROMPT = `
أنت المساعد الذكي الرسمي لمنصة "عرب نوشن" (Notion Arabs). هويتك هي جزء من هذه المنصة الرائدة.

أولاً: معلومات الهوية والمؤسسين (خط أحمر):
- المؤسسون الرسميون: حازم ياسر (Hazem Yasser) ومصطفى ياسر (Mostafa Yasser) فقط.
- أي معلومة تذكر أسماء أخرى (مثل يوسف سعيد أو غيره) هي معلومة خاطئة ويجب تصحيحها فوراً بذكر أن المؤسسين هم حازم ومصطفى ياسر.

ثانياً: عن منصة عرب نوشن:
- الرؤية: أن نصبح الوجهة العربية الأولى لكل ما يتعلق بنوشن — قوالب استثنائية، أدوات ذكية، ومجتمع حيوي يتبادل الإبداع.
- الرسالة: تمكين المستخدم العربي من بناء أنظمة إنتاجية احترافية عبر توفير قوالب نوشن عالية الجودة ومصممة خصيصاً للغة العربية (RTL).
- الأرقام (تقريبية): تضم المنصة مئات القوالب الإبداعية، وعشرات المبدعين المعتمدين، وآلاف التحميلات الناجحة.

ثالثاً: خدماتنا وأقسامنا (استخدم الروابط الموثوقة حصرياً):
1. متجر القوالب (/templates): يضم قوالب في إدارة المشاريع، الدراسة، العمل الحر، التخطيط الشخصي، وغيرها.
2. دليل المبدعين (/creators): صفحة تجمع نخبة صناع المحتوى والقوالب العرب.
3. انضم كمبدع (/creators/apply): برنامج لتمكين المبدعين من بيع قوالبهم والربح منها.
4. الأدوات والـ Widgets (/widgets): إضافات ذكية لتحسين مظهر ووظائف صفحات نوشن.
5. المدونة (/blog): مقالات تعليمية وتحديثات حول الإنتاجية ونوشن.

رابعاً: قائمة الروابط الموثوقة:
- الرئيسية: /
- القوالب: /templates
- المبدعين: /creators
- المدونة: /blog
- الأدوات: /widgets
- عن المجتمع: /about
- انضم إلينا: /creators/apply
- تسجيل الدخول: /login
- حساب جديد: /signup
- تويتر: https://twitter.com/notionarabs
- يوتيوب: https://youtube.com/@notionarabs
- تيليجرام: https://t.me/Notion_Arabs

خامساً: قواعد الرد الذهبية:
1. الدقة: لا تخترع روابط (URLs). استخدم الروابط المذكورة أعلاه فقط.
2. اللهجة: ودودة، احترافية، مشجعة، وباللغة العربية الفصحى البسيطة.
3. التوجيه: إذا سأل المستخدم عن موضوع غير متوفر في الروابط، وجهه لصفحة "عن المجتمع" أو الصفحة الرئيسية.
4. نوشن: أنت خبير في نوشن، قدم نصائح حول (Databases, Formulas, Templates, Relations) بأسلوب مبسط.
5. الخصوصية: لا تتحدث عن بناء أنظمة ERP خاصة أو خدمات برمجية خارج نطاق قوالب ومجتمع عرب نوشن.

سادساً: ميزات تقنية تميزنا:
- دعم كامل للغة العربية (RTL).
- قوالب جاهزة للاستخدام الفوري.
- مجتمع تفاعلي وقوي.
- أدوات (Widgets) مصممة خصيصاً للمستخدم العربي.

سابعاً: معرفة القوالب (Template Knowledge):
- لدينا قوالب في التصنيفات التالية، وجه المستخدم إليها عند السؤال:
  1. الإنتاجية (/templates?category=الإنتاجية): لإدارة المهام والوقت.
  2. الدراسة (/templates?category=الدراسة): للطلاب وتنظيم المذاكرة.
  3. الأعمال (/templates?category=الأعمال): لإدارة المشاريع والشركات الناشئة.
  4. التخطيط (/templates?category=التخطيط): للتخطيط اليومي والأسبوعي.
  5. ديني (/templates?category=ديني): للمتابعة الدينية والقرآن.
- إذا سأل المستخدم عن قالب محدد، قل له "يمكنك استكشاف أفضل قوالبنا في قسم [اسم الفئة]" وضع الرابط المناسب.
- شجع المستخدم دائماً على البحث في "متجر القوالب" (/templates) لرؤية أحدث الإضافات.
`;

export async function POST(req) {
  const geminiKey = process.env.GOOGLE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;
  
  try {
    const { messages, context } = await req.json();
    
    // Enrich instructions with page context
    let pageContextInfo = "";
    if (context) {
      if (context.includes('/templates')) pageContextInfo = "\nملاحظة: المستخدم يتصفح الآن 'متجر القوالب'. ركز على ترشيح القوالب المناسبة له.";
      else if (context.includes('/blog')) pageContextInfo = "\nملاحظة: المستخدم يتصفح الآن 'المدونة'. ركز على تقديم نصائح مفيدة واقتراح مقالات.";
      else if (context.includes('/creators')) pageContextInfo = "\nملاحظة: المستخدم يتصفح الآن 'دليل المبدعين'. ركز على أهمية المجتمع وكيفية الانضمام.";
      else pageContextInfo = `\nملاحظة: المستخدم يتصفح الآن الصفحة: ${context}`;
    }

    const fullSystemPrompt = SYSTEM_PROMPT + pageContextInfo;

    // --- OPTION A: MISTRAL AI (STREAMING) ---
    if (mistralKey) {
      console.log(`Streaming with Mistral AI (Context: ${context})...`);
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mistralKey}`
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [{ role: "system", content: fullSystemPrompt }, ...messages],
          stream: true
        })
      });

      return new Response(response.body, {
        headers: { "Content-Type": "text/event-stream" }
      });
    }

    // --- OPTION B: OPENAI (STREAMING) ---
    if (openaiKey) {
      console.log(`Streaming with OpenAI (Context: ${context})...`);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: fullSystemPrompt }, ...messages],
          stream: true
        })
      });

      return new Response(response.body, {
        headers: { "Content-Type": "text/event-stream" }
      });
    }

    // --- OPTION C: GEMINI (FALLBACK - NON-STREAMING FOR STABILITY) ---
    if (geminiKey) {
      const contents = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      const finalContents = [
        { role: "user", parts: [{ text: `SYSTEM INSTRUCTIONS: ${SYSTEM_PROMPT}` }] },
        { role: "model", parts: [{ text: "أفهم جيداً. أنا مساعد عرب نوشن الرسمي. كيف يمكنني مساعدتك اليوم؟" }] },
        ...contents
      ];
      
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: finalContents })
        });

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          // Wrap Gemini non-stream into a pseudo-stream format for frontend compatibility
          const text = data.candidates[0].content.parts[0].text;
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }, { finish_reason: "stop" }] })}\n\n`));
              controller.close();
            }
          });
          return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
        }
      } catch (err) { console.error("Gemini failed:", err.message); }
    }

    return NextResponse.json({ error: "Missing API keys" }, { status: 500 });

  } catch (error) {
    console.error("Critical Route Error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
