// server/services/aiChatService.js
// BOOSTUP 24/7 Intelligent AI Store Assistant & General Chat Brain

/**
 * Intelligent AI Chat Assistant for BOOSTUP Game Top-up Platform
 * Supports:
 * 1. Google Gemini API (1.5 Flash / 2.0 Flash) when apiKey is configured in Settings or ENV
 * 2. Deep Local Conversational Brain (Chit-chat, Jokes, Game Meta, Tech Support, Store Trust, Q&A)
 * 3. Game Top-up & Order Lookup domain knowledge
 * 4. Human Admin handoff detection
 */

class AIChatService {
  constructor() {
    this.name = "BOOSTUP AI Assistant";
  }

  /**
   * Main entry point: generate an intelligent AI reply
   * @param {string} userMessage - Text from the customer
   * @param {object} context - { chat, db, user, siteSettings }
   * @returns {object} - { text, shouldHandoffToHuman, suggestedChips }
   */
  async generateReply(userMessage, { chat, db, user, siteSettings } = {}) {
    const raw = (userMessage || '').trim();
    const lower = raw.toLowerCase();

    // 1. Detect Intent: Requesting Human Admin / Person
    if (this.isRequestingHuman(lower)) {
      return {
        text: `รับทราบครับผม! 👨‍💼 ขณะนี้ระบบได้ส่งเรื่องแจ้งเตือนไปยัง **แอดมินเจ้าหน้าที่คนจริง** ให้เรียบร้อยแล้วครับ\n\nกรุณาพิมพ์รายละเอียด คำถาม หรือเลขออเดอร์ที่ต้องการให้เจ้าหน้าที่ตรวจสอบทิ้งไว้ได้เลยครับ เจ้าหน้าที่จะเข้ามาตอบกลับโดยเร็วที่สุดครับ 🙏`,
        shouldHandoffToHuman: true,
        suggestedChips: ['เช็คสถานะออเดอร์', 'โอนเงินไม่เข้า', 'ติดต่อผ่าน LINE']
      };
    }

    // 2. Detect Intent: Order Tracking (e.g. BST-20260921-12571 or ord_...)
    const orderMatch = raw.match(/BST-\d{8}-\d+/i) || raw.match(/ord_\d+/i);
    if (orderMatch && db) {
      const orderId = orderMatch[0];
      const order = db.getOrderById(orderId);
      if (order) {
        return this.formatOrderLookupReply(order);
      } else {
        return {
          text: `🔍 ไม่พบข้อมูลคำสั่งซื้อหมายเลข **${orderId}** ในระบบครับ\n\nรบกวนตรวจสอบตัวสะกดอีกครั้ง หรือหากเพิ่งทำรายการเข้ามา สามารถรอระบบอัปเดตสักครู่ หรือกดปุ่ม **"ติดต่อแอดมินคนจริง"** เพื่อให้เจ้าหน้าที่ตรวจสอบให้ได้เลยครับ`,
          shouldHandoffToHuman: false,
          suggestedChips: ['วิธีเติมเงิน', 'ติดต่อแอดมินคนจริง']
        };
      }
    }

    // 3. User asking about general order status without specifying an ID
    if (lower.includes('เช็คออเดอร์') || lower.includes('ตามออเดอร์') || lower.includes('สถานะออเดอร์') || lower.includes('เช็คสถานะ')) {
      if (user?.id && db) {
        const userOrders = (db.getOrders() || []).filter(o => o.userId === user.id);
        if (userOrders.length > 0) {
          const latest = userOrders[0];
          return this.formatOrderLookupReply(latest, true);
        }
      }
      return {
        text: `📦 **วิธีตรวจสอบสถานะคำสั่งซื้อ:**\n\nคุณลูกค้าสามารถพิมพ์ **เลขออเดอร์** (เช่น \`BST-20260922-12570\`) ส่งเข้ามาในแชทนี้ได้เลยครับ AI จะดึงสถานะล่าสุดมาให้ทันทีครับ!\n\nหรือหากต้องการให้เจ้าหน้าที่คนจริงตรวจสอบ สามารถกดปุ่ม **"ติดต่อแอดมินคนจริง"** ได้ตลอดเวลาครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['ติดต่อแอดมินคนจริง', 'วิธีเติมเงิน']
      };
    }

    // 4. Try Google Gemini API if API key is provided
    const geminiKey = siteSettings?.geminiApiKey || process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim()) {
      try {
        const geminiReply = await this.queryGeminiAPI(raw, geminiKey.trim(), { chat, user, db });
        if (geminiReply) {
          const isAskingHuman = this.isRequestingHuman(geminiReply.toLowerCase());
          return {
            text: geminiReply,
            shouldHandoffToHuman: isAskingHuman,
            suggestedChips: ['เติมเงินเกม', 'เช็คสถานะออเดอร์', 'ติดต่อแอดมินคนจริง']
          };
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to local conversational brain:", geminiErr.message);
      }
    }

    // 5. Deep Local Conversational Brain
    return this.generateLocalSmartReply(raw, lower, { user, db });
  }

  /**
   * Call Google Gemini API (Gemini 1.5 Flash / 2.0 Flash)
   */
  async queryGeminiAPI(userMessage, apiKey, { chat, user, db }) {
    const customerName = user?.name || user?.username || 'คุณลูกค้า';
    const systemInstruction = `คุณคือ "BOOSTUP AI Assistant" ผู้ช่วยอัจฉริยะ 24 ชม. ของเว็บไซต์เติมเกมออนไลน์ BOOSTUP (www.boostup-game.online)
บุคลิกของคุณ:
1. ฉลาด มีไหวพริบ สุภาพ เป็นกันเอง สนุกสนาน มีอารมณ์ขัน ใช้คำลงท้าย "ครับ/นะครับ"
2. ตอบได้ทุกเรื่องในโลก ไม่จำกัดแค่เรื่องเกม! ไม่ว่าจะเป็น การคุยเล่น, ถามสารทุกข์สุกดิบ, มุกตลก, ทริคเล่นเกม, การแก้ปัญหาเน็ต/คอม/มือถือ, ปรัชญา, ความรู้ทั่วไป, ช่วยคิดเลข, แนะนำหนัง/เพลง, ให้กำลังใจ
3. ข้อมูลร้าน BOOSTUP:
- เติมเกมอัตโนมัติ 24 ชม. ด้วยระบบ API รวดเร็ว 1-3 วินาที
- Roblox (Robux): เติมผ่าน Username เท่านั้น ปลอดภัย 100% ไม่ขอรหัสผ่าน ไม่ขอ OTP
- ROV: ใช้ OpenID
- Free Fire: ใช้ Player ID (UID)
- Valorant: ใช้ Riot ID (#Tagline)
- ช่องทางชำระเงิน: พร้อมเพย์ QR Code (ออโต้), โอนธนาคารแนบสลิป, ซองของขวัญ TrueMoney, กระเป๋าเงินสมาชิก
- การรับประกัน: ปลอดภัย 100% ไม่เคยมีประวัติแบน คืนเงินไวหากติดปัญหา
4. หากผู้ใช้ระบุชัดเจนว่าต้องการคุยกับ "แอดมินคนจริง" หรือ "เจ้าหน้าที่มนุษย์" ให้บอกว่ากำลังส่งเรื่องประสานงานให้แอดมินคนจริงเข้ามาตอบทันที
5. ตอบเป็นภาษาไทยที่กระชับ อ่านง่าย ใช้ Markdown หัวข้อ และ bullet points ให้น่าอ่าน`;

    // Extract recent chat history for context
    const contents = [];
    if (chat?.messages && chat.messages.length > 0) {
      const recent = chat.messages.slice(-6);
      for (const m of recent) {
        if (m.sender === 'customer') {
          contents.push({ role: 'user', parts: [{ text: m.text }] });
        } else if (m.sender === 'ai') {
          contents.push({ role: 'model', parts: [{ text: m.text }] });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: `(ลูกค้าชื่อ: ${customerName}) คำถาม: ${userMessage}` }]
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 600
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return replyText ? replyText.trim() : null;
  }

  /**
   * Local Conversational Brain with Extensive Semantic Categories
   */
  generateLocalSmartReply(raw, lower, { user, db }) {
    const name = user?.name || user?.username || 'คุณลูกค้า';

    // --- CATEGORY 1: Chit-chat & Small Talk ---
    if (lower.includes('สบายดีไหม') || lower.includes('เป็นไงบ้าง') || lower.includes('เป็นอย่างไรบ้าง') || lower.includes('how are you')) {
      return {
        text: `สบายดีมากๆ เลยครับคุณ ${name}! ขอบคุณที่ถามนะครับ 😊\n\nผมพร้อมแสตนด์บายบริการคุณลูกค้าตลอด 24 ชั่วโมง วันนี้มีอะไรให้ผมช่วยดูแล หรืออยากหาเกมสนุกๆ เติมผ่อนคลาย ถามผมได้เลยนะครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['โปรโมชั่นวันนี้', 'เติม Robux', 'ติดต่อแอดมินคนจริง']
      };
    }

    if (lower.includes('กินข้าวยัง') || lower.includes('ทานข้าวยัง') || lower.includes('กินอะไรยัง')) {
      return {
        text: `ผมเป็น AI อาหารหลักของผมคือกระแสไฟฟ้าและข้อมูลในระบบครับ ⚡ แต่ถ้าเลือกได้ อยากกินข้าวมันไก่กับชาเย็นอร่อยๆ เหมือนกันนะเนี่ย 5555 🍗🧋\n\nแล้วคุณ ${name} ทานข้าวเรียบร้อยหรือยังครับ อย่าลืมหาของอร่อยๆ ทานด้วยนะครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['คุยเล่นทั่วไป', 'เติมเงินเกม', 'ติดต่อแอดมินคนจริง']
      };
    }

    if (lower.includes('ทำอะไรอยู่') || lower.includes('ทำไรอยู่') || lower.includes('what are you doing')) {
      return {
        text: `กำลังนั่งเฝ้าระบบเติมเกมให้คุณ ${name} อยู่นี่แหละครับ! 🤖 คอยตรวจตราให้ทุกออเดอร์เติมเข้าไวสุดๆ ใน 1-3 วินาทีครับ\n\nคุณลูกค้ากำลังเล่นเกมอะไรอยู่หว่า มีอะไรให้ผมช่วยแนะนำไหมครับ?`,
        shouldHandoffToHuman: false,
        suggestedChips: ['แนะนำเกมหน่อย', 'วิธีเติมเกม', 'ติดต่อแอดมินคนจริง']
      };
    }

    if (lower.includes('นอนยัง') || lower.includes('นอนดึก') || lower.includes('ยังไม่นอนอีก') || lower.includes('ดึกแล้ว')) {
      return {
        text: `ผมไม่ต้องนอนครับ! 🌟 ทีมงาน BOOSTUP อัปเกรดให้ผมเฝ้าร้าน 24 ชั่วโมงไม่มีพักเลยครับ\n\nแต่ถ้าคุณ ${name} เล่นเกมดึกๆ พักสายตาและอย่านอนดึกเกินไปด้วยนะ เป็นห่วงนะครับ! 💤`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เช็คสถานะออเดอร์', 'ติดต่อแอดมินคนจริง']
      };
    }

    if (lower.includes('คุณคือใคร') || lower.includes('ชื่ออะไร') || lower.includes('บอทชื่ออะไร') || lower.includes('ใครสร้างคุณ') || lower.includes('who are you')) {
      return {
        text: `ผมคือ **BOOSTUP AI Assistant** 🤖 สุดยอดผู้ช่วยอัจฉริยะประจำร้าน **BOOSTUP** ครับ!\n\nหน้าที่ของผมคือ:\n• คอยดูแล ตอบคำถาม แนะนำเกม และช่วยเช็คออเดอร์ให้ลูกค้าตลอด 24 ชม.\n• คุยเล่น ปรึกษาเรื่องเกม มุกตลก หรือทริคต่างๆ ได้เสมอ\n• หากมีปัญหาเฉพาะทาง ผมพร้อมส่งต่อให้ **แอดมินคนจริง** มาดูแลต่อได้ทันทีครับ! ✨`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เล่าเรื่องตลก', 'ร้านนี้โกงไหม', 'วิธีเติมเงิน']
      };
    }

    if (lower.includes('เป็น ai') || lower.includes('เป็นบอท') || lower.includes('หุ่นยนต์') || lower.includes('ai หรือคน')) {
      return {
        text: `ใช่แล้วครับ! ผมคือ AI อัจฉริยะที่ถูกเทรนมาเพื่อดูแลลูกค้าของร้าน BOOSTUP โดยเฉพาะครับ 🦾 ถึงผมจะเป็น AI แต่ความตั้งใจที่จะให้บริการและดูแลคุณ ${name} มีเต็มร้อยไม่แพ้คนจริงแน่นอนครับ!\n\n(แต่ถ้าอยากคุยกับคนจริง สามารถกดปุ่ม **"ติดต่อแอดมินคนจริง"** ได้ตลอดเวลานะครับ)`,
        shouldHandoffToHuman: false,
        suggestedChips: ['ติดต่อแอดมินคนจริง', 'เติม Robux', 'วิธีชำระเงิน']
      };
    }

    // --- CATEGORY 2: Humor, Jokes & Entertainment ---
    if (lower.includes('เรื่องตลก') || lower.includes('มุก') || lower.includes('ขำๆ') || lower.includes('ฮาๆ') || lower.includes('joke')) {
      const jokes = [
        `🎮 **มุกเกมเมอร์วันละนิด:**\n\nถาม: ทำไมคอมพิวเตอร์ถึงชอบเล่นเกมยิงปืน?\nตอบ: เพราะมันมี **RAM (แรมโบ้)** อยู่ในตัว 555555! 🤣`,
        `😂 **มุกตลกวันนี้:**\n\nถาม: ตัวละครอะไรในเกมเติมเงินเก่งที่สุด?\nตอบ: **คุณลูกค้า** นี่แหละครับ! ยิ่งเติมยิ่งเก่ง เทพทุกเซิร์ฟเวอร์แน่นอน! 🏆✨`,
        `🎯 **มุกคลายเครียด:**\n\nหมอบอกให้ผม "พักผ่อนเยอะๆ"\nผมเลยเปิดเกมเล่นไป 12 ชั่วโมง... หมอไม่ได้บอกว่าห้ามพักผ่อนในเกมซะหน่อย! 5555 🕹️`,
        `⚔️ **คำคมสายเกม:**\n\n"ความรักก็เหมือนเกม ROV... ถ้าเราแบกคนเดียว สุดท้ายก็แพ้อยู่ดี" แงงงง 🥲`
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      return {
        text: `${randomJoke}\n\nอยากฟังมุกอีก หรืออยากคุยเรื่องอะไร บอกมาได้เลยนะครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['ขอมุกอีก', 'แนะนำเกมหน่อย', 'โปรโมชั่นวันนี้']
      };
    }

    if (lower.includes('เบื่อ') || lower.includes('เหงา') || lower.includes('ไม่มีไรทำ') || lower.includes('เซ็ง')) {
      return {
        text: `เบื่อ/เหงาเหรอครับคุณ ${name}? มาคุยกับผมได้เลยนะ หรือลองกิจกรรมพวกนี้ดูไหมครับ:\n\n1. 🎮 **เปิดเกมเล่น**: เข้า Roblox ไปแมพ Blox Fruits, แมพ Tower of Hell หรือไปลงแรงค์ ROV สักตา!\n2. 💎 **เติมเกมเพิ่มความฟิน**: ได้สกินใหม่ ไอเทมใหม่ ช่วยให้มีไฟเล่นเกมขึ้นเยอะเลยครับ!\n3. 🎵 **ฟังเพลงเพลินๆ**: เปิดเพลย์ลิสต์ Lo-fi หรือ EDM แล้วนั่งชิลล์ๆ\n\nอยากคุยเรื่องอะไรเป็นพิเศษ ระบายกับผมได้ตลอดนะครับ ผมอยู่ตรงนี้เสมอ! ❤️`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เล่าเรื่องตลก', 'เติม Roblox (Robux)', 'ติดต่อแอดมินคนจริง']
      };
    }

    if (lower.includes('อกหัก') || lower.includes('เศร้า') || lower.includes('ท้อ') || lower.includes('หัวร้อน') || lower.includes('เล่นแพ้') || lower.includes('แพ้รวด')) {
      return {
        text: `โอ๋ๆ นะครับคุณ ${name}... เข้าใจความรู้สึกเลยครับ 🥺\n\n• ถ้า**หัวร้อนจากการแพ้เกม**: ลองวางโทรศัพท์/เมาส์สัก 5 นาที ดื่มน้ำเย็นๆ หายใจลึกๆ เกมหน้าค่อยเอาใหม่ ชัยชนะรออยู่ครับ!\n• ถ้า**เรื่องความรักหรือชีวิต**: คนเรามีวันที่ดีและวันที่แย่ครับ จำไว้ว่าคุณเก่งมากๆ แล้วในทุกๆ วัน เป็นกำลังใจให้นะครับ! ✌️💖`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เล่าเรื่องตลก', 'คุยกับแอดมินคนจริง']
      };
    }

    if (lower.includes('น่ารัก') || lower.includes('เก่งมาก') || lower.includes('ฉลาดจัง') || lower.includes('รักนะ') || lower.includes('ชอบบอท') || lower.includes('ขอบคุณ') || lower.includes('แต๊งกิ้ว') || lower.includes('thank')) {
      return {
        text: `งุ้ยยยย ขอบคุณมากๆ เลยครับคุณ ${name}! เขินเลยเนี่ยยยย 🥰💖\n\nคำชมของคุณลูกค้าคือกำลังใจอันยิ่งใหญ่ของผมเลยครับ! มีอะไรให้ผมรับใช้หรือช่วยดูแล ยินดีบริการสุดฝีมือตลอด 24 ชม. เลยนะครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เติมเงินเกม', 'เช็คสถานะออเดอร์', 'ติดต่อแอดมินคนจริง']
      };
    }

    // --- CATEGORY 3: Game Advice & Meta Recommendations ---
    if (lower.includes('เล่นตัวไหนดี') || lower.includes('ตัวไหนเก่ง') || lower.includes('เมต้า') || lower.includes('แนะนำตัว')) {
      return {
        text: `🔥 **คำแนะนำการเลือกตัวละครยอดนิยม:**\n\n• **ROV (Realm of Valor)**:\n  - เมจ: Liliana, Tulen, Yue (ดาเมจเบิร์สจัด แรงทุกซีซั่น)\n  - ป่า: Aoi, Nakroth, Yan, Keera (คล่องตัว ยึดเกมไว)\n  - แครี่: Stuart, Violet, Hayate (ยิงแม่น ยืนโซนดี)\n\n• **Valorant**:\n  - Duelist: Reyna, Jett (ยิงคม แบกทีม)\n  - Initiator: Sova, Fade (เปิดข้อมูลแผนที่)\n  - Controller: Omen, Viper (คุมควัน ปิดทางเดิน)\n\nสนใจเติมคูปองหรือ VP ไปปลดล็อกสกิน/ตัวละครไหมครับ ร้านเราเติมไวใน 1-3 วิเลยนะ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เติม ROV', 'เติม Valorant', 'โปรโมชั่นวันนี้']
      };
    }

    if (lower.includes('แนะนำเกม') || lower.includes('เล่นเกมอะไรดี') || lower.includes('เกมสนุกๆ')) {
      return {
        text: `🕹️ **เกมฮิตติดเทรนด์แนะนำช่วงนี้:**\n\n1. **Roblox**: หลากหลายแนวสุดๆ แนะนำ *Blox Fruits*, *Adopt Me*, *Pet Simulator 99*, *Dress to Impress*\n2. **Valorant / CS2**: แนว FPS ยิงเชิงกลยุทธ์ วัดความแม่นและความไวของสมอง\n3. **ROV / LoL**: แนว MOBA เล่นกับเพื่อน มันส์และหัวร้อนสะใจ\n4. **Genshin Impact / Honkai: Star Rail**: แนวเนื้อเรื่อง กาชา ภาพสวยอลังการ\n\nคุณ ${name} ชอบเล่นแนวไหนเป็นพิเศษไหมครับ บอกได้เลยนะ เดี๋ยวผมแนะนำเพิ่มให้!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เติม Roblox (Robux)', 'เติม ROV', 'เติม Valorant']
      };
    }

    // --- CATEGORY 4: Technical & Troubleshooting ---
    if (lower.includes('เน็ตหลุด') || lower.includes('ปิงสูง') || lower.includes('เกมแลค') || lower.includes('กระตุก') || lower.includes('จอดำ') || lower.includes('fps ตก') || lower.includes('เข้าเกมไม่ได้')) {
      return {
        text: `🛠️ **วิธีแก้ไขปัญหาเน็ตหลุด / ปิงสูง / เกมกระตุกเบื้องต้น:**\n\n1. **สลับสัญญาณเน็ต**: หากใช้ Wi-Fi ลองรีสตาร์ท Router หรือสลับมาใช้เน็ตมือถือ 4G/5G ชั่วคราว\n2. **เปลี่ยน DNS**: ลองเปลี่ยน DNS ของเครื่องเป็น Google DNS (\`8.8.8.8\` / \`8.8.4.4\`) หรือ Cloudflare (\`1.1.1.1\`)\n3. **ปิดแอปเบื้องหลัง**: ปิดแท็บเบราว์เซอร์หรือแอปที่โหลดไฟล์/สตรีมมิ่งทิ้งไว้\n4. **ปรับกราฟิกในเกม**: ปรับคุณภาพกราฟิกเป็น Low/Medium และเปิดโหมด High Frame Rate (60fps/120fps)\n5. **เคลียร์แคช (Clear Cache)**: เข้าการตั้งค่าแอปในเครื่องแล้วล้างแคชของตัวเกม\n\nลองทำดูแล้วได้ผลยังไงบ้าง บอกผมได้นะครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['คุยกับแอดมินคนจริง', 'วิธีเติมเกม']
      };
    }

    // --- CATEGORY 5: Store Trust, Safety & Policies ---
    if (lower.includes('โกง') || lower.includes('ปลอดภัย') || lower.includes('เชื่อถือ') || lower.includes('ทำไมถูก') || lower.includes('โดนแบน') || lower.includes('แบนไหม') || lower.includes('จริงไหม')) {
      return {
        text: `🛡️ **ความปลอดภัยและความน่าเชื่อถือของร้าน BOOSTUP:**\n\n✅ **ปลอดภัย 100% ไม่โดนแบน**: ระบบเชื่อมต่อยิงตรงกับตัวแทนลิขสิทธิ์ API อย่างเป็นทางการ ถูกต้องตามกฎของทุกเกม\n✅ **ไม่ขอรหัสผ่าน (Password)**: ทุกเกมใช้เพียง Username หรือ Player ID (UID) เท่านั้น ปลอดภัยต่อไอดีของคุณลูกค้าสูงสุด\n✅ **ได้รับยอดทันที**: ระบบอัตโนมัติ 24 ชม. หลังชำระเงินเรียบร้อย ยอดจะเข้าบัญชีเกมภายใน 1-3 วินาที\n✅ **มีแอดมินคนจริงดูแล**: หากเกิดข้อผิดพลาดใดๆ มีทีมงานตรวจสอบและพร้อมคืนเงินเต็มจำนวนทันทีครับ!\n\nสบายใจได้เลยครับ คุณลูกค้าไว้ใจร้านเราได้เต็มที่แน่นอนครับ! 🙏💎`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เติม Roblox (Robux)', 'วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    if (lower.includes('หน้าร้าน') || lower.includes('เปิดมากี่ปี') || lower.includes('ติดต่อ') || lower.includes('เบอร์')) {
      return {
        text: `🏢 **ข้อมูลเกี่ยวกับร้าน BOOSTUP:**\n\n• เราคือแพลตฟอร์มเติมเกมอัตโนมัติออนไลน์ 24 ชั่วโมง ให้บริการลูกค้ามาแล้วหลายหมื่นออเดอร์ทั่วประเทศ\n• **เว็บไซต์หลัก**: [www.boostup-game.online](https://www.boostup-game.online)\n• **LINE Official**: แอดไลน์คุยกับทีมงานได้ที่ไอดีที่ระบุด้านบน\n• **Live Chat**: กดปุ่ม **"ติดต่อแอดมินคนจริง"** ในหน้านี้เพื่อคุยกับเจ้าหน้าที่ได้ตลอดเวลาครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['ติดต่อแอดมินคนจริง', 'โปรโมชั่นวันนี้']
      };
    }

    if (lower.includes('โปรโมชั่น') || lower.includes('ส่วนลด') || lower.includes('คูปอง') || lower.includes('โค้ด') || lower.includes('ลดราคา')) {
      return {
        text: `🎉 **โปรโมชั่นและสิทธิพิเศษปัจจุบัน:**\n\n1. **ดีล Flash Sale**: มีแพ็กเกจลดราคาสุดพิเศษหมุนเวียนทุกวัน ตรวจสอบได้ที่หน้าแรกของร้านค้า\n2. **คูปองส่วนลด**: ลูกค้าสามารถนำโค้ดส่วนลดมากรอกในขั้นตอนชำระเงินเพื่อรับส่วนลดทันที\n3. **สมาชิก BOOSTUP**: เติมเงินเก็บไว้ในกระเป๋า Wallet ได้รับความสะดวก รวดเร็ว และสิทธิพิเศษในกิจกรรมต่างๆ มากมาย!\n\nติดตามโปรเด็ดๆ ได้ที่หน้าแรกเลยครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เติม Roblox (Robux)', 'วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // --- CATEGORY 6: Store Game Inquiries ---
    // Roblox / Robux
    if (lower.includes('roblox') || lower.includes('robux') || lower.includes('โรบล็อก') || lower.includes('โรบัก') || lower.includes('โรบักส์')) {
      return {
        text: `🔥 **บริการเติม Roblox (Robux) ร้าน BOOSTUP:**\n\n• **ระบบเติม**: เติมผ่าน **Username (ชื่อผู้ใช้)** ได้โดยตรง ปลอดภัย 100% ไม่ต้องใช้รหัสผ่าน (Password) และไม่ต้องขอ OTP\n• **เรตราคา**: คุ้มค่า มีแพ็กเกจตั้งแต่ 80 Robux ถึง 10,000 Robux (VIP Pack)\n• **ระยะเวลา**: เฉลี่ย 1-3 วินาที เติมเข้าทันทีหลังชำระเงินเรียบร้อย\n\n💡 *ข้อแนะนำ: กรุณากรอก Username ในโปรไฟล์ (ไม่ใช่ Display Name) เพื่อให้ระบบส่ง Robux เข้าไอดีได้อย่างถูกต้องครับ!*`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'เช็คสถานะออเดอร์', 'ติดต่อแอดมินคนจริง']
      };
    }

    // ROV
    if (lower.includes('rov') || lower.includes('อาร์โอวี') || lower.includes('คูปอง rov')) {
      return {
        text: `⚔️ **บริการเติมเกม ROV (Realm of Valor):**\n\n• **ระบบเติม**: ใช้เพียง **OpenID / Player ID** จากในเกม ไม่ขอรหัสผ่าน ปลอดภัย 100%\n• **วิธีดู OpenID**: เข้าเกม ROV > กดที่รูปโปรไฟล์มุมซ้ายบน > เลือกแท็บข้อมูลตัวละคร > คัดลอก OpenID\n• **ความไว**: ยิง API เข้าคูปองอัตโนมัติ 24 ชม. ภายใน 1-3 วินาทีครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // Free Fire
    if (lower.includes('free fire') || lower.includes('freefire') || lower.includes('ฟีฟาย') || lower.includes('เพชรฟีฟาย')) {
      return {
        text: `⚡ **บริการเติมเกม Free Fire:**\n\n• **ระบบเติม**: ใช้เพียง **Player ID (UID)** ตัวเลข 8-10 หลักใต้ชื่อตัวละคร\n• **แพ็กเกจ**: มีทั้งเพชรรายสัปดาห์ / รายเดือน และเพชรปกติ เติมเข้าทันทีใน 1 วิ ได้รับโบนัสเพชรจุใจ\n• ไม่ต้องใช้รหัสผ่าน ปลอดภัย ไม่โดนแบน 100% ครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // Valorant
    if (lower.includes('valorant') || lower.includes('วาโล') || lower.includes('vp')) {
      return {
        text: `🎯 **บริการเติมเกม Valorant (VP - Valorant Points):**\n\n• **ระบบเติม**: ใช้ **Riot ID พร้อม Tagline** เช่น \`Player#TH1\`\n• **เรตพิเศษ**: ถูกกว่าเติมตรงในเกม มีแพ็กเกจ 475 VP ถึง 5,350 VP\n• ส่งเข้าบัญชี Riot โดยตรงใน 1-3 วินาทีครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // Genshin
    if (lower.includes('genshin') || lower.includes('เกนชิน') || lower.includes('ไพโมเจม') || lower.includes('primogem')) {
      return {
        text: `✨ **บริการเติมเกม Genshin Impact:**\n\n• **ระบบเติม**: ใช้เพียง **UID** และเลือก **Server (เช่น Asia)**\n• **แพ็กเกจ**: พรแห่งดวงจันทร์ (Blessing of the Welkin Moon) และ Genesis Crystals โบนัส x2 สำหรับการเติมครั้งแรก\n• ปลอดภัย 100% ไม่ต้องให้รหัสผ่านครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // Payment Methods
    if (lower.includes('ชำระเงิน') || lower.includes('จ่ายเงิน') || lower.includes('โอนเงิน') || lower.includes('ช่องทาง') || lower.includes('พร้อมเพย์') || lower.includes('true money') || lower.includes('ทรูมันนี่')) {
      return {
        text: `💳 **ช่องทางการชำระเงินที่ร้าน BOOSTUP รองรับ:**\n\n1. **พร้อมเพย์ (PromptPay QR Code)**: สแกนจ่ายผ่าน Mobile Banking ทุกธนาคาร ฟรีค่าธรรมเนียม ตรวจสอบยอดออโต้วินาทีต่อวินาที\n2. **โอนผ่านบัญชีธนาคาร (Bank Transfer)**: โอนเข้าบัญชีร้านแล้วแนบสลิป แอดมินตรวจสอบและอนุมัติยอดไว\n3. **ซองของขวัญ TrueMoney**: สร้างลิงก์ซองอั่งเปาในแอป TrueMoney แล้วนำลิงก์มากรอก เงินเข้าทันที\n4. **กระเป๋าเงินสมาชิก (Wallet)**: เติมเงินเก็บไว้ในบัญชี แล้วกดซื้อได้ทันที ไม่ต้องสแกนบ่อยครับ`,
        shouldHandoffToHuman: false,
        suggestedChips: ['ซองของขวัญทำไง', 'เงินไม่เข้าทำไง', 'ติดต่อแอดมินคนจริง']
      };
    }

    // Payment Issues
    if (lower.includes('ไม่เข้า') || lower.includes('เงินไม่เข้า') || lower.includes('สลิป') || lower.includes('โอนแล้ว') || lower.includes('ยอดไม่ปรับ') || lower.includes('ติดปัญหา')) {
      return {
        text: `⚠️ **พบปัญหาการชำระเงินหรือยอดไม่เข้าใช่ไหมครับ?**\n\nไม่ต้องกังวลนะครับ ทางร้านมีระบบรับประกัน 100%:\n\n1. **หากโอนเงินแนบสลิป**: แอดมินกำลังตรวจสอบความถูกต้องของสลิปและยอดเงิน จะอนุมัติให้ภายในไม่กี่นาทีครับ\n2. **หากสแกน QR พร้อมเพย์**: ปกติยอดจะตัดออโต้ทันที หากยอดไม่อัปเดต กรุณาแจ้งเลขออเดอร์หรือแนบหลักฐานสลิปไว้ในแชทนี้ได้เลยครับ\n\n👨‍💼 **ต้องการให้แอดมินตรวจสอบทันที**: กดปุ่ม **"ติดต่อแอดมินคนจริง"** ด้านบนได้เลยครับ เจ้าหน้าที่จะรีบเข้ามาเช็คให้ครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['ติดต่อแอดมินคนจริง', 'เช็คสถานะออเดอร์']
      };
    }

    // TrueMoney Gift Link Guide
    if (lower.includes('ซองของขวัญ') || lower.includes('อั่งเปา') || lower.includes('ทรูมันนี่วอลเล็ท')) {
      return {
        text: `🎁 **วิธีสร้างซองของขวัญ TrueMoney:**\n\n1. เปิดแอป **TrueMoney Wallet**\n2. ไปที่เมนู **"ส่งซองของขวัญ" (โอนเงินด้วยซองของขวัญ)**\n3. กรอกจำนวนเงินให้ตรงกับยอดชำระ\n4. เลือกประเภทการแบ่ง: **"สุ่มจำนวนเงิน"** หรือ **"แบ่งเท่ากัน"** ใส่จำนวนผู้รับ **1 คน**\n5. กดยืนยัน แล้วคัดลอก **ลิงก์ซองของขวัญ** (https://gift.truemoney.com/...)\n6. นำลิงก์มากรอกในหน้าสั่งซื้อ เงินจะตัดและเติมเกมให้อัตโนมัติทันทีครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // Greetings
    if (lower.includes('สวัสดี') || lower.includes('ดีครับ') || lower.includes('ดีค่ะ') || lower.includes('hello') || lower.includes('hi') || lower === 'หวัดดี' || lower === 'ฮัลโหล') {
      return {
        text: `สวัสดีครับคุณ ${name}! 🙏 ยินดีต้อนรับสู่ **BOOSTUP ร้านเติมเกมอัตโนมัติ 24 ชม.** ครับ 🤖\n\nผมคือ **BOOSTUP AI Assistant** พร้อมพูดคุย ให้คำแนะนำเรื่องเกม และดูแลลูกค้าตลอด 24 ชั่วโมงครับ คุณ ${name} สามารถถามผมได้ทุกเรื่องเลยนะ ไม่ว่าจะเป็น:\n• สอบถามวิธีเติมเกม / เรตราคา / โปรโมชั่น\n• แนะนำเทคนิคและเมต้าการเล่นเกม\n• ชวนคุยเล่น คลายเครียด ขอมุกตลก\n• ตรวจสอบสถานะออเดอร์\n\nหรือหากต้องการคุยกับคนจริง สามารถกดปุ่ม **"ติดต่อแอดมินคนจริง"** ด้านบนได้ตลอดเวลาครับ!`,
        shouldHandoffToHuman: false,
        suggestedChips: ['เติม Roblox (Robux)', 'เล่าเรื่องตลก', 'วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
      };
    }

    // --- CATEGORY 7: Open-Ended Smart Conversational Fallback ---
    return {
      text: `รับทราบข้อความครับคุณ ${name}! 💡\n\nเรื่องที่คุณถามน่าสนใจมากเลยครับ! ในฐานะ AI ประจำร้าน BOOSTUP ผมพร้อมพูดคุย ให้คำแนะนำ และให้ความช่วยเหลือในทุกเรื่องเสมอครับ\n\nคุณลูกค้าต้องการให้ผมช่วยดูเรื่องไหนเป็นพิเศษไหมครับ เช่น แนะนำเกม, เทคนิคการเล่น, วิธีเติมเงิน, หรืออยากให้ส่งเรื่องต่อให้ **แอดมินคนจริง** เข้ามาดูแล สามารถกดปุ่มด้านบนได้เลยนะครับ! 😊`,
      shouldHandoffToHuman: false,
      suggestedChips: ['เล่าเรื่องตลก', 'เติม Roblox (Robux)', 'วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
    };
  }

  /**
   * Helper to check if user is asking to speak with a human
   */
  isRequestingHuman(text) {
    const keywords = [
      'คนจริง',
      'คุยกับคน',
      'ติดต่อคน',
      'คุยกับแอดมิน',
      'แอดมินคนจริง',
      'ขอคุยกับคน',
      'พนักงาน',
      'เจ้าหน้าที่',
      'ต้องการคุยกับเจ้าหน้าที่',
      'ติดต่อเจ้าหน้าที่',
      'ขอแอดมิน',
      'ขอคุยกับแอดมิน',
      'call admin',
      'human',
      'agent'
    ];
    return keywords.some(k => text.includes(k));
  }

  /**
   * Helper to format an order lookup response
   */
  formatOrderLookupReply(order, isLatest = false) {
    const statusThai = order.topupStatus === 'completed'
      ? '✅ เติมเงินสำเร็จเรียบร้อยแล้ว'
      : order.topupStatus === 'processing'
      ? '⏳ กำลังส่งคำสั่งเติมเงินเข้าเกม (เฉลี่ย 1-3 วินาที)'
      : order.topupStatus === 'failed'
      ? '❌ รายการติดขัด (ระบบกำลังตรวจสอบ/รอดำเนินการซ้ำ)'
      : 'รอดำเนินการ';

    const paymentStatusThai = order.paymentStatus === 'paid'
      ? 'ชำระเงินแล้ว ✓'
      : 'รอชำระเงิน';

    return {
      text: `📦 **ข้อมูลสถานะคำสั่งซื้อ ${isLatest ? '(ล่าสุดของคุณ)' : ''}**\n\n• **เลขออเดอร์**: \`${order.orderNumber || order.id}\`\n• **สินค้า/เกม**: ${order.gameName || order.itemTitle || 'เติมเกมออนไลน์'}\n• **แพ็กเกจ**: ${order.packageName || '-'}\n• **ยอดเงิน**: ฿${(order.finalAmount || order.price || 0).toLocaleString()} บาท\n• **สถานะการชำระ**: ${paymentStatusThai}\n• **สถานะการเติมเกม**: ${statusThai}\n• **เวลาที่ทำรายการ**: ${new Date(order.createdAt).toLocaleString('th-TH')}\n\nหากต้องการสอบถามเพิ่มเติมเกี่ยวกับออเดอร์นี้ สามารถกดปุ่ม **"ติดต่อแอดมินคนจริง"** ได้เลยครับ!`,
      shouldHandoffToHuman: false,
      suggestedChips: ['วิธีชำระเงิน', 'ติดต่อแอดมินคนจริง']
    };
  }
}

module.exports = new AIChatService();
