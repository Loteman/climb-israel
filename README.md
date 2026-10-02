# טיפוס ישראל

אתר מידע חינמי וקהילתי לטיפוס בישראל — גם טיפוס בקירות מלאכותיים וגם טיפוס בטבע. כולל מדריך למתחילים, אנציקלופדיה של אחיזות/מושגים/סגנונות/ציוד, מדריכי טכניקה ומניעת פציעות, ומדריך קירות טיפוס ואתרי טבע ברחבי הארץ עם מפה אינטראקטיבית.

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
  pages/            ניתוב (כולל נתיבי [slug] דינמיים ו-404)
  lib/              פונקציות עזר משותפות:
    labels.ts         כל התרגומים enum -> עברית (סגנונות, אזורים, קטגוריות)
    site-nav.ts       רשימות הקישורים של התפריט, הפוטר ועמוד הבית
    locations.ts      סינון, חיפוש ויעדי ניווט של מקומות טיפוס
  site-config.ts    כתובת האתר, BASE_PATH, שם האתר וכתובת "צרו קשר"
scripts/
  generate-content.ts  מקור האמת לתוכן - ראו למטה
  generate-icons.mjs   אייקוני PWA ותמונת השיתוף (og-image.png)
```

כדי להוסיף עמוד מדריך חדש לתפריט, לפוטר ולעמוד הבית - מוסיפים אותו פעם אחת ב-`src/lib/site-nav.ts`.

## עבודה עם תוכן

**חשוב:** קבצי ה-markdown בתוך `src/content/` נוצרים אוטומטית ואין לערוך אותם ידנית. מקור האמת היחיד הוא `scripts/generate-content.ts` — שם מוגדרים כל האחיזות, המושגים, הסגנונות, הציוד, המדריכים והמקומות (קירות טיפוס ואתרי טבע) כמערכי אובייקטים ב-TypeScript.

כדי לעדכן תוכן: לערוך את `scripts/generate-content.ts` ואז להריץ:

```bash
npm run gen:content
```

הסקריפט כותב מחדש את כל הקבצים ומוחק קבצי md של ערכים שהוסרו ממנו (למשל קיר טיפוס שנסגר), כך שתיקיות התוכן תמיד משקפות אותו.

## עיצוב ונגישות

- צבעי המותג מוגדרים כטוקנים ב-`src/styles/global.css` (בהיר + כהה). ערכי ה-accent (`rope`, `rust`, `olive`) כוונו לניגודיות WCAG AA (4.5:1 לפחות) גם על רקע הכרטיסים - לבדוק ניגודיות לפני שינוי.
- מצב תצוגה בהיר/כהה נבחר מכפתור "תצוגה" בכותרת (נשמר ב-localStorage); ברירת המחדל עוקבת אחרי הגדרות המכשיר.
- הצהרת הנגישות נמצאת ב-`src/pages/הצהרת-נגישות/` - לעדכן אותה כשמשנים משהו מהותי.

## אייקונים ותמונת שיתוף

```bash
npm run gen:icons
```

מייצר את אייקוני ה-PWA (כולל אייקון maskable מלא) ואת `public/og-image.png` (1200x630) שמוצגת בשיתוף קישורים בוואטסאפ/פייסבוק.

## פיתוח מקומי

```bash
npm install
npm run dev      # שרת פיתוח
npm run check    # בדיקת טיפוסים + סכמות תוכן
npm run build    # בנייה סטטית ל-dist/
```

## פריסה

פריסה אוטומטית ל-GitHub Pages דרך GitHub Actions (`.github/workflows/deploy.yml`) בכל push ל-`main`: בנייה עם `astro build` והעלאה כ-Pages artifact. האתר מוגש תחת הנתיב `/climb-israel/` (`base` ב-`astro.config.mjs`), ללא דומיין מותאם אישית.

## רישיון

התוכן המקורי באתר (טקסטים, איורים ועיצוב) הוא © Loteman Games ומופץ ברישיון [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). הרישיון אינו חל על תכנים של צד שלישי - גיידבוקים וקבצי טופו (`public/guidebooks/`), מידע שמקורו בהתאחדות הטיפוס, באנציקלופדיה של הטיפוס ובמקורות אחרים שמצוינים באתר, אריחי OpenStreetMap וסימני מסחר. פרטים מלאים בעמוד "אודות" באתר (`#license`).

רישיון ה-CC BY-SA חל על התוכן כפי שהוא מתפרסם באתר בלבד. קוד המקור של האתר (רכיבים, תבניות, סקריפטים והגדרות) הוא © Loteman Games, כל הזכויות שמורות, ואינו מורשה לשימוש חוזר.
