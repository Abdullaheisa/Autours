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
): { reply: string; actionButtons?: Array<{ label: string; promptText?: string }> } | null {
  if (!currentUser) return null;
  const isAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'administrator' ||
    (currentUser.email && currentUser.email.toLowerCase().includes('admin'));

  if (!isAdmin) return null;

  const cleanMsg = message.trim();
  const lowerMsg = cleanMsg.toLowerCase();
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
        reply: `📋 **لا توجد قواعد إدارية مسجلة حالياً.**\n\nلإضافة قاعدة وتدريب المساعد، اكتب:\n> **احفظ عندك:** [نص القاعدة أو المعلومة التي تريد تطبيقها مع جميع العملاء]`,
        actionButtons: [
          { label: '➕ مثال إضافة قاعدة', promptText: 'احفظ عندك: تأجير السيارات في قطر متاح ومشمول بالتأمين الشامل' },
        ],
      };
    }

    const rulesList = rules
      .map(
        (r, idx) =>
          `${idx + 1}. **[#${r.id}]**: ${r.rule}\n   👤 *أضيفت بواسطة: ${r.addedBy} بتاريخ ${r.date}*`
      )
      .join('\n\n');

    return {
      reply: `📋 **قواعد وتوجيهات إدارة النظام المعتمدة المطبقة على جميع العملاء (${rules.length} قواعد):**\n\n${rulesList}\n\n━━━━━━━━━━━━━━━\n💡 **لإضافة قاعدة جديدة:** اكتب \`احفظ عندك: [نص القاعدة]\`\n💡 **لحذف قاعدة:** اكتب \`احذف قاعدة [رقم القاعدة، مثلاً #${rules[0]?.id}]\``,
      actionButtons: rules.slice(0, 3).map((r) => ({
        label: `🗑️ حذف #${r.id}`,
        promptText: `احذف قاعدة #${r.id}`,
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
      reply: `🗑️ **تم مسح جميع القواعد الإدارية بنجاح.** الذاكرة الإدارية أصبحت فارغة الآن.`,
    };
  }

  // 3. Smart Rule Deletion (By ID, By Keyword, By Description, By Subject)
  // الصيغ المدعومة:
  // - "احذف قاعدة R-1"
  // - "احذف قاعدة قطر والتوصيل"
  // - "امسح اللي قولتهولك عن الفنادق"
  // - "امسح قاعدة التوصيل المجاني"
  // - "انسى موضوع سن 23 سنة"
  // - "delete rule qatar delivery"
  const isBookingWord = /(?:حجز|حجزي|booking|order|reservation)/i.test(cleanMsg);
  const deleteDirectiveMatch =
    !isBookingWord &&
    (cleanMsg.match(
      /^(?:احذف|امسح|إلغاء|الغاء|حذف|شيل|انسى|الغِ|الغ)\s+(?:القاعدة|قاعدة|المعلومة|معلومة|التوجيهات|التعليمات|اللي\s+قولتهولك|اللي\s+قولته|كلامي|اللي\s+اتعلمته)\s*(?:عن|في|بخصوص|بتاعت|بتاعة|الخاصة\s+بـ|الخاصة\s+ب|رقم)?\s*[:：\-]?\s*([\s\S]+)$/i
    ) ||
      cleanMsg.match(/^(?:احذف|امسح|شيل|انسى)\s+(?:عن\s+)?([\s\S]+)$/i) ||
      cleanMsg.match(/^(?:delete|remove|forget)\s+(?:rule|instruction|directive|about)?\s*[:：\-]?\s*([\s\S]+)$/i));

  if (deleteDirectiveMatch) {
    const rawTarget = deleteDirectiveMatch[1].trim();
    const cleanTarget = rawTarget.replace(/^(?:قاعدة|القاعدة|المعلومة|معلومة)\s*/i, '').trim();

    // A. Check if user provided an ID (e.g. "R-1", "#R-1", "1")
    let matchedRule: AdminRule | undefined;
    const cleanId = cleanTarget.toUpperCase().replace(/^#/, '');
    matchedRule = memory.adminRules.find(
      (r) => r.id.toUpperCase() === cleanId || r.id.toUpperCase() === `R-${cleanId}`
    );

    // B. Keyword & Substring Search if not matched by ID
    if (!matchedRule) {
      const normTarget = normalizeText(cleanTarget);
      const stopWords = new Set([
        'عن', 'في', 'من', 'إلى', 'الي', 'على', 'علي', 'بتاعت', 'بتاعة', 'بتاع', 'الخاصة', 'بـ', 'ب',
        'قاعدة', 'القاعدة', 'معلومة', 'المعلومة', 'اللي', 'قولتهولك', 'قولته', 'رقم', 'ده', 'دي',
        'rule', 'about', 'the', 'of', 'in', 'for'
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
        if (normRule.includes(normTarget)) {
          score += 100;
        }

        // Word matches
        for (const word of searchWords) {
          if (normRule.includes(word)) {
            score += 20;
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
          reply: `🔍 **وجدت أكثر من قاعدة مرتبطة بـ "${cleanTarget}":**\n\n${optionsList}\n\nيرجى تحديد القاعدة المراد حذفها بالضغط على أحد الأزرار أدناه:`,
          actionButtons: scoredRules.slice(0, 4).map((item) => ({
            label: `🗑️ حذف #${item.rule.id}`,
            promptText: `احذف قاعدة #${item.rule.id}`,
          })),
        };
      }
    }

    // If matched a rule -> Delete it!
    if (matchedRule) {
      const deletedId = matchedRule.id;
      const deletedText = matchedRule.rule;
      memory.adminRules = memory.adminRules.filter((r) => r.id !== deletedId);
      saveGlobalMemory(memory);

      return {
        reply: `🗑️ **تم حذف القاعدة الإدارية بنجاح من ذاكرة النظام المركزية!**\n\n📌 **القاعدة المحذوفة [#${deletedId}]:**\n> "${deletedText}"\n\n✨ تم إلغاء العمل بهذه التوجيهات فوراً ولن يتم تطبيقها بعد الآن في محادثات العملاء.`,
        actionButtons: [{ label: '📋 عرض القواعد المتبقية', promptText: 'اعرض القواعد' }],
      };
    } else {
      return {
        reply: `⚠️ لم أجد أي قاعدة تطابق: **"${cleanTarget}"**.\n\n💡 يمكنك كتابة **"اعرض القواعد"** للاطلاع على قائمة القواعد المسجلة حالياً وتحديدها.`,
        actionButtons: [{ label: '📋 استعراض القواعد الحالية', promptText: 'اعرض القواعد' }],
      };
    }
  }

  // 4. Add / Teach new rule to AI
  // Formats supported:
  // - "احفظ عندك: [القاعدة]"
  // - "قاعدة: [القاعدة]"
  // - "تعليمات: [القاعدة]"
  // - "تعلم: [القاعدة]"
  // - "سجل عندك: [القاعدة]"
  // - "تذكر: [القاعدة]"
  // - "admin: [rule]"
  // - "learn: [rule]"
  // - "لما حد يسألك عن X قوله Y" / "لو حد سأل عن X جاوبه Y"
  // - "عاوزك تعرف ان [المعلومة]"
  let extractedRule: string | null = null;

  const directivePrefixMatch = cleanMsg.match(
    /^(?:احفظ عندك|احفظ|سجل عندك|ضيف قاعدة|قاعدة جديدة|قاعدة|تعليمات|توجيهات|معلومة هامة|معلومة|تعلم|اتعلم|علمتك|من هنا ورايح|تذكر دائماً|تذكر|admin|learn|rule|instruction)\s*[:：\-]\s*([\s\S]+)$/i
  );

  if (directivePrefixMatch) {
    extractedRule = directivePrefixMatch[1].trim();
  } else {
    const conditionalMatch = cleanMsg.match(
      /^(?:لما|لو|إذا|اذا)\s+(?:حد|العميل|اي عميل|زبون|شخص)\s+(?:يسألك|يسأل|طلب|يطلب)\s+(?:عن|في|على)\s+([\s\S]+?)\s+(?:جاوبه|قوله|وضح له|رد عليه|انصحه)\s+([\s\S]+)$/i
    );
    if (conditionalMatch) {
      extractedRule = `إذا سأل العميل أو استفسر عن (${conditionalMatch[1].trim()})، يجب الرد عليه وتوضيح: (${conditionalMatch[2].trim()})`;
    } else {
      const wantToLearnMatch = cleanMsg.match(
        /^(?:عاوزك|عايزك|ابيك|ودي)\s+(?:تعرف|تحفظ|تتعلم|تقول)\s+(?:ان|أن|إن)?\s*([\s\S]+)$/i
      );
      if (wantToLearnMatch && wantToLearnMatch[1].length > 10) {
        extractedRule = wantToLearnMatch[1].trim();
      }
    }
  }

  if (extractedRule && extractedRule.length >= 4) {
    const newId = `R-${Date.now().toString().slice(-4)}`;
    const adminName = currentUser.name || currentUser.email || 'Admin';
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
      reply: `✅ **تم تسجيل وتثبيت القاعدة الإدارية بنجاح في الذاكرة المركزية!**\n\n📌 **القاعدة رقم [#${newId}]:**\n> "${extractedRule}"\n\n✨ **تم اعتماد هذه التوجيهات فوراً كقواعد عليا إلزامية (Super Admin Directives)**، وسيتم تطبيقها والالتزام التام بها مع كافة العملاء والزوار في كل المحادثات حول العالم!\n\n💡 يمكنك كتابة **"اعرض القواعد"** لمراجعة ما تم حفظه، أو **"احذف قاعدة #${newId}"** لحذفها لاحقاً.`,
      actionButtons: [
        { label: '📋 استعراض كافة القواعد', promptText: 'اعرض القواعد' },
        { label: `🗑️ حذف هذه القاعدة (#${newId})`, promptText: `احذف قاعدة #${newId}` },
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
