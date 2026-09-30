# טיפוס ישראל

אתר מידע חינמי וקהילתי לטיפוס בישראל — גם טיפוס אולמות (בולדרינג) וגם טיפוס בטבע. כולל מדריך למתחילים, אנציקלופדיה של אחיזות/מושגים/סגנונות/ציוד, מדריכי טכניקה ומניעת פציעות, ומדריך אולמות ואתרי טבע ברחבי הארץ עם מפה אינטראקטיבית.

אתר חי: [loteman.github.io/climb-israel](https://loteman.github.io/climb-israel/)

## טכנולוגיה

- [Astro](https://astro.build) — אתר סטטי, RTL מלא (`dir="rtl" lang="he"`)
- [Tailwind CSS v4](https://tailwindcss.com) — טוקני עיצוב דרך `@theme` ב-`src/styles/global.css`
- [Preact](https://preactjs.com) — קומפוננטות אינטראקטיביות נקודתיות (`client:load`), כולל מפת [Leaflet](https://leafletjs.com)
- Astro Content Collections (Zod) — כל התוכן מוגדר ומאומת דרך `src/content.config.ts`

## מבנה

```
src/
  content/          תוכן בפועל (md, נוצר אוטומטית - ראו למטה)
  content.config.ts סכמות Zod לכל הקולקציות
  components/       קומפוננטות Astro + Preact islands
  layouts/          תבניות עמוד
  pages/            ניתוב (כולל נתיבי [slug] דינמיים)
  lib/              פונקציות עזר משותפות
scripts/
  generate-content.ts  מקור האמת לתוכן - ראו למטה
```

## עבודה עם תוכן

**חשוב:** קבצי ה-markdown בתוך `src/content/` נוצרים אוטומטית ואין לערוך אותם ידנית. מקור האמת היחיד הוא `scripts/generate-content.ts` — שם מוגדרים כל האחיזות, המושגים, הסגנונות, הציוד, המדריכים והמקומות (אולמות ואתרי טבע) כמערכי אובייקטים ב-TypeScript.

כדי לעדכן תוכן: לערוך את `scripts/generate-content.ts` ואז להריץ:

```bash
npm run gen:content
```

## פיתוח מקומי

```bash
npm install
npm run dev      # שרת פיתוח
npm run check    # בדיקת טיפוסים + סכמות תוכן
npm run build    # בנייה סטטית ל-dist/
```

## פריסה

פריסה אוטומטית ל-GitHub Pages דרך GitHub Actions (`.github/workflows/deploy.yml`) בכל push ל-`main`: בנייה עם `astro build` והעלאה כ-Pages artifact. האתר מוגש תחת הנתיב `/climb-israel/` (`base` ב-`astro.config.mjs`), ללא דומיין מותאם אישית.
