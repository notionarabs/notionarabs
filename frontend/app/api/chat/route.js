import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getApiUrl } from "../../../lib/apiConfig";

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

    let templateKnowledge = "";
    let templatesList = [];
    
    try {
      const templatesApiUrl = getApiUrl('/templates?limit=15&sortBy=downloads');
      const res = await fetch(templatesApiUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.templates) && data.templates.length > 0) {
          templatesList = data.templates;
        }
      }
    } catch (err) {
      console.error("Failed to fetch templates for AI Chat context:", err.message);
    }

    // Fallback high-quality curated templates if local database is empty
    if (templatesList.length === 0) {
      templatesList = [
        {
          id: "study-tracker-pro",
          title: "قالب تنظيم الدراسة والامتحانات الاحترافي",
          slug: "study-tracker-pro",
          categories: ["الدراسة"],
          isPaid: false,
          price: 0,
          rating: 4.9,
          downloads: 1420,
          previewImage: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600"
        },
        {
          id: "islamic-planner-system",
          title: "نظام المخطط الإسلامي الشامل لحياتك اليومية",
          slug: "islamic-planner-system",
          categories: ["ديني"],
          isPaid: true,
          price: 70,
          rating: 5.0,
          downloads: 850,
          previewImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=600"
        },
        {
          id: "business-operating-os",
          title: "نظام تشغيل الشركات الناشئة وإدارة المشاريع",
          slug: "business-operating-os",
          categories: ["الأعمال"],
          isPaid: true,
          price: 150,
          rating: 4.8,
          downloads: 530,
          previewImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600"
        },
        {
          id: "personal-productivity-dashboard",
          title: "لوحة التحكم الشخصية للإنتاجية والعادات",
          slug: "personal-productivity-dashboard",
          categories: ["الإنتاجية"],
          isPaid: false,
          price: 0,
          rating: 4.7,
          downloads: 2450,
          previewImage: "https://images.unsplash.com/photo-1484480974693-2ca0a72f3a25?auto=format&fit=crop&q=80&w=600"
        }
      ];
    }

    if (templatesList.length > 0) {
      templateKnowledge = "\n\nسابعاً: قائمة القوالب النشطة والواقعية حالياً في قاعدة البيانات (هام جداً):\n";
      templatesList.forEach((t, i) => {
        const priceText = t.isPaid ? `${t.price} ج.م` : 'مجاني';
        const categoriesText = Array.isArray(t.categories) ? t.categories.join(', ') : (t.category || 'عام');
        templateKnowledge += `${i+1}. [${t.title}] - الفئة: ${categoriesText} | السعر: ${priceText} | التقييم: ${t.rating || 0} | التحميلات: ${t.downloads || 0} | المعرف: ${t._id || t.id} | السلوج: ${t.slug || ''} | الرابط: /templates/${t.slug || t._id || t.id} | رابط الصورة: ${t.previewImage || ''}\n`;
      });
      templateKnowledge += `
توجيهات ترشيح القوالب:
عندما يطلب المستخدم ترشيح قالب أو نظام أو يسأل عن كيفية القيام بمهمة معينة تخدمها القوالب المتوفرة، قم باختيار القالب الأنسب له من القائمة أعلاه واقترحه عليه.
بعد كتابة ردك النصي الجميل والمقنع باللغة العربية، يجب عليك دائماً إدراج بطاقة تفاعلية للقالب المرشح باستخدام الصيغة الخاصة التالية بالضبط في سطر منفصل وبدون أي علامات إضافية أو كود برمجى محيط بها:
:::template-recommend{"id": "معرف القالب", "title": "عنوان القالب", "slug": "سلوج القالب", "category": "اسم الفئة الأولى", "price": "السعر النهائي للمستخدم مثل مجاني أو 50 ج.م", "rating": 5, "downloads": 100, "previewImage": "رابط الصورة الخاص بالقالب"}:::

هام:
1. يمكنك إدراج أكثر من بطاقة ترشيح إذا كان هناك أكثر من قالب مناسب، كل بطاقة في سطر منفصل تماماً.
2. يجب كتابة كائن الـ JSON داخل البطاقة بدقة تامة وبدون أي أخطاء، ولا تستخدم كود ماركداون (مثل code block \`\`\`) حول الصيغة الخاصة :::template-recommend...:::. اكتب الصيغة مباشرة في النص كسطر عادي.
3. لا تبتكر قوالب وهمية غير موجودة في القائمة النشطة، وإذا لم تجد قالباً مناسباً، وجهه للمتجر العام باستخدام الرابط /templates.
`;
    }

    const fullSystemPrompt = SYSTEM_PROMPT + pageContextInfo + templateKnowledge;

    // --- OPTION A: MISTRAL AI (STREAMING) ---
    if (mistralKey) {
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

    // --- OPTION C: GEMINI (STREAMING) ---
    if (geminiKey) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: { parts: [{ text: fullSystemPrompt }] }
        });

        // Convert messages to Gemini format (user/model)
        // Note: Gemini requires alternating roles. messages[0] to messages[n-1] as history.
        const history = messages.slice(0, -1).map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }));
        
        const currentMessage = messages[messages.length - 1].content;
        
        const chat = model.startChat({ history });
        const result = await chat.sendMessageStream(currentMessage);
        
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                  // Format to match OpenAI/Mistral format expected by the frontend
                  const data = JSON.stringify({ 
                    choices: [{ delta: { content: chunkText } }] 
                  });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ finish_reason: "stop" }] })}\n\n`));
              controller.close();
            } catch (streamErr) {
              console.error("Gemini stream error:", streamErr);
              controller.error(streamErr);
            }
          }
        });
        
        return new Response(stream, { 
          headers: { "Content-Type": "text/event-stream" } 
        });
      } catch (err) { 
        console.error("Gemini fallback failed:", err.message); 
      }
    }

    return NextResponse.json({ error: "Missing API keys" }, { status: 500 });

  } catch (error) {
    console.error("Critical Route Error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
