
import { Role } from './types';

export const SEED_ROLES: Role[] = [
    {
        "id": "GM_PM",
        "name": "GM/PM (Genel Müdür / Program Yöneticisi)",
        "definition": "Proje anayasasını koruyan, ROI ve operasyonel teslimat (M1-M10) bütünlüğünden sorumlu, Level 10 yetkisine sahip lider. Kaynak ataması ve risk yönetimini yönetir.",
        "capabilities": ["versiyon", "changelog", "itibar-risk", "kurum-dili", "testing-qa", "platform-risk", "disclaimer", "ogye", "automation", "b2b-satin-alma"],
        "isAccountable": true,
        "authorityLevel": 10,
        "isSystem": true
    },
    {
        "id": "PRODUCT_STRATEGIST",
        "name": "Ürün Stratejisti",
        "definition": "Ürün merdivenini (ascension model) kuran, değer önerisini pazar boşluklarına göre optimize eden ve pazar giriş stratejisini belirleyen mimar.",
        "capabilities": ["content-outline", "b2b-satin-alma", "case-study", "teklif-proposal", "style-guide", "affiliate", "versiyon", "etik"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "PSYCHO_STRATEGIST",
        "name": "Psycho Strategist",
        "definition": "M1 Psycho Map sahibi. Gölge yan analizi, nöro-antidotlar ve duygusal hook kütüphanesini bilimsel temellere dayalı olarak üreten uzman.",
        "capabilities": ["etik", "dm-sales", "itibar-risk", "kurum-dili", "style-guide", "examples-bank", "reels", "prompt-engineering"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "MARKET_INTEL_ANALYST",
        "name": "Market Intel Analyst",
        "definition": "M2 Market Intel sahibi. 5 direkt rakip ve 3 pazar boşluğunu verilerle analiz eden, Blue Ocean stratejisini rakamlarla valide eden analist.",
        "capabilities": ["b2b-satin-alma", "teklif-proposal", "case-study", "affiliate", "odeme", "denetim", "meb", "versiyon"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "COMPLIANCE_OFFICER",
        "name": "Compliance Officer (KVKK/Yasal)",
        "definition": "M3 Shield fazının sahibi; KVKK, IP hakları, telif denetimi ve platform risk kalkanlarını yasal geçerlilikle kuran ve denetleyen uzman.",
        "capabilities": ["kvkk", "telif-ip", "platform-risk", "disclaimer", "etik", "resmi-yazi", "denetim", "isg"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "LEARNING_DESIGNER",
        "name": "Learning Designer",
        "definition": "M4 Aha Map sahibi. Aha! moment süresini 180s altına indiren, dopamin döngüleri ve pedagojik mikro-kazanım duraklarını tasarlayan mimar.",
        "capabilities": ["content-outline", "examples-bank", "style-guide", "rehberlik", "ogretmen-iletisim", "ogye", "meb", "a11y"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "CONTENT_ENGINEER",
        "name": "Content Engineer",
        "definition": "İçerik iskeletini (outline) kuran, modül yapılarını ve örnek çıktı bankasını editoryal standartlara göre üreten içerik mühendisi.",
        "capabilities": ["content-outline", "examples-bank", "kurum-dili", "resmi-yazi", "style-guide", "evrak", "export-zip", "prompt-engineering"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "PROMPT_ARCHITECT",
        "name": "Prompt Architect",
        "definition": "M5 Prompt Std sahibi. Sistem promptlarını standartlaştıran, fail-safe mekanizmaları ve token optimizasyonu ile çıktı kalitesini sabitleyen teknik mimar.",
        "capabilities": ["prompt-engineering", "fail-safe", "model-agnostic", "token-opt", "schema-json", "automation", "testing-qa", "state-model"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "COPY_CHIEF",
        "name": "Copy Chief",
        "definition": "M6 Landing v2 sahibi. Hero varyantlarını, future pacing kopyalarını ve checkout mikro-metinlerini yüksek dönüşüm odaklı yöneten metin lideri.",
        "capabilities": ["dm-sales", "email-sequence", "kurum-dili", "style-guide", "carousel", "case-study", "ig", "etik"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "PRICING_ARCHITECT",
        "name": "Pricing Architect",
        "definition": "M7 Pricing sahibi. Decoy (çeldirici) modelleri, order bump ve upsell psikolojisini kârlılık matrisine göre kurgulayan uzman.",
        "capabilities": ["odeme", "shopier", "gumroad", "b2b-satin-alma", "teklif-proposal", "affiliate", "etik", "versiyon"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "PAYMENT_SPECIALIST",
        "name": "Payment Specialist",
        "definition": "Ödeme geçitlerini (Shopier, Gumroad vb.) kuran, faturalandırma otomasyonlarını yöneten ve finansal mutabakat süreçlerini denetleyen uzman.",
        "capabilities": ["odeme", "shopier", "gumroad", "faturalandirma", "automation", "testing-qa", "b2b-satin-alma"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "CHECKOUT_OPTIMIZER",
        "name": "Checkout Optimizer",
        "definition": "Ödeme sayfasındaki dönüşüm oranlarını (CR) optimize eden, sepet terk stratejilerini kurgulayan ve iade süreçlerini yöneten uzman.",
        "capabilities": ["odeme", "refund", "dm-sales", "email-sequence", "style-guide", "etik", "testing-qa"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "VISUAL_DIRECTOR",
        "name": "Visual Director",
        "definition": "Brand kit ve görsel hiyerarşiyi yöneten, platform-özel (IG/Web) görsel standartları ve tasarım dökümantasyonunu sağlayan yönetici.",
        "capabilities": ["ig", "carousel", "reels", "style-guide", "a11y", "export-zip", "react-ui", "carousel"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "GROWTH_PLANNER",
        "name": "Growth Planner",
        "definition": "M8 Launch sahibi. 7 günlük lansman sekansını, trafik akışını ve 30 günlük içerik/reklam dağıtım takvimini yöneten büyüme uzmanı.",
        "capabilities": ["ig", "reels", "email-sequence", "affiliate", "carousel", "dm-sales", "itibar-risk", "teklif-proposal"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "OPS_DELIVERY",
        "name": "Ops Delivery",
        "definition": "M9 Ops sahibi. Destek otomasyonlarını, teslimat sistemlerini ve dosya/versiyon hijyenini yöneten süreç yöneticisi.",
        "capabilities": ["teslimat", "export-zip", "versiyon", "changelog", "automation", "shopier", "gumroad", "support-sop", "evrak"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "CUSTOMER_SUCCESS",
        "name": "Customer Success",
        "definition": "Önleyici destek SOP'larını kuran, kriz iletişimi metinlerini ve onboarding/aktivasyon akışını yöneten memnuniyet lideri.",
        "capabilities": ["support-sop", "itibar-risk", "veli-iletisim", "kurum-dili", "testing-qa", "ogretmen-iletisim", "rehberlik", "meb"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "ANALYTICS_COACH",
        "name": "Analytics Coach",
        "definition": "M10 Analytics sahibi. KPI dashboard'larını kuran, A/B test backlog'unu yöneten ve hunideki sızıntıları ölçen veri uzmanı.",
        "capabilities": ["testing-qa", "schema-json", "state-model", "automation", "changelog", "token-opt", "versiyon", "denetim"],
        "isAccountable": false,
        "authorityLevel": 5,
        "isSystem": true
    },
    {
        "id": "QA_GOD",
        "name": "Gatekeeper of Quality (QA God)",
        "definition": "Tüm artifact'lerin DoD uyumunu, link/format doğruluğunu ve tutarlılığını bloklayıcı yetkiyle denetleyen en üst kalite otoritesi.",
        "capabilities": ["testing-qa", "a11y", "resmi-yazi", "kurum-dili", "fail-safe", "denetim", "evrak", "changelog", "versiyon"],
        "isAccountable": false,
        "authorityLevel": 7,
        "isSystem": true
    }
];
