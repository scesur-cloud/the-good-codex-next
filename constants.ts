
import { PhaseTemplate, TaskStatus } from './types';

export const ROLES = [
  {
    id: 'GM_PM',
    name: 'GM / PM (Genel Müdür / Program Yöneticisi)',
    definition: 'Projenin anayasasından, ROI hedeflerinden ve tüm fazların (M1-M10) nihai onayından sorumlu Level 10 otorite.',
    isAccountable: true,
    authorityLevel: 10
  },
  {
    id: 'PSYCHO_STRATEGIST',
    name: 'Psycho Strategist',
    definition: 'Bilinçaltı bariyerleri, gölge yan analizi ve duygusal tetikleyici kütüphanesinden sorumlu uzman.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'MARKET_INTEL_ANALYST',
    name: 'Market Intel Analyst',
    definition: 'Pazar boşlukları, rakip kopyalama riskleri ve Blue Ocean fiyatlama stratejisi uzmanı.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'COMPLIANCE_OFFICER',
    name: 'Compliance Officer (Uyum Sorumlusu)',
    definition: 'KVKK, IP (Fikri Mülkiyet) hakları ve platform kısıtlamalarına karşı yasal kalkanları kuran denetçi.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'LEARNING_DESIGNER',
    name: 'Learning Designer (Eğitim Mimarı)',
    definition: 'Kullanıcı yolculuğundaki Aha! momentlarını ve dopamin döngülerini (mikro-kazanımlar) tasarlayan mimar.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'PROMPT_ARCHITECT',
    name: 'Prompt Architect (İstem Mühendisi)',
    definition: 'LLM sistemlerini standartlaştıran, fail-safe mekanizmalarını kuran ve çıktı kalitesini sabitleyen teknik uzman.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'COPY_CHIEF',
    name: 'Copy Chief (Metin Yazarı Lideri)',
    definition: 'Landing page Hero varyantları, future pacing kopyaları ve satış psikolojisinden sorumlu metin yazarı.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'PRICING_ARCHITECT',
    name: 'Pricing Architect (Fiyatlama Mimarı)',
    definition: 'Decoy (çeldirici) modelleri, order bump/upsell kurguları ve sepet psikolojisi uzmanı.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'GROWTH_PLANNER',
    name: 'Growth Planner (Büyüme Planlayıcı)',
    definition: '7 günlük lansman sekansı, trafik akışı ve reklam/içerik dağıtım takviminden sorumlu uzman.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'OPS_DELIVERY',
    name: 'Ops & Delivery (Operasyon Sorumlusu)',
    definition: 'Destek otomasyonları, teslimat sistemleri ve teknik akış şemalarını yöneten süreç lideri.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'ANALYTICS_COACH',
    name: 'Analytics Coach (Veri Koçu)',
    definition: 'KPI takibi, A/B test backlog yönetimi ve veri görselleştirme uzmanı.',
    isAccountable: false,
    authorityLevel: 5
  },
  {
    id: 'QA_GOD',
    name: 'Gatekeeper of Quality (QA God)',
    definition: 'Hattı durdurma yetkisine sahip, artifact doğruluğu ve DoD uyumunu denetleyen en üst kalite otoritesi.',
    isAccountable: false,
    authorityLevel: 7
  }
];

export const STOP_THE_LINE_PROTOCOLS = {
  trigger: "Bir fazda kritik hata, etik risk veya DoD eksikliği tespit edildiğinde üretim derhal durdurulur.",
  decisionMaker: "Nihai Karar: GM/PM (Escalation sonrası 2 saat içinde)",
  steps: [
    { step: 1, action: "Acil Blokaj", detail: "Sorumlu (R) fazı BLOCKED statüsüne çeker ve tüm paydaşlara anlık bildirim gider." },
    { step: 2, action: "Triage Toplantısı", detail: "GM/PM ve QA God, hatayı 'Pivot, Devam veya İptal' seçenekleri üzerinden değerlendirir." },
    { step: 3, action: "Düzeltici Aksiyon", detail: "Blokajı tetikleyen madde için 'Antidote' üretilir ve artifact revize edilir." },
    { step: 4, action: "Yeniden Başlatma", detail: "GM/PM onayı ile hat IN PROGRESS durumuna döner." }
  ]
};

export const FAQ_DATA = [
  {
    category: "Metodoloji",
    question: "The God Codex - İş İndeksi tam olarak nedir?",
    answer: "The God Codex, belirsizliğin operasyonel bir suç olduğu prensibi üzerine kurulu, 10 kritik mesajdan oluşan bir iş yürütme protokolüdür. Fikirden skalaya giden yolu standartlaştırılmış fazlara bölerek kaliteyi ve hızı tesadüften çıkarır."
  },
  {
    category: "Metodoloji",
    question: "Alpha to Omega stratejisi ne anlama geliyor?",
    answer: "Projenin başlangıcındaki stratejik kaostan (Alpha), hatasız işleyen ve optimize edilmiş bir sisteme (Omega) geçişi temsil eder. Faz 0-1 altyapıyı, Faz 2-3 dönüşümü, Faz 4-5 ise ölçeklenebilir operasyonu simgeler."
  },
  {
    category: "Roller & Sorumluluklar",
    question: "Hesap Verebilir (A) ve Sorumlu (R) arasındaki ayrım nedir?",
    answer: "Sorumlu (R), işin mutfağında üretim yapan (specialist) kişidir. Hesap Verebilir (A), işin anayasaya uygunluğunu denetleyen ve GM/PM'e karşı nihai raporu veren kişidir. Bir fazda 'R' birden fazla olabilir ama 'A' tektir."
  },
  {
    category: "Operasyon",
    question: "Handoff (Devir) Protokolü neden 5 zorunlu madde içeriyor?",
    answer: "Handoff, bir fazın çıktılarının (artifact) bir sonraki faza aktarılmasıdır. 5 madde; format uyumu, alıcı bilgilendirmesi, DoD denetimi, versiyonlama ve yönetici özeti içerir. Bu, 'silent handoff' (sessiz devir) hatalarını önlemek için tasarlanmış bir güvenlik mekanizmasıdır."
  },
  {
    category: "Kalite Kontrol (QA)",
    question: "Stop-the-line QA kuralı üretimi ne kadar süre durdurur?",
    answer: "Stop-the-line tetiklendiğinde üretim belirsiz süreliğine durur. GM/PM eskalasyon sonrası en geç 2 saat içinde bir Triage toplantısı düzenlemek zorundadır. Karar (Pivot/Continue/Kill) alınana kadar hat kapalı kalır."
  },
  {
    category: "Yapay Zeka & Teknik",
    question: "Prompt Architect'in (M5) sistemdeki kritik önemi nedir?",
    answer: "Prompt Architect, yapay zeka çıktılarının 'kurumsal zeka' seviyesinde kalmasını sağlar. Fail-safe mekanizmaları kurarak halüsinasyonları engeller ve token maliyetlerini minimize ederek operasyonun finansal sürdürülebilirliğini korur."
  },
  {
    category: "Yapay Zeka & Teknik",
    question: "Görsel Üretim Motoru hangi modelleri kullanır?",
    answer: "Sistem, yüksek kaliteli ve gerçek zamanlı görsel üretimi için gemini-2.5-flash-image modelini kullanır. Bu model, özellikle eğitim materyalleri, slayt arka planları ve sosyal medya içerikleri için optimize edilmiş parametrelerle çalışır."
  },
  {
    category: "Roller & Sorumluluklar",
    question: "GM/PM dışındaki roller 'Done' onayı verebilir mi?",
    answer: "Hayır. God Codex hiyerarşisinde sadece GM/PM (Level 10) veya yetkilendirilmiş QA God 'Done' onayı verebilir. Uzmanlar sadece 'Review' (İnceleme Bekliyor) statüsü talep edebilirler."
  }
];

export const RACI_TABLE = [
  {
    messageId: 'M1',
    phase: 'FAZ 0.1',
    title: 'Psycho Map',
    responsible: 'PSYCHO_STRATEGIST',
    accountable: 'GM_PM',
    handoff: { receiver: 'LEARNING_DESIGNER', artifacts: ['Shadow Audit', 'Hook Library'] },
    dod: '12 gölge yan, nöro-antidotlar ve 3 ana kanca (hook) valide edildi.'
  },
  {
    messageId: 'M2',
    phase: 'FAZ 0.2',
    title: 'Market Intel',
    responsible: 'MARKET_INTEL_ANALYST',
    accountable: 'GM_PM',
    handoff: { receiver: 'PRICING_ARCHITECT', artifacts: ['Gap Analysis', 'Blue Ocean Canvas'] },
    dod: 'Fiyat bantları belirlendi ve USP (Benzersiz Satış Vaadi) rakipsizleştirildi.'
  },
  {
    messageId: 'M3',
    phase: 'FAZ 0.3',
    title: 'Shield',
    responsible: 'COMPLIANCE_OFFICER',
    accountable: 'GM_PM',
    handoff: { receiver: 'OPS_DELIVERY', artifacts: ['Compliance Audit', 'Risk Mitigation Map'] },
    dod: 'KVKK uyumu, IP hakları ve platform risk kalkanları %100 onaylandı.'
  },
  {
    messageId: 'M4',
    phase: 'FAZ 1.1',
    title: 'Aha Map',
    responsible: 'LEARNING_DESIGNER',
    accountable: 'GM_PM',
    handoff: { receiver: 'PROMPT_ARCHITECT', artifacts: ['User Journey', 'Micro-win Durakları'] },
    dod: 'İlk Aha! moment süresi 180 saniyenin altına indirildi.'
  },
  {
    messageId: 'M5',
    phase: 'FAZ 1.3',
    title: 'Prompt Std',
    responsible: 'PROMPT_ARCHITECT',
    accountable: 'GM_PM',
    handoff: { receiver: 'OPS_DELIVERY', artifacts: ['System Prompts', 'Fail-safe Logic'] },
    dod: 'Halüsinasyon testleri yapıldı ve token maliyet optimizasyonu tamamlandı.'
  },
  {
    messageId: 'M6',
    phase: 'FAZ 2.1',
    title: 'Landing v2',
    responsible: 'COPY_CHIEF',
    accountable: 'GM_PM',
    handoff: { receiver: 'GROWTH_PLANNER', artifacts: ['Hero Variants', 'Future Pacing Copy'] },
    dod: '2 Hero varyantı yazıldı ve mobil dönüşüm optimizasyonu yapıldı.'
  },
  {
    messageId: 'M7',
    phase: 'FAZ 2.3',
    title: 'Pricing',
    responsible: 'PRICING_ARCHITECT',
    accountable: 'GM_PM',
    handoff: { receiver: 'GROWTH_PLANNER', artifacts: ['Pricing Matrix', 'Upsell Flow'] },
    dod: 'Decoy fiyatlama, order bump ve sepet terk senaryoları hazır.'
  },
  {
    messageId: 'M8',
    phase: 'FAZ 3',
    title: 'Launch',
    responsible: 'GROWTH_PLANNER',
    accountable: 'GM_PM',
    handoff: { receiver: 'OPS_DELIVERY', artifacts: ['Content Calendar', 'Launch Sequence'] },
    dod: '7 günlük lansman sekansı ve reklam setleri aktif edildi.'
  },
  {
    messageId: 'M9',
    phase: 'FAZ 4',
    title: 'Ops',
    responsible: 'OPS_DELIVERY',
    accountable: 'GM_PM',
    handoff: { receiver: 'ANALYTICS_COACH', artifacts: ['Support Chatbot', 'Delivery Automation'] },
    dod: 'Destek otomasyonu ve teslimat akışı kesintisiz çalışıyor.'
  },
  {
    messageId: 'M10',
    phase: 'FAZ 5',
    title: 'Analytics',
    responsible: 'ANALYTICS_COACH',
    accountable: 'GM_PM',
    handoff: { receiver: 'GM_PM', artifacts: ['KPI Dashboard', 'A/B Test Backlog'] },
    dod: 'Veri pikselleri kurulu, ROI takibi ve iyileştirme backlogu hazır.'
  }
];

export const MESSAGES = RACI_TABLE.map(item => ({
  id: item.messageId,
  phase: item.phase,
  title: item.title,
  description: item.dod
}));

export const PHASE_CHECKLISTS = [
  {
    phase: 'FAZ 0: STRATEJİK KALKANLAR (Alpha)',
    items: [
      { id: 'c1', task: 'M1: Psycho Map (Shadow/Anti/Hooks)', roleId: 'PSYCHO_STRATEGIST', status: TaskStatus.NOT_STARTED },
      { id: 'c2', task: 'M2: Market Intel (Blue Ocean/Gaps)', roleId: 'MARKET_INTEL_ANALYST', status: TaskStatus.NOT_STARTED },
      { id: 'c3', task: 'M3: Shield (KVKK/IP/Risk)', roleId: 'COMPLIANCE_OFFICER', status: TaskStatus.NOT_STARTED }
    ]
  },
  {
    phase: 'FAZ 1: ÜRÜN MİMARİSİ',
    items: [
      { id: 'c4', task: 'M4: Aha Map + Micro-wins', roleId: 'LEARNING_DESIGNER', status: TaskStatus.NOT_STARTED },
      { id: 'c5', task: 'M5: Prompt Standartları (Fail-safes)', roleId: 'PROMPT_ARCHITECT', status: TaskStatus.NOT_STARTED }
    ]
  },
  {
    phase: 'FAZ 2: DÖNÜŞÜM MAKİNESİ',
    items: [
      { id: 'c6', task: 'M6: Landing v2 (2 Hero Variants)', roleId: 'COPY_CHIEF', status: TaskStatus.NOT_STARTED },
      { id: 'c7', task: 'M7: Pricing/Decoy + Upsell Copy', roleId: 'PRICING_ARCHITECT', status: TaskStatus.NOT_STARTED }
    ]
  },
  {
    phase: 'FAZ 3: LANSMAN REAKSİYONU',
    items: [
      { id: 'c8', task: 'M8: Launch Sequence (7 Günlük Sekans)', roleId: 'GROWTH_PLANNER', status: TaskStatus.NOT_STARTED }
    ]
  },
  {
    phase: 'FAZ 4: OPERASYONEL AKIŞ',
    items: [
      { id: 'c9', task: 'M9: Ops (Support + Automation)', roleId: 'OPS_DELIVERY', status: TaskStatus.NOT_STARTED }
    ]
  },
  {
    phase: 'FAZ 5: VERİ VE ÖLÇEK (Omega)',
    items: [
      { id: 'c10', task: 'M10: Analytics + A/B Backlog', roleId: 'ANALYTICS_COACH', status: TaskStatus.NOT_STARTED }
    ]
  }
];

export const PHASE_TEMPLATES: Record<number, PhaseTemplate> = {
  1: {
    phaseTitle: "FAZ 0.1 Psycho Map",
    subtitle: "Shadow + Anti + Hooks + Friction/Antidotes",
    ownerRole: "PSYCHO_STRATEGIST",
    dependencies: [],
    dodItems: [
      "En az 12 gölge yan tanımlandı.",
      "Her gölge yan için ölçülebilir antidot var.",
      "3 ana kanca (hook) psikolojik olarak valide edildi.",
      "Duygusal tetikleyiciler listelendi.",
      "Bilinçaltı bariyerleri haritalandı."
    ],
    artifactSections: ["Shadow Persona Audit", "Neuro-Antidote Matrix", "Hook & Trigger Library"]
  },
  2: {
    phaseTitle: "FAZ 0.2 Market Intel",
    subtitle: "Blue ocean + gaps + price bands",
    ownerRole: "MARKET_INTEL_ANALYST",
    dependencies: [1],
    dodItems: [
      "5 direkt rakip analizi yapıldı.",
      "3 pazar boşluğu (gap) tespiti yapıldı.",
      "Fiyat bantları Blue Ocean modeline göre belirlendi.",
      "USP (Benzersiz Satış Vaadi) dokümante edildi."
    ],
    artifactSections: ["Competitor Gap Analysis", "Price Band Strategy", "Blue Ocean Strategy Canvas"]
  },
  3: {
    phaseTitle: "FAZ 0.3 Shield",
    subtitle: "KVKK/IP/Platform risks",
    ownerRole: "COMPLIANCE_OFFICER",
    dependencies: [1, 2],
    dodItems: [
      "KVKK ve Veri İşleme protokolü hazır.",
      "Fikri Mülkiyet (IP) riskleri denetlendi.",
      "Platform kısıtlama senaryoları (Shadowban vb.) hazır.",
      "Yasal sorumluluk reddi (Disclaimer) metinleri onaylandı."
    ],
    artifactSections: ["Compliance Audit Report", "Operational Risk Shield", "Legal Assets Pack"]
  },
  4: {
    phaseTitle: "FAZ 1.1 Aha Map",
    subtitle: "Aha Moment + Micro-wins logic",
    ownerRole: "LEARNING_DESIGNER",
    dependencies: [1],
    dodItems: [
      "İlk Aha! moment süresi < 180s.",
      "Mikro-kazanım durakları (dopamin döngüleri) tanımlandı.",
      "Kullanıcı başarı kriterleri (Success KPIs) netleştirildi."
    ],
    artifactSections: ["Dopamin Flow Chart", "Micro-win Durak Listesi", "User Success Roadmap"]
  },
  5: {
    phaseTitle: "FAZ 1.3 Prompt Std",
    subtitle: "Prompt standardization + fail-safes",
    ownerRole: "PROMPT_ARCHITECT",
    dependencies: [4],
    dodItems: [
      "Sistem promptları standartlaştırıldı.",
      "Fail-safe (Hata tolerans) mekanizmaları kuruldu.",
      "Halüsinasyon kontrol testleri yapıldı.",
      "Token ve bağlam (context) optimizasyonu tamam."
    ],
    artifactSections: ["System Prompt Library", "Logic Flow & Fail-safe Map", "LLM Validation Report"]
  },
  6: {
    phaseTitle: "FAZ 2.1 Landing v2",
    subtitle: "2 hero variants + future pacing",
    ownerRole: "COPY_CHIEF",
    dependencies: [1, 4],
    dodItems: [
      "2 farklı Hero varyantı A/B testi için hazır.",
      "Future pacing metinleri yazıldı.",
      "Mobil dönüşüm blokları denetlendi.",
      "CTA (Eylem Çağrısı) psikolojisi valide edildi."
    ],
    artifactSections: ["Hero Copy Variants", "Future Pacing Scripts", "Landing Component Brief"]
  },
  7: {
    phaseTitle: "FAZ 2.3 Pricing",
    subtitle: "Decoy + order bump/upsell copy",
    ownerRole: "PRICING_ARCHITECT",
    dependencies: [2, 6],
    dodItems: [
      "Decoy fiyatlama modeli kuruldu.",
      "Order bump teklifi oluşturuldu.",
      "Upsell sayfası satış kopyaları yazıldı.",
      "Sepet terk kurtarma senaryoları hazır."
    ],
    artifactSections: ["Pricing Architecture", "Upsell/Downsell Logic", "Cart Recovery Sequences"]
  },
  8: {
    phaseTitle: "FAZ 3 Launch",
    subtitle: "7 days sequence plan",
    ownerRole: "GROWTH_PLANNER",
    dependencies: [6, 7],
    dodItems: [
      "7 günlük içerik/reklam sekansı hazır.",
      "Lansman özel teklifi netleşti.",
      "Influencer/Ortaklık briefleri hazırlandı.",
      "Trafik akış şeması onaylandı."
    ],
    artifactSections: ["7-Day Content Calendar", "Ad Set Strategy", "Launch Sequence Assets"]
  },
  9: {
    phaseTitle: "FAZ 4 Ops",
    subtitle: "Support + automation flow",
    ownerRole: "OPS_DELIVERY",
    dependencies: [8],
    dodItems: [
      "Destek otomasyonu (Zendesk/Chatbot) hazır.",
      "Teslimat sistemi (Email/App) test edildi.",
      "SOP (Standart Operasyon Prosedürü) yazıldı.",
      "Kriz yönetim protokolü aktif."
    ],
    artifactSections: ["Operational Flow Map", "Support Automation Logic", "Delivery Verification SOP"]
  },
  10: {
    phaseTitle: "FAZ 5 Analytics",
    subtitle: "KPI Dashboard + A/B backlog",
    ownerRole: "ANALYTICS_COACH",
    dependencies: [9],
    dodItems: [
      "Takip pikselleri ve API entegrasyonu tamam.",
      "KPI Dashboard'u (ROI/Conversion) hazır.",
      "A/B test backlogu oluşturuldu.",
      "Veri raporlama kadansı belirlendi."
    ],
    artifactSections: ["KPI Dashboard Setup", "A/B Testing Backlog", "Data Analytics Summary"]
  }
};
