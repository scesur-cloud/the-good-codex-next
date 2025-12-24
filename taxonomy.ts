export const SYNONYM_MAP: { pattern: RegExp, tag: string }[] = [
    { pattern: /instagram|ig|reels/i, tag: 'ig' },
    { pattern: /linkedin|li/i, tag: 'linkedin' },
    { pattern: /otomasyon|zapier|make/i, tag: 'automation' },
    { pattern: /fatura|muhasebe/i, tag: 'faturalandirma' },
    { pattern: /tasarım|görsel|banner/i, tag: 'style-guide' },
    { pattern: /kvkk|yasal|hukuk/i, tag: 'kvkk' },
    { pattern: /denetim/i, tag: 'denetim' }
];

export const TAG_WEIGHTS: Record<string, number> = {
    'ig': 2,
    'linkedin': 2,
    'automation': 3,
    'b2b-satin-alma': 3,
    'kvkk': 5,
    'denetim': 4,
    'prompt-engineering': 3
};

export const TAG_GROUPS = [
    { id: 'channels', name: 'Kanallar', tags: ['ig', 'linkedin', 'reels', 'dm-sales', 'email-sequence'] },
    { id: 'domain', name: 'Alan', tags: ['b2b-satin-alma', 'teklif-proposal', 'affiliate', 'odeme', 'faturalandirma'] },
    { id: 'tech', name: 'Teknoloji', tags: ['automation', 'react-ui', 'testing-qa', 'schema-json', 'prompt-engineering', 'token-opt'] },
    { id: 'legal', name: 'Yasal / Uyum', tags: ['kvkk', 'telif-ip', 'platform-risk', 'disclaimer', 'etik', 'resmi-yazi', 'denetim', 'isg'] }
];

export const TAG_DICTIONARY: Record<string, string> = {
    'ig': 'Instagram',
    'linkedin': 'LinkedIn',
    'reels': 'Reels',
    'dm-sales': 'DM Satış',
    'email-sequence': 'E-posta Serisi',
    'b2b-satin-alma': 'B2B Satın Alma',
    'teklif-proposal': 'Teklif Hazırlama',
    'affiliate': 'Affiliate',
    'odeme': 'Ödeme Sistemleri',
    'faturalandirma': 'Faturalandırma',
    'automation': 'Otomasyon',
    'react-ui': 'React UI',
    'testing-qa': 'Test & QA',
    'schema-json': 'Schema JSON',
    'prompt-engineering': 'Prompt Mühendisliği',
    'token-opt': 'Token Optimizasyonu',
    'kvkk': 'KVKK',
    'telif-ip': 'Telif & IP',
    'platform-risk': 'Platform Riski',
    'disclaimer': 'Yasal Uyarı',
    'etik': 'Etik',
    'resmi-yazi': 'Resmi Yazı',
    'denetim': 'Denetim',
    'isg': 'İSG'
};
