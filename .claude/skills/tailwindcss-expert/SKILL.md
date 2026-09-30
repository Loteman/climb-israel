---
name: tailwindcss-expert
description: מבטיח שקוד Tailwind CSS נכתב בסטנדרט מקצועי גבוה - מבנה קלאסים נכון, תמיכה מלאה ב-RTL (עברית, מימין לשמאל), Responsive design מלא לנייד/טאבלט/דסקטופ, וקלאסים אופטימליים במקום CSS מותאם אישית מיותר. יש להשתמש בסקיל הזה בכל פעם שכותבים, בודקים או מתקנים קוד HTML/JSX עם Tailwind, ובמיוחד באתרים בעברית שבהם כיוון הכתיבה (RTL) קריטי.
---

# מומחה Tailwind CSS (עם דגש RTL)

## 1. RTL - עברית מימין לשמאל

זו הטעות הכי נפוצה בבנייה של אתרים בעברית עם Tailwind: שימוש ב-`ml-4`/`mr-4`/`text-left`/`text-right` "רגילים" שלא מתהפכים כשהדף ב-RTL.

**כלל עבודה:** השתמש בקלאסים לוגיים (logical properties) במקום פיזיים, כדי שהעיצוב יתאים אוטומטית גם ל-RTL וגם ל-LTR:

| במקום (פיזי, שגוי לעברית) | השתמש (לוגי, נכון) |
|---|---|
| `ml-4` | `ms-4` (margin-start) |
| `mr-4` | `me-4` (margin-end) |
| `pl-4` | `ps-4` |
| `pr-4` | `pe-4` |
| `left-0` | `start-0` |
| `right-0` | `end-0` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |

- הגדר `dir="rtl"` על תגית ה-`<html>` (או `<body>` / קונטיינר ראשי) בכל עמוד עברי - זה מה שהופך `start`/`end` לפעול נכון.
- ל-Tailwind v4 קלאסים לוגיים אלו מובנים כברירת מחדל. ב-Tailwind v3 ודא ש-`corePlugins.logicalProperties` לא מבוטל, ובדוק את גרסת הפרויקט לפני שמניחים.
- אייקונים שיש להם כיוון (חץ "הבא", חץ "קדימה") צריכים להתהפך ב-RTL: השתמש ב-`rtl:rotate-180` על האייקון, או בחר אייקון סמנטי (chevron-start/chevron-end) במקום left/right.
- בדוק פריטים שבהם כיוון ה-flex משנה סדר קריאה: `flex-row` הופך אוטומטית כיוון ב-RTL, אבל אם צריך לשמר סדר קבוע (כמו לוגו תמיד ראשון), השתמש ב-`flex-row-reverse` בתנאי `rtl:` או בנה עם `justify-*`/`order-*` מפורש.

## 2. Responsive - Mobile First

Tailwind עובד mobile-first: קלאס בלי prefix חל על הכל, וה-prefix (`sm:` `md:` `lg:` `xl:`) מוסיף/דורס מאותו breakpoint ומעלה.

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

- בנה תמיד קודם את התצוגה לנייד (ללא prefix), ואז הוסף prefixes לגדלים גדולים יותר - לא הפוך.
- breakpoints סטנדרטיים: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.
- לטקסט/רווח שמשתנה בצורה חלקה (לא מדורגת), שקול `clamp()` דרך ה-`theme()`/arbitrary value: `text-[clamp(1rem,2vw,1.5rem)]`, אבל זו לרוב תוספת נקודתית ולא ברירת מחדל.

## 3. קלאסים אופטימליים - לא CSS מותאם אישית

- הימנע מ-`<style>` נפרד או קובצי CSS ידניים כשיש מקבילה ב-Tailwind. שימוש בקלאסים שומר את העיצוב עקבי וניתן לסריקה.
- כשקבוצת קלאסים חוזרת על עצמה בהרבה מקומות (כפתור ראשי, כרטיס), הפוך אותה לקומפוננטה (React/Vue/etc) עם הקלאסים מוטמעים - לא ל-`@apply` ב-CSS נפרד, אלא אם הפרויקט כבר עובד כך.
- הימנע מ-arbitrary values (`w-[327px]`, `text-[#3f51b5]`) כברירת מחדל - הן שוברות את העקביות של design system. השתמש בהן רק כשאין ערך סטנדרטי קרוב מספיק, ועדיף להוסיף את הערך ל-`tailwind.config` (theme.extend) אם הוא חוזר על עצמו.
- סדר קלאסים מומלץ לקריאות: layout (display, position) → box model (width, padding, margin) → טיפוגרפיה → צבע/רקע → מצבים (`hover:` `focus:` `disabled:`) → responsive prefixes.
- השתמש ב-`gap-*` על flex/grid במקום `space-x-*`/`space-y-*` כשאפשר - `gap` תומך ב-RTL נכון מהקופסה, בעוד `space-x-*` דורש טיפול נוסף (`space-x-reverse`).

## 4. בדיקה לפני מסירה

לפני שמסמנים קוד Tailwind כגמור, לוודא:
- [ ] אין `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`/`text-left`/`text-right` שאמורים להיות לוגיים
- [ ] `dir="rtl"` מוגדר בעמוד
- [ ] הפריסה נבדקה גם ברוחב נייד (375px) וגם בדסקטופ
- [ ] אין CSS ידני מיותר שיש לו מקבילה ב-Tailwind
- [ ] אייקונים כיווניים מתהפכים נכון ב-RTL
