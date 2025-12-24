
export const EDU_LEVELS = [
  {
    id: "okul_oncesi",
    label_tr: "Okul Öncesi",
    default_tags: ["level_okul_oncesi", "play_based", "activity_based", "classroom_management", "inclusion"],
    tag_boost: { "play_based": 1.25, "activity_based": 1.15 }
  },
  {
    id: "ilkokul",
    label_tr: "İlkokul",
    default_tags: ["level_ilkokul", "literacy", "numeracy", "activity_based", "differentiation", "classroom_management"],
    tag_boost: { "literacy": 1.2, "numeracy": 1.15, "differentiation": 1.1 }
  },
  {
    id: "ortaokul",
    label_tr: "Ortaokul",
    default_tags: ["level_ortaokul", "bloom_taxonomy", "project_based", "assessment", "differentiation"],
    tag_boost: { "assessment": 1.15, "project_based": 1.1 }
  },
  {
    id: "lise",
    label_tr: "Lise",
    default_tags: ["level_lise", "bloom_taxonomy", "assessment", "rubric", "exam_prep", "analytics"],
    tag_boost: { "exam_prep": 1.2, "rubric": 1.15, "analytics": 1.1 }
  },
  {
    id: "teacher_training",
    label_tr: "Öğretmen Eğitimi / Hizmet İçi",
    default_tags: ["level_teacher_training", "slides", "curriculum", "lesson_plan", "assessment", "analytics"],
    tag_boost: { "slides": 1.15, "analytics": 1.1 }
  },
  {
    id: "bilsem",
    label_tr: "BİLSEM / Özel Program",
    default_tags: ["level_bilsem", "inquiry_based", "project_based", "bloom_taxonomy", "rubric"],
    tag_boost: { "inquiry_based": 1.2, "project_based": 1.15 }
  }
];

export const EDU_MODES = [
  {
    id: "curriculum",
    label_tr: "Müfredat Tasarımı",
    default_output_packs: ["curriculum_map", "lesson_plan_set", "assessment_pack"]
  },
  {
    id: "lesson_plan",
    label_tr: "Ders Planı",
    default_output_packs: ["lesson_plan_set", "slides_outline", "worksheet_pack"]
  },
  {
    id: "assessment",
    label_tr: "Ölçme-Değerlendirme",
    default_output_packs: ["assessment_pack", "rubric_pack", "question_bank"]
  },
  {
    id: "content_pack",
    label_tr: "İçerik Paketi",
    default_output_packs: ["slides_outline", "worksheet_pack", "activity_cards"]
  },
  {
    id: "compliance_pack",
    label_tr: "Uyum Paketi (MEB/KVKK)",
    default_output_packs: ["kvkk_pack", "official_docs_pack", "audit_prep_pack"]
  }
];
