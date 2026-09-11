/**
 * Autours AI Assistant - Continuous Learning & Persistent Memory Engine
 * نظام التعلم المستمر والذاكرة التراكمية للمساعد الذكي
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

export interface GlobalMemoryState {
  totalConversations: number;
  learnedAliases: Record<string, LearnedAliasEntry>;
  frequentlyAskedTopics: Record<string, number>;
  userProfiles: Record<string, UserMemoryProfile>;
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
  },
  frequentlyAskedTopics: {
    'free_cancellation': 12,
    'insurance_included': 10,
    'pay_on_pickup': 8,
    'airport_delivery': 15,
  },
  userProfiles: {},
  updatedAt: new Date().toISOString(),
};

// In-Memory Fast Cache
let inMemoryState: GlobalMemoryState = { ...DEFAULT_GLOBAL_MEMORY };
let isLoaded = false;

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
        inMemoryState = {
          ...DEFAULT_GLOBAL_MEMORY,
          ...parsed,
          learnedAliases: { ...DEFAULT_GLOBAL_MEMORY.learnedAliases, ...(parsed.learnedAliases || {}) },
          frequentlyAskedTopics: { ...DEFAULT_GLOBAL_MEMORY.frequentlyAskedTopics, ...(parsed.frequentlyAskedTopics || {}) },
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
 * Extracts and updates learned insights from a user interaction turn
 */
export function learnFromConversation(params: {
  userMessage: string;
  assistantReply: string;
  currentUser?: { name?: string; email?: string; phone?: string; role?: string; country?: string } | null;
  existingUserMemory?: UserMemoryProfile | null;
}): { updatedUserMemory: UserMemoryProfile; newLearnedAliases: Record<string, string> } {
  const { userMessage, assistantReply, currentUser, existingUserMemory } = params;
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

  // 5. Learn User Corrections & Slang (e.g. "لا مش X، قصدي Y" or "X دي في Y" or "X يعني Y")
  const correctionMatch = userMessage.match(/(?:مش|مو|لا|not|بدل)\s+([^\s،,]+)\s*(?:قصدي|عايز|أقصد|mean|in|في)\s+([^\s،,]+)/i);
  if (correctionMatch) {
    const rawSrc = correctionMatch[1].trim();
    const rawDest = correctionMatch[2].trim();
    if (rawSrc.length > 2 && rawDest.length > 2) {
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

  // Save back to memory
  if (userKey !== 'anonymous') {
    memory.userProfiles[userKey] = userProfile;
  }
  memory.updatedAt = new Date().toISOString();
  saveGlobalMemory(memory);

  return { updatedUserMemory: userProfile, newLearnedAliases: newAliasesLearned };
}

/**
 * Builds the Dynamic Learned Knowledge & Memory Prompt String for Gemini
 */
export function buildLearnedMemoryPrompt(userMemory?: UserMemoryProfile | null): string {
  const memory = loadGlobalMemory();

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

  // Learned Aliases
  const learnedAliasList = Object.entries(memory.learnedAliases || {})
    .filter(([_, entry]) => entry.confidence >= 2)
    .slice(0, 15)
    .map(([alias, entry]) => `"${alias}" -> ${entry.canonical}`)
    .join(' | ');

  return `
🧠 نظام التعلم المستمر والذاكرة التراكمية (Continuous Learning & Memory):
- إجمالي المحادثات والخبرات المتراكمة لدى النظام: ${memory.totalConversations} محادثة.
${userContextStr}
- مرادفات وكلمات ومصطلحات دارجة تم تعلمها من تجارب العملاء:
  ${learnedAliasList || '"الجونة" -> Hurghada | "صلالة" -> Oman | "كازا" -> Morocco'}
- التعلّم التفاعلي: إذا قام المستخدم بتصحيحك أو تحديد تفضيل جديد (نوع سيارة، ميزانية، وجهة)، استوعب فوراً التفضيل واعتمد عليه في اقتراحاتك القادمة.
`;
}
