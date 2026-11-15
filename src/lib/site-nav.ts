// Shared link data for the header, footer and homepage. All three used to
// keep their own hand-copied lists, which drifted (e.g. the history page
// was reachable only from the About page). Hrefs are root-relative - pass
// them through withBase() when rendering.

export interface NavLink {
  href: string;
  label: string;
}

export interface GuideLink extends NavLink {
  /** Which "מדריכים" sub-group the guide belongs to. */
  level: "beginner" | "deep";
  /** One-line teaser for the homepage card. */
  desc: string;
}

export const BEGINNER_GUIDE: NavLink = {
  href: "/מדריך-למתחילים/",
  label: "מדריך למתחילים",
};

export const GUIDES: GuideLink[] = [
  {
    href: "/אחיזות-טיפוס/",
    label: "אחיזות טיפוס",
    level: "beginner",
    desc: "ג'אג, קרימפ, סלופר, פינץ' ועוד - כל סוגי האחיזות שתפגשו על קיר או על סלע, עם איורים.",
  },
  {
    href: "/מושגי-טיפוס/",
    label: "מושגי טיפוס",
    level: "beginner",
    desc: "בטא, קראקס, דיינו, היל הוק - מילון המונחים שכל מטפס משתמש בו בקיר.",
  },
  {
    href: "/דירוג-מסלולים/",
    label: "דירוג מסלולים",
    level: "beginner",
    desc: "מה זה V4? מה זה 6a? מדריך לסולם ה-V ולסולם הצרפתי, וטבלת השוואה ביניהם.",
  },
  {
    href: "/סגנונות-טיפוס/",
    label: "סגנונות טיפוס",
    level: "deep",
    desc: "מה ההבדל בין בולדרינג, טופ-רופ, הובלה וטראד? מדריך משווה לכל סגנונות הטיפוס.",
  },
  {
    href: "/ציוד-טיפוס/",
    label: "ציוד טיפוס",
    level: "deep",
    desc: "נעליים, מגנזיום, רתמות, חבלים ועד ציוד טראד - מה צריך ולמה.",
  },
  {
    href: "/טכניקות-טיפוס/",
    label: "טכניקות טיפוס",
    level: "deep",
    desc: "עבודת רגליים, דגל ודרופ ני, פיתות, תנועה דינמית - איך לבצע נכון את התנועות שכל מטפס צריך.",
  },
  {
    href: "/מניעת-פציעות/",
    label: "מניעת פציעות",
    level: "deep",
    desc: "חימום נכון, A2 Pulley, מרפק מטפסים ותפיסה בכתף - איך מזהים ומונעים את הפציעות הנפוצות בטיפוס.",
  },
];

export const GUIDE_LEVEL_LABELS: Record<GuideLink["level"], string> = {
  beginner: "מתחילים",
  deep: "מעמיק",
};

export const GUIDE_GROUPS: { label: string; items: NavLink[] }[] = (
  ["beginner", "deep"] as const
).map((level) => ({
  label: GUIDE_LEVEL_LABELS[level],
  items: GUIDES.filter((g) => g.level === level),
}));

export const ENVIRONMENT_LINKS: NavLink[] = [
  { href: "/קיר-טיפוס-מלאכותי/", label: "קיר טיפוס (מלאכותי)" },
  { href: "/טיפוס-בטבע/", label: "טיפוס בטבע" },
];

export const LOCATIONS_LINK: NavLink = { href: "/מקומות-טיפוס/", label: "מקומות טיפוס" };
export const HISTORY_LINK: NavLink = { href: "/היסטוריית-הטיפוס-בישראל/", label: "היסטוריית הטיפוס בישראל" };
export const ABOUT_LINK: NavLink = { href: "/אודות/", label: "אודות" };
export const ACCESSIBILITY_LINK: NavLink = { href: "/הצהרת-נגישות/", label: "הצהרת נגישות" };
export const PRIVACY_LINK: NavLink = { href: "/מדיניות-פרטיות/", label: "מדיניות פרטיות" };

/** The page listing every guide (the "מדריכים" tab of the phone tab bar). */
export const GUIDES_PAGE_LINK: NavLink = { href: "/מדריכים/", label: "מדריכים" };

export interface GuideCard {
  href: string;
  title: string;
  badge: string;
  variant: "rope" | "rust" | "olive";
  desc: string;
}

// Card data shared by the homepage and the guides page.
export const GUIDE_CARDS: GuideCard[] = [
  {
    href: BEGINNER_GUIDE.href,
    title: BEGINNER_GUIDE.label,
    badge: "התחילו כאן",
    variant: "rope",
    desc: "אין לכם ניסיון קודם? הצעד הראשון - מה צריך לעשות, ואיפה כל שאר המדריכים נכנסים לתמונה.",
  },
  ...GUIDES.map((g): GuideCard => ({
    href: g.href,
    title: g.label,
    badge: GUIDE_LEVEL_LABELS[g.level],
    variant: g.level === "beginner" ? "rope" : "rust",
    desc: g.desc,
  })),
];

export const ENVIRONMENT_CARDS: GuideCard[] = [
  {
    href: "/קיר-טיפוס-מלאכותי/",
    title: "קיר טיפוס (מלאכותי)",
    badge: "Wall climbing",
    variant: "rope",
    desc: "הדרך הכי נגישה להתחיל - קיר מלאכותי, ציוד להשכרה, וסביבה מבוקרת.",
  },
  {
    href: "/טיפוס-בטבע/",
    title: "טיפוס בטבע",
    badge: "Rock climbing",
    variant: "olive",
    desc: "סלע אמיתי, ציוד מלא, ואחריות אישית גבוהה יותר. מה שונה ואיך מתכוננים.",
  },
];
