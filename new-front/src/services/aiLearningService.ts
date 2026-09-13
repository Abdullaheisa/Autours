/**
 * Autours AI Assistant - Continuous Learning & Persistent Memory Engine
 * نظام التعلم المستمر والذاكرة التراكمية المركزية للمساعد الذكي
 */

export interface UserMemoryProfile {
  userId?: string;
  email?: string;
  name?: string;
  preferredLanguage?: string;
  preferredDialect?: string;
  preferredVehicleType?: string; // 'SUV' | 'Economy' | 'Luxury' | 'Sedan' | '7-Seater'
  preferredTransmission?: 'Automatic' | 'Manual';
  frequentDestinations?: Array<{ name: string; count: number; lastDate: string }>;
  interactionCount: number;
  lastSeen: string;
  notes?: string[];
}

export interface LearnedAliasEntry {
  canonical: string;
  confidence: number;
  lastUpdated: string;
  source: 'user_correction' | 'inferred' | 'slang';
}

export interface AdminRule {
  id: string; // e.g. "R-1", "R-2"
  rule: string;
  addedBy: string;
  date: string;
  category?: string;
  active: boolean;
}

export interface GlobalMemoryState {
  totalConversations: number;
  learnedAliases: Record<string, LearnedAliasEntry>;
  frequentlyAskedTopics: Record<string, number>;
  userProfiles: Record<string, UserMemoryProfile>;
  adminRules: AdminRule[];
  updatedAt: string;
}

const DEFAULT_GLOBAL_MEMORY: GlobalMemoryState = {
  totalConversations: 0,
  learnedAliases: {
    'الجونة': { canonical: 'Hurghada', confidence: 5, lastUpdated: new Date().toISOString(), source: 'slang' },
    'الساحل': { canonical: 'Alexandria', confidence: 4, lastUpdated: new Date().toISOString(), source: 'slang' },
    'صلالة': { canonical: 'Oman', confidence: 5, lastUpdated: new Date().toISOString(), source: 'slang' },
    'بودروم': { canonical: 'Turkey', confidence: 5, lastUpdated: new Date().toISOString(), source: 'slang' },
    'كازا': { canonical: 'Morocco', confidence: 5, lastUpdated: new Date().toISOString(), source: 'slang' },
    'مطار حمد': { canonical: 'Qatar', confidence: 5, lastUpdated: new Date().toISOString(), source: 'slang' },
    'الدوحة': { canonical: 'Qatar', confidence: 5, lastUpdated: new Date().toISOString(), source: 'slang' },
  },
  frequentlyAskedTopics: {
    'free_cancellation': 12,
    'insurance_included': 10,
    'pay_on_pickup': 8,
    'airport_delivery': 15,
  },
  adminRules: [
    {
      id: 'R-1',
      rule: 'تأجير السيارات متاح ومعتمد بالكامل في دولة قطر ومطار حمد الدولي (DOH) مع أفضل الشركات الموردة (مثل SurPrice) وبأسعار منافسة.',
      addedBy: 'Admin',
      date: '2026-09-13',
      active: true,
    },
  ],
  userProfiles: {},
  updatedAt: new Date().toISOString(),
};

// In-Memory Fast Cache
let inMemoryState: GlobalMemoryState = { ...DEFAULT_GLOBAL_MEMORY };
let isLoaded = false;

function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .trim();
}

function getNodeModules() {
  if (typeof window === 'undefined') {
    try {
      const req = eval('require');
      return {
        fs: req('fs'),
        path: req('path'),
      };
    } catch {
      return null;
    }
  }
  return null;
}

function getStorageFilePath(): string | null {
  const node = getNodeModules();
  if (!node) return null;
  try {
    const dataDir = node.path.join(process.cwd(), '.data');
    if (!node.fs.existsSync(dataDir)) {
      try {
        node.fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Ignored in read-only or browser environments
      }
    }
    return node.path.join(dataDir, 'ai_learned_memory.json');
  } catch {
    return null;
  }
}

export function loadGlobalMemory(): GlobalMemoryState {
  if (isLoaded) return inMemoryState;

  const node = getNodeModules();
  if (node) {
    const filePath = getStorageFilePath();
    if (filePath && node.fs.existsSync(filePath)) {
      try {
        const raw = node.fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);

        // Sanitize corrupted aliases
        const aliases = { ...DEFAULT_GLOBAL_MEMORY.learnedAliases, ...(parsed.learnedAliases || {}) };
        if (aliases['دبي'] && aliases['دبي'].canonical === 'دار') {
          delete aliases['دبي'];
        }

        inMemoryState = {
          ...DEFAULT_GLOBAL_MEMORY,
          ...parsed,
          learnedAliases: aliases,
          frequentlyAskedTopics: { ...DEFAULT_GLOBAL_MEMORY.frequentlyAskedTopics, ...(parsed.frequentlyAskedTopics || {}) },
          adminRules: Array.isArray(parsed.adminRules) && parsed.adminRules.length > 0
            ? parsed.adminRules
            : DEFAULT_GLOBAL_MEMORY.adminRules,
          userProfiles: { ...(parsed.userProfiles || {}) },
        };
      } catch (e) {
        console.warn('Failed to parse persistent AI memory file, using defaults:', e);
      }
    }
  }

  isLoaded = true;
  return inMemoryState;
}

export function saveGlobalMemory(state: GlobalMemoryState): void {
  inMemoryState = state;
  const node = getNodeModules();
  if (node) {
    const filePath = getStorageFilePath();
    if (filePath) {
      try {
        node.fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
      } catch (e) {
        console.warn('Could not save AI memory to file:', e);
      }
    }
  }
}

/**
 * Handles Admin Directives & Teaching Commands
 * يتيح للأدمن تدريب الشات بوت وتلقينه القواعد مباشرة عبر المحادثة وتطبيقها فوراً على الجميع
 */
export function handleAdminDirective(
  message: string,
  currentUser?: { name?: string; email?: string; role?: string } | null
): { reply: string; actionButtons?: Array<{ label: string; promptText?: string; url?: string; actionType?: string }> } | null {
  const cleanMsg = message.trim();
  const lowerMsg = cleanMsg.toLowerCase();
  const isEnglish = !/[\u0600-\u06FF]/.test(cleanMsg);

  const isAdmin = Boolean(
    currentUser &&
      (currentUser.role === 'admin' ||
        currentUser.role === 'administrator' ||
        (currentUser.email && currentUser.email.toLowerCase().includes('admin')))
  );

  // ⚡ 0. Check if user is asking how to teach/train the bot ("عاوز اعلمك", "عايز اعلمك", "كيف اعلمك", "how to teach you")
  const isTeachingQuery =
    /(?:عاوز|عايز|اريد|أريد|حابب|نبي|كيف|ازاي|إزاي|طريقة|ودّي|ودي|ابغى|ابغي)\s*(?:اعلمك|أعلمك|ادربك|أدربك|تتعلم|اعطيك\s+قواعد|اضيف\s+قاعدة|أضيف\s+قاعدة|احفظك)/i.test(cleanMsg) ||
    /(?:how\s+to|i\s+want\s+to|can\s+i|how\s+can\s+i)\s*(?:teach|train|instruct|add\s+rules?\s+to)\s*(?:you|the\s+bot|ai)/i.test(cleanMsg) ||
    /^(?:تعليمك|تدريبك|تدريب البوت|تعليم البوت|train bot|teach bot)$/i.test(cleanMsg);

  if (isTeachingQuery) {
    if (!isAdmin) {
      return {
        reply: isEnglish
          ? `🔒 **Admin Access Required**\n\nTo train or teach the AI assistant new platform policies or rules, you must be signed in with an **Admin Account**.\n\n📌 **How an Admin teaches the AI:**\nOnce logged into an Admin account, you can talk to me directly and naturally in English or Arabic without complex syntax. For example:\n- *"From now on, car delivery is free in Dubai"*\n- *"Minimum driver age in Turkey is 21"*\n- *"No bookings allowed without full insurance"*\n\nI will instantly save the rule in central memory and apply it across all customer chats worldwide! 🚗✨`
          : `🔒 **يتطلب حساب مسؤول (Admin)**\n\nلتدريب المساعد الذكي وتلقينه تعليمات وقواعد جديدة للمنصة، يجب أن تكون مسجلاً الدخول بـ **حساب مدير النظام (Admin)**.\n\n📌 **كيف يقوم الأدمن بتعليم المساعد؟**\nبمجرد تسجيل الدخول بحساب الأدمن، يمكنك التحدث معي مباشرة وبطريقة طبيعية تماماً (بالعربية أو الإنجليزية) دون الحاجة لأوامر أو صياغات معقدة، مثل:\n- *"من هنا ورايح التوصيل مجاني في دبي"*\n- *"عمر السائق المسموح في تركيا يبدأ من 21 سنة"*\n- *"لا نقدم تأجير بدون رخصة دولية"*\n\nوسأقوم فوراً بحفظها في الذاكرة المركزية وتطبيقها كقواعد عليا مع جميع العملاء حول العالم! 🚗✨`,
        actionButtons: [
          { label: isEnglish ? '👤 Sign In as Admin' : '👤 تسجيل الدخول كمسؤول', url: '/login', actionType: 'link' },
        ],
      };
    } else {
      return {
        reply: isEnglish
          ? `👋 **Hello Admin!** You can teach me new policies or instructions naturally in English or Arabic at any time.\n\nSimply talk to me normally, for example:\n- *"From now on, free delivery in Dubai"*\n- *"Minimum driver age in Turkey is 21"*\n- *"Our policy is free cancellation up to 24 hours"*\n\nI will immediately record the rule in central memory and enforce it across all customer chats.\n\n💡 To delete a rule anytime, just tell me: *"delete the rule about [topic]"*.`
          : `👋 **أهلاً بك يا أدمن!** يمكنك توجيهي وتعليمي مباشرة وبطريقة طبيعية تماماً (بالعربية أو الإنجليزية) في أي وقت.\n\nفقط تحدث معي بشكل عادي واذكر التعليمات، مثل:\n- *"من هنا ورايح التوصيل مجاني في دبي"*\n- *"التعليمات الجديدة: عمر السائق يبدأ من 21 سنة"*\n- *"ممنوع الحجز بدون فيزا في قطر"*\n\nوسأقوم فوراً بتسجيلها وتطبيقها مع جميع العملاء حول العالم.\n\n💡 ولحذف أي قاعدة لاحقاً، فقط قل لي: *"احذف التعليمات بتاعة [الموضوع]"* أو *"الغى قاعدة كذا"*.`,
        actionButtons: [
          { label: isEnglish ? '📋 View Active Rules' : '📋 عرض القواعد الحالية', promptText: isEnglish ? 'Show rules' : 'اعرض القواعد' },
        ],
      };
    }
  }

  // If not admin, do not process directive commands
  if (!isAdmin) return null;

  const memory = loadGlobalMemory();

  // 1. Show all admin rules ("اعرض القواعد", "قواعد النظام", "show rules")
  if (
    /(?:اعرض|عرض|قائمة|شوف|ما هي|ماهي|قواعد)\s*(?:القواعد|التعليمات|توجيهات الادارة|قواعد الادمن)/i.test(lowerMsg) ||
    lowerMsg === 'قواعد' ||
    lowerMsg === 'قواعد النظام' ||
    lowerMsg === 'rules' ||
    lowerMsg === 'show rules' ||
    lowerMsg === 'list rules'
  ) {
    const rules = memory.adminRules || [];
    if (rules.length === 0) {
      return {
        reply: isEnglish
          ? `📋 **No administrative rules registered yet.**\n\nTo teach the AI a rule, simply talk to me naturally, e.g.:\n> *"From now on, car delivery is free in Dubai"*`
          : `📋 **لا توجد قواعد إدارية مسجلة حالياً.**\n\nلتدريب المساعد وإضافة قاعدة، تحدث معي بشكل طبيعي، مثلاً:\n> *"من هنا ورايح التوصيل مجاني في دبي"*`,
        actionButtons: [
          { label: isEnglish ? '➕ Example: Add Rule' : '➕ مثال إضافة قاعدة', promptText: isEnglish ? 'From now on, car rental in Qatar includes full insurance' : 'من هنا ورايح تأجير السيارات في قطر يشمل التأمين الشامل' },
        ],
      };
    }

    const rulesList = rules
      .map(
        (r, idx) =>
          `${idx + 1}. **[#${r.id}]**: ${r.rule}\n   👤 *${isEnglish ? 'Added by' : 'أضيفت بواسطة'}: ${r.addedBy} - ${r.date}*`
      )
      .join('\n\n');

    return {
      reply: isEnglish
        ? `📋 **Active System Admin Directives Enforced Globally (${rules.length} rules):**\n\n${rulesList}\n\n━━━━━━━━━━━━━━━\n💡 **To add a new rule:** Speak naturally, e.g. \`From now on, [rule]\`\n💡 **To delete a rule:** Say \`delete rule #${rules[0]?.id}\` or \`delete rule about [topic]\``
        : `📋 **قواعد وتوجيهات إدارة النظام المعتمدة المطبقة على جميع العملاء (${rules.length} قواعد):**\n\n${rulesList}\n\n━━━━━━━━━━━━━━━\n💡 **لإضافة قاعدة جديدة:** تحدث معي بشكل طبيعي، مثلاً: \`من هنا ورايح [القاعدة]\`\n💡 **لحذف قاعدة:** قل \`احذف قاعدة #${rules[0]?.id}\` أو \`احذف التعليمات بتاعة [الموضوع]\``,
      actionButtons: rules.slice(0, 3).map((r) => ({
        label: isEnglish ? `🗑️ Delete #${r.id}` : `🗑️ حذف #${r.id}`,
        promptText: isEnglish ? `delete rule #${r.id}` : `احذف قاعدة #${r.id}`,
      })),
    };
  }

  // 2. Clear all rules ("مسح جميع القواعد", "clear all rules")
  if (
    lowerMsg === 'مسح جميع القواعد' ||
    lowerMsg === 'امسح كل القواعد' ||
    lowerMsg === 'clear all rules'
  ) {
    memory.adminRules = [];
    saveGlobalMemory(memory);
    return {
      reply: isEnglish
        ? `🗑️ **All administrative rules cleared.** AI memory is now reset.`
        : `🗑️ **تم مسح جميع القواعد الإدارية بنجاح.** الذاكرة الإدارية أصبحت فارغة الآن.`,
    };
  }

  // 3. Smart Rule Deletion (By ID, By Keyword, By Description, By Subject)
  // الصيغ المدعومة بمرونة تامة:
  // - "الغى التعليمات ال اديتهالك بتاع مفيش"
  // - "الغي التعليمات اللي قولتهالك عن عمر السائق"
  // - "احذف قاعدة R-1"
  // - "احذف قاعدة قطر والتوصيل"
  // - "امسح اللي قولتهولك عن الفنادق"
  // - "امسح قاعدة التوصيل المجاني"
  // - "انسى موضوع سن 23 سنة"
  // - "delete rule qatar delivery"
  // - "cancel the instructions about no visa"
  const deleteDirectiveMatch =
    cleanMsg.match(
      /^(?:احذف|امسح|إلغاء|الغاء|حذف|شيل|انسى|الغِ|الغ|الغي|الغى|كنسل|delete|remove|forget|cancel)\s+(?:القاعدة|قاعدة|المعلومة|معلومة|التوجيهات|التعليمات|توجيهات|تعليمات|القواعد|قواعد)?\s*(?:اللي\s+قولتهولك|اللي\s+قولته|اللي\s+قلته|ال\s+اديتهالك|اللي\s+اديتهالك|كلامي|اللي\s+اتعلمته|rule|instructions?|directives?|what\s+i\s+told\s+you)?\s*(?:عن|في|بخصوص|بتاعت|بتاعة|بتاع|الخاصة\s+بـ|الخاصة\s+ب|رقم|about)?\s*[:：\-]?\s*([\s\S]+)$/i
    ) ||
    cleanMsg.match(
      /^(?:احذف|امسح|شيل|انسى|الغي|الغى|الغ|الغِ)\s+(?:قاعدة\s+|تعليمات\s+|عن\s+|موضوع\s+)?([\s\S]+)$/i
    ) ||
    cleanMsg.match(
      /^(?:delete|remove|forget|cancel)\s+(?:the\s+)?(?:rule|instruction|directive|what\s+i\s+told\s+you\s+about|about)?\s*[:：\-]?\s*([\s\S]+)$/i
    );

  if (deleteDirectiveMatch) {
    const rawTarget = deleteDirectiveMatch[1].trim();
    const cleanTarget = rawTarget
      .replace(/^(?:قاعدة|القاعدة|المعلومة|معلومة|تعليمات|التعليمات|بتاع|بتاعة|بتاعت|عن|في|about)\s*/i, '')
      .trim();

    // A. Check if user provided an ID (e.g. "R-1", "#R-1", "1")
    let matchedRule: AdminRule | undefined;
    const cleanId = cleanTarget.toUpperCase().replace(/^#/, '');
    matchedRule = (memory.adminRules || []).find(
      (r) => r.id.toUpperCase() === cleanId || r.id.toUpperCase() === `R-${cleanId}`
    );

    // B. Keyword & Substring Search if not matched by ID
    if (!matchedRule && (memory.adminRules || []).length > 0) {
      const normTarget = normalizeText(cleanTarget);
      const stopWords = new Set([
        'عن', 'في', 'من', 'إلى', 'الي', 'على', 'علي', 'بتاعت', 'بتاعة', 'بتاع', 'الخاصة', 'بـ', 'ب',
        'قاعدة', 'القاعدة', 'معلومة', 'المعلومة', 'اللي', 'قولتهولك', 'قولته', 'قلته', 'رقم', 'ده', 'دي',
        'اديتهالك', 'تعليمات', 'التعليمات', 'توجيهات', 'التوجيهات',
        'rule', 'about', 'the', 'of', 'in', 'for', 'instruction'
      ]);

      const searchWords = normTarget
        .split(/\s+/)
        .map((w) => w.replace(/[^\w\u0600-\u06FF]/g, ''))
        .filter((w) => w.length >= 2 && !stopWords.has(w));

      const scoredRules: Array<{ rule: AdminRule; score: number }> = [];

      for (const r of memory.adminRules) {
        const normRule = normalizeText(r.rule);
        let score = 0;

        // Exact full phrase match
        if (normTarget.length >= 2 && normRule.includes(normTarget)) {
          score += 100;
        }

        // Word matches
        for (const word of searchWords) {
          if (normRule.includes(word)) {
            score += 25;
          }
        }

        if (score > 0) {
          scoredRules.push({ rule: r, score });
        }
      }

      // Sort by highest match score
      scoredRules.sort((a, b) => b.score - a.score);

      if (scoredRules.length === 1 || (scoredRules.length > 1 && scoredRules[0].score >= scoredRules[1].score + 40)) {
        matchedRule = scoredRules[0].rule;
      } else if (scoredRules.length > 1) {
        // Multiple close matches -> Ask user to pick the one to delete
        const optionsList = scoredRules
          .slice(0, 4)
          .map((item, idx) => `${idx + 1}. **[#${item.rule.id}]**: ${item.rule.rule}`)
          .join('\n\n');

        return {
          reply: isEnglish
            ? `🔍 **Multiple matching rules found for "${cleanTarget}":**\n\n${optionsList}\n\nPlease click one of the buttons below to confirm which rule to delete:`
            : `🔍 **وجدت أكثر من قاعدة مرتبطة بـ "${cleanTarget}":**\n\n${optionsList}\n\nيرجى تحديد القاعدة المراد حذفها بالضغط على أحد الأزرار أدناه:`,
          actionButtons: scoredRules.slice(0, 4).map((item) => ({
            label: isEnglish ? `🗑️ Delete #${item.rule.id}` : `🗑️ حذف #${item.rule.id}`,
            promptText: isEnglish ? `delete rule #${item.rule.id}` : `احذف قاعدة #${item.rule.id}`,
          })),
        };
      }
    }

    // If matched a rule -> Delete it!
    if (matchedRule) {
      const deletedId = matchedRule.id;
      const deletedText = matchedRule.rule;
      memory.adminRules = (memory.adminRules || []).filter((r) => r.id !== deletedId);
      saveGlobalMemory(memory);

      return {
        reply: isEnglish
          ? `🗑️ **Administrative rule successfully deleted from central AI memory!**\n\n📌 **Deleted Rule [#${deletedId}]:**\n> "${deletedText}"\n\n✨ This directive has been revoked immediately and will no longer apply to customer conversations.`
          : `🗑️ **تم حذف التعليمات الإدارية بنجاح من ذاكرة النظام المركزية!**\n\n📌 **القاعدة المحذوفة [#${deletedId}]:**\n> "${deletedText}"\n\n✨ تم إلغاء العمل بهذه التوجيهات فوراً ولن يتم تطبيقها بعد الآن في محادثات العملاء.`,
        actionButtons: [{ label: isEnglish ? '📋 View Remaining Rules' : '📋 عرض القواعد المتبقية', promptText: isEnglish ? 'Show rules' : 'اعرض القواعد' }],
      };
    } else {
      return {
        reply: isEnglish
          ? `⚠️ No matching rule found for: **"${cleanTarget}"**.\n\n💡 Type **"show rules"** to review the list of active registered rules.`
          : `⚠️ لم أجد أي قاعدة أو تعليمات مسجلة تطابق: **"${cleanTarget}"**.\n\n💡 يمكنك كتابة **"اعرض القواعد"** للاطلاع على قائمة القواعد المسجلة حالياً وتحديدها.`,
        actionButtons: [{ label: isEnglish ? '📋 View Active Rules' : '📋 استعراض القواعد الحالية', promptText: isEnglish ? 'Show rules' : 'اعرض القواعد' }],
      };
    }
  }

  // 4. Add / Teach new rule naturally to AI (Arabic & English Conversational Directives)
  // لا يشترط قول "احفظ عندك:" - يمكن للأدمن التحدث بشكل طبيعي تماماً:
  // - "من هنا ورايح التوصيل مجاني في دبي"
  // - "التعليمات الجديدة عمر السائق 21 سنة"
  // - "قاعدتنا في قطر الدفع بالفيزا فقط"
  // - "عاوزك تعرف ان تأجير السيارات يشمل التأمين الشامل"
  // - "خلي بالك اننا مش بنأجر بدون رخصة دولية"
  // - "لما حد يسألك عن X قوله Y"
  // - "ممنوع تأجير السيارات بدون فيزا"
  // - "From now on, car delivery is free in Dubai"
  // - "New rule: minimum driver age is 21"
  // - "Our policy is free cancellation up to 24 hours"
  // - "Remember that all cars have comprehensive insurance"
  let extractedRule: string | null = null;

  // Pattern A: Common prefixes with or without colon
  const directivePrefixMatch = cleanMsg.match(
    /^(?:احفظ عندك|احفظ|سجل عندك|سجل|ضيف قاعدة|ضيف عندك|قاعدة جديدة|قاعدة|تعليمات جديدة|تعليمات|توجيهات الإدارة|توجيهات|معلومة هامة|معلومة|تعلم|اتعلم|علمتك|admin|learn|rule|instruction|policy)\s*[:：\-]?\s*([\s\S]+)$/i
  );

  // Pattern B: Natural starting phrases ("من هنا ورايح", "التعليمات الجديدة", "من الآن فصاعداً")
  const fromNowOnMatch = cleanMsg.match(
    /^(?:من هنا ورايح|من الآن فصاعداً|من هنا ورايح بقى|من دلوقتي|التعليمات الجديدة|توجيهات الإدارة|السياسة الجديدة|سياستنا|قاعدتنا)\s*[:：\-]?\s*([\s\S]+)$/i
  );

  // Pattern C: "عاوزك تعرف", "خلي بالك", "تذكر دائماً"
  const noticeMatch = cleanMsg.match(
    /^(?:عاوزك|عايزك|ابيك|ودّي|ودي)\s+(?:تعرف|تحفظ|تتعلم|تقول|تفهم)\s+(?:ان|أن|إن)?\s*([\s\S]+)$/i
  ) || cleanMsg.match(
    /^(?:خلي بالك|خلى بالك|خد بالك|انتبه|اعلم|تذكر دائماً|تذكر)\s+(?:ان|أن|إن)?\s*([\s\S]+)$/i
  );

  // Pattern D: Conditional "لما حد يسأل عن X قوله Y"
  const conditionalMatch = cleanMsg.match(
    /^(?:لازم لما|لما|لو|إذا|اذا)\s+(?:حد|العميل|اي عميل|زبون|شخص|واحد)\s+(?:يسألك|يسأل|طلب|يطلب|يستفسر)\s+(?:عن|في|على)?\s*([\s\S]+?)\s+(?:جاوبه|قوله|وضح له|رد عليه|انصحه|تخبره)\s+([\s\S]+)$/i
  );

  // Pattern E: Prohibitions & Strict Policies ("ممنوع ...", "غير مسموح ...", "لا يمكن ...")
  const prohibitionMatch = cleanMsg.match(
    /^(?:ممنوع|غير مسموح|لا يجوز|لا يمكن)\s+([\s\S]+)$/i
  );

  // Pattern F: English natural phrasing ("From now on ...", "New rule ...", "Our policy is ...", "Remember that ...")
  const englishNaturalMatch = cleanMsg.match(
    /^(?:from now on|starting now|new rule|new policy|new instruction|our policy is|our rule is|remember that|keep in mind that|please note that|note that|make sure to)\s*[:：\-]?\s*([\s\S]+)$/i
  );

  const englishConditionalMatch = cleanMsg.match(
    /^(?:when|if)\s+(?:a\s+customer|customers?|anyone|someone)\s+(?:asks?|inquires?)\s+(?:about\s+)?([\s\S]+?)\s+(?:tell them|answer them|reply that)\s+([\s\S]+)$/i
  );

  if (directivePrefixMatch) {
    extractedRule = directivePrefixMatch[1].trim();
  } else if (fromNowOnMatch) {
    extractedRule = fromNowOnMatch[1].trim();
  } else if (noticeMatch) {
    extractedRule = noticeMatch[1].trim();
  } else if (conditionalMatch) {
    extractedRule = `إذا سأل العميل أو استفسر عن (${conditionalMatch[1].trim()})، يجب الرد عليه وتوضيح: (${conditionalMatch[2].trim()})`;
  } else if (prohibitionMatch && prohibitionMatch[1].length >= 8) {
    extractedRule = `ممنوع ${prohibitionMatch[1].trim()}`;
  } else if (englishNaturalMatch) {
    extractedRule = englishNaturalMatch[1].trim();
  } else if (englishConditionalMatch) {
    extractedRule = `When customer asks about (${englishConditionalMatch[1].trim()}), explain: (${englishConditionalMatch[2].trim()})`;
  }

  if (extractedRule) {
    // Clean leading conjunctions
    extractedRule = extractedRule.replace(/^(?:ان|أن|إن|that)\s+/i, '').trim();
  }

  if (extractedRule && extractedRule.length >= 5) {
    const newId = `R-${Date.now().toString().slice(-4)}`;
    const adminName = currentUser?.name || currentUser?.email || 'Admin';
    const todayStr = new Date().toISOString().split('T')[0];

    const newRule: AdminRule = {
      id: newId,
      rule: extractedRule,
      addedBy: adminName,
      date: todayStr,
      active: true,
    };

    if (!Array.isArray(memory.adminRules)) {
      memory.adminRules = [];
    }
    memory.adminRules.push(newRule);
    saveGlobalMemory(memory);

    return {
      reply: isEnglish
        ? `✅ **New Directive Adopted & Saved to Central AI Memory!**\n\n📌 **Rule [#${newId}]:**\n> "${extractedRule}"\n\n✨ **Enforced immediately as a Super Admin Policy** across all customer chats and search sessions worldwide! 🚗✨\n\n💡 To review all rules, type **"show rules"**, or say **"delete the rule about ${extractedRule.slice(0, 25)}..."** to remove it.`
        : `✅ **تم فهم واعتماد التعليمات الجديدة وتثبيتها في ذاكرة النظام!**\n\n📌 **القاعدة المعتمدة [#${newId}]:**\n> "${extractedRule}"\n\n✨ **تم تفعيلها فوراً وتطبيقها كقواعد عليا إلزامية (Super Admin Directives)**، وسألتزم بها في جميع محادثات العملاء والزوار حول العالم! 🚗✨\n\n💡 يمكنك كتابة **"اعرض القواعد"** للمراجعة، أو قول **"احذف التعليمات بتاعة ${extractedRule.slice(0, 25)}..."** لحذفها لاحقاً.`,
      actionButtons: [
        { label: isEnglish ? '📋 View All Rules' : '📋 استعراض كافة القواعد', promptText: isEnglish ? 'Show rules' : 'اعرض القواعد' },
        { label: isEnglish ? `🗑️ Delete Rule #${newId}` : `🗑️ حذف هذه القاعدة (#${newId})`, promptText: isEnglish ? `delete rule #${newId}` : `احذف قاعدة #${newId}` },
      ],
    };
  }

  return null;
}

/**
 * Extracts and updates learned insights from a user interaction turn
 * يجمع خبرات ومصطلحات العملاء ويحفظها في الذاكرة المركزية المشتركة
 */
export function learnFromConversation(params: {
  userMessage: string;
  assistantReply: string;
  currentUser?: { name?: string; email?: string; phone?: string; role?: string; country?: string } | null;
  existingUserMemory?: UserMemoryProfile | null;
}): { updatedUserMemory: UserMemoryProfile; newLearnedAliases: Record<string, string> } {
  const { userMessage, currentUser, existingUserMemory } = params;
  const memory = loadGlobalMemory();

  memory.totalConversations = (memory.totalConversations || 0) + 1;
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Identify User Profile Key (Email, Name, or anonymous session)
  const userKey = currentUser?.email || currentUser?.phone || currentUser?.name || existingUserMemory?.email || 'anonymous';
  let userProfile: UserMemoryProfile = existingUserMemory || memory.userProfiles[userKey] || {
    email: currentUser?.email,
    name: currentUser?.name,
    interactionCount: 0,
    lastSeen: todayStr,
    frequentDestinations: [],
  };

  userProfile.interactionCount = (userProfile.interactionCount || 0) + 1;
  userProfile.lastSeen = todayStr;
  if (currentUser?.name && !userProfile.name) userProfile.name = currentUser.name;
  if (currentUser?.email && !userProfile.email) userProfile.email = currentUser.email;

  const cleanMsg = userMessage.toLowerCase();
  const newAliasesLearned: Record<string, string> = {};

  // 2. Learn User Preferences: Vehicle Types
  if (cleanMsg.includes('suv') || cleanMsg.includes('فور باي فور') || cleanMsg.includes('دفع رباعي') || cleanMsg.includes('جيب') || cleanMsg.includes('عالية')) {
    userProfile.preferredVehicleType = 'SUV';
  } else if (cleanMsg.includes('اقتصادية') || cleanMsg.includes('رخيصة') || cleanMsg.includes('صغيرة') || cleanMsg.includes('economy')) {
    userProfile.preferredVehicleType = 'Economy';
  } else if (cleanMsg.includes('فخمة') || cleanMsg.includes('مرسيدس') || cleanMsg.includes('بي ام') || cleanMsg.includes('luxury') || cleanMsg.includes('vip')) {
    userProfile.preferredVehicleType = 'Luxury';
  } else if (cleanMsg.includes('7 راكب') || cleanMsg.includes('سبعة راكب') || cleanMsg.includes('عائلية') || cleanMsg.includes('family')) {
    userProfile.preferredVehicleType = '7-Seater Family';
  }

  // 3. Learn User Preferences: Transmission
  if (cleanMsg.includes('اتوماتيك') || cleanMsg.includes('أوتوماتيك') || cleanMsg.includes('automatic')) {
    userProfile.preferredTransmission = 'Automatic';
  } else if (cleanMsg.includes('مانيوال') || cleanMsg.includes('عادي') || cleanMsg.includes('manual')) {
    userProfile.preferredTransmission = 'Manual';
  }

  // 4. Learn Frequent Destinations
  const destinationKeywords: Record<string, string> = {
    'كويت': 'Kuwait', 'الكويت': 'Kuwait', 'الكوت': 'Kuwait',
    'دبي': 'Dubai', 'dubai': 'Dubai', 'أبوظبي': 'Abu Dhabi',
    'مصر': 'Egypt', 'القاهرة': 'Cairo', 'الغردقة': 'Hurghada', 'شرم': 'Sharm El Sheikh',
    'تركيا': 'Turkey', 'اسطنبول': 'Istanbul', 'أنطاليا': 'Antalya', 'طرابزون': 'Trabzon',
    'المغرب': 'Morocco', 'كازا': 'Casablanca', 'مراكش': 'Marrakech',
    'الاردن': 'Jordan', 'عمّان': 'Jordan',
    'البحرين': 'Bahrain', 'جورجيا': 'Georgia', 'اسبانيا': 'Spain',
    'قطر': 'Qatar', 'qatar': 'Qatar', 'الدوحة': 'Qatar', 'الدوحه': 'Qatar', 'doha': 'Qatar', 'حمد': 'Qatar', 'doh': 'Qatar',
    'عمان': 'Oman', 'سلطنة عمان': 'Oman', 'مسقط': 'Oman', 'صلالة': 'Oman',
    'السعودية': 'Saudi Arabia', 'الرياض': 'Saudi Arabia', 'جدة': 'Saudi Arabia',
  };

  for (const [kw, dest] of Object.entries(destinationKeywords)) {
    if (cleanMsg.includes(kw)) {
      if (!userProfile.frequentDestinations) userProfile.frequentDestinations = [];
      const found = userProfile.frequentDestinations.find((d) => d.name.toLowerCase() === dest.toLowerCase());
      if (found) {
        found.count += 1;
        found.lastDate = todayStr;
      } else {
        userProfile.frequentDestinations.push({ name: dest, count: 1, lastDate: todayStr });
      }
      break;
    }
  }

  // 5. Learn User Corrections & Slang into Global Learned Aliases
  const coreDestinations = ['دبي', 'الكويت', 'مصر', 'تركيا', 'قطر', 'المغرب', 'الاردن', 'البحرين', 'dubai', 'kuwait', 'qatar'];
  const correctionMatch = userMessage.match(/(?:مش|مو|لا|not|بدل)\s+([^\s،,]+)\s*(?:قصدي|عايز|أقصد|mean|in|في)\s+([^\s،,]+)/i);
  if (correctionMatch) {
    const rawSrc = correctionMatch[1].trim();
    const rawDest = correctionMatch[2].trim();
    if (
      rawSrc.length > 2 &&
      rawDest.length > 2 &&
      !coreDestinations.includes(rawSrc.toLowerCase()) &&
      rawDest.length >= 3
    ) {
      memory.learnedAliases[rawSrc] = {
        canonical: rawDest,
        confidence: (memory.learnedAliases[rawSrc]?.confidence || 0) + 1,
        lastUpdated: todayStr,
        source: 'user_correction',
      };
      newAliasesLearned[rawSrc] = rawDest;
    }
  }

  // 6. Learn Frequently Asked Topics
  if (cleanMsg.includes('تأمين') || cleanMsg.includes('تامين') || cleanMsg.includes('insurance')) {
    memory.frequentlyAskedTopics['insurance_included'] = (memory.frequentlyAskedTopics['insurance_included'] || 0) + 1;
  }
  if (cleanMsg.includes('إلغاء') || cleanMsg.includes('الغاء') || cleanMsg.includes('cancel')) {
    memory.frequentlyAskedTopics['free_cancellation'] = (memory.frequentlyAskedTopics['free_cancellation'] || 0) + 1;
  }
  if (cleanMsg.includes('مطار') || cleanMsg.includes('airport')) {
    memory.frequentlyAskedTopics['airport_delivery'] = (memory.frequentlyAskedTopics['airport_delivery'] || 0) + 1;
  }

  // Save back to persistent memory
  if (userKey !== 'anonymous') {
    memory.userProfiles[userKey] = userProfile;
  }
  memory.updatedAt = new Date().toISOString();
  saveGlobalMemory(memory);

  return { updatedUserMemory: userProfile, newLearnedAliases: newAliasesLearned };
}

/**
 * Builds the Dynamic Learned Knowledge & Memory Prompt String for Gemini
 * يحقن القواعد الإدارية العليا والذاكرة التراكمية في سياق الذكاء الاصطناعي لكل العملاء
 */
export function buildLearnedMemoryPrompt(userMemory?: UserMemoryProfile | null): string {
  const memory = loadGlobalMemory();

  // 1. Super Admin Directives (Highest Priority across all sessions)
  let adminRulesSection = '';
  const activeAdminRules = (memory.adminRules || []).filter((r) => r.active !== false);
  if (activeAdminRules.length > 0) {
    const rulesList = activeAdminRules
      .map((r, idx) => `${idx + 1}. ${r.rule}`)
      .join('\n');
    adminRulesSection = `
🚨 توجيهات وقواعد إلزامية عليا من إدارة النظام (Super Admin Directives - HIGHEST PRIORITY):
يجب عليك الالتزام التام والكامل بالقواعد التالية في جميع ردودك مع كافة العملاء والزوار دون أي استثناء:
${rulesList}
`;
  }

  // 2. Individual User Profile Memory (if applicable)
  let userContextStr = '';
  if (userMemory) {
    const parts: string[] = [];
    if (userMemory.name) parts.push(`الاسم المعتاد: ${userMemory.name}`);
    if (userMemory.preferredVehicleType) parts.push(`الفئة المفضلة للسيارة: ${userMemory.preferredVehicleType}`);
    if (userMemory.preferredTransmission) parts.push(`نوع القير المفضل: ${userMemory.preferredTransmission}`);
    if (userMemory.frequentDestinations && userMemory.frequentDestinations.length > 0) {
      const topDest = userMemory.frequentDestinations.slice(0, 3).map((d) => `${d.name} (${d.count} مرات)`).join(', ');
      parts.push(`أكثر الوجهات بحثاً وسفراً: ${topDest}`);
    }
    if (userMemory.interactionCount > 1) {
      parts.push(`عميل مميز تواصل معنا ${userMemory.interactionCount} مرة سابقة`);
    }

    if (parts.length > 0) {
      userContextStr = `\n👤 ذاكرة وتفضيلات هذا العميل المكتسبة من المحادثات السابقة:\n- ${parts.join('\n- ')}\n* (استغل هذه التفضيلات بلباقة وود، مثلاً اقترح له فئته المفضلة أو رحب به كعميل دائم).*`;
    }
  }

  // 3. Globally Learned Aliases across all conversations
  const learnedAliasList = Object.entries(memory.learnedAliases || {})
    .filter(([_, entry]) => entry.confidence >= 2)
    .slice(0, 20)
    .map(([alias, entry]) => `"${alias}" -> ${entry.canonical}`)
    .join(' | ');

  return `
${adminRulesSection}
🧠 نظام التعلم المستمر والذاكرة التراكمية المركزية (Continuous Learning & Global Memory):
- إجمالي المحادثات والخبرات المتراكمة لدى النظام: ${memory.totalConversations} محادثة تم التعلم منها.
${userContextStr}
- مرادفات ومسميات دارجة تم تعلمها واعتمادها من تجارب العملاء عالمياً:
  ${learnedAliasList || '"الجونة" -> Hurghada | "صلالة" -> Oman | "كازا" -> Morocco | "مطار حمد" -> Qatar'}
- التعلّم التفاعلي: استوعب دائماً توجيهات وتفضيلات المستخدمين واعتمد عليها لتقديم اقتراحات أسرع وأكثر دقة.
`;
}
