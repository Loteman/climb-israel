---
name: seo-hebrew-optimizer
description: מייצר ומשפר תגיות SEO לאתרים בעברית - OpenGraph, Twitter Cards, מילות מפתח בעברית ממוקדות (Long-tail, כמו "בולדרינג עין כרם" או "נעלי טיפוס למתחילים") ומבנה נתונים Schema.org (LocalBusiness, Article, FAQ) כדי לשפר דירוג וחשיפה בגוגל. יש להשתמש בסקיל הזה בכל פעם שיוצרים או עורכים דף נחיתה, מוסיפים תוכן חדש, או כשמבקשים "לקדם את האתר בגוגל" / "לשפר SEO".
---

# אופטימיזציית SEO לאתר בעברית

## 1. Title ו-Meta Description

- **Title**: עד כ-60 תווים, כולל מילת המפתח העיקרית קרוב להתחלה + שם המותג/האתר בסוף (`מילת מפתח | שם האתר`).
- **Meta description**: 120-155 תווים, תיאור מזמין שמכיל את מילת המפתח באופן טבעי - זה לא משפיע ישירות על הדירוג אבל משפיע מאוד על שיעור הקליקים (CTR) בתוצאות החיפוש.
- כל עמוד צריך title ו-description **ייחודיים** - לא להעתיק את אותו תיאור לכל העמודים.

## 2. מילות מפתח בעברית - Long-tail

עברית מאפשרת ניסוחים טבעיים שאנשים באמת מחפשים. העדף ביטויים ספציפיים על פני מילים גנריות:

- גנרי וחלש: "טיפוס", "בולדרינג"
- ספציפי וחזק (long-tail): "בולדרינג עין כרם", "נעלי טיפוס למתחילים", "אולם בולדרינג פתוח בשבת", "שיעור טיפוס ראשון לילדים"

שלב את מילות המפתח הספציפיות בכותרות (H1/H2), ב-URL, ב-alt של תמונות, ובפסקה הראשונה של התוכן - בצורה טבעית, לא בדחיסה מלאכותית (keyword stuffing, שגוגל מעניש).

## 3. תגיות OpenGraph ו-Twitter Card

תבנית בסיסית שיש לכלול בכל עמוד ב-`<head>`:

```html
<meta property="og:title" content="כותרת קצרה ומושכת" />
<meta property="og:description" content="תיאור קצר, 2-3 משפטים" />
<meta property="og:image" content="https://example.com/path/to/image.jpg" />
<meta property="og:url" content="https://example.com/current-page" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="he_IL" />
<meta name="twitter:card" content="summary_large_image" />
```

- תמונת ה-og:image צריכה להיות לפחות 1200x630px כדי להיראות טוב בשיתופים בוואטסאפ/פייסבוק.
- ודא שה-URL בתגיות הוא מלא (עם https://) ולא יחסי.

## 4. Schema.org (Structured Data / JSON-LD)

הטמע כ-`<script type="application/ld+json">` ב-`<head>`. זה עוזר לגוגל להבין את המבנה (ולפעמים להציג Rich Results כמו כוכבי דירוג, שעות פתיחה בתוצאת החיפוש עצמה).

**LocalBusiness** (לאולם בולדרינג / עסק פיזי):

```json
{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": "שם האולם",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "רחוב ומספר",
    "addressLocality": "עיר",
    "addressCountry": "IL"
  },
  "telephone": "+972-...",
  "openingHours": ["Su-Th 09:00-23:00", "Fr 09:00-15:00"],
  "url": "https://example.com"
}
```

**Article** (לכתבה/פוסט):

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "כותרת הכתבה",
  "datePublished": "2026-01-01",
  "author": { "@type": "Person", "name": "שם הכותב" }
}
```

**FAQPage** (לשאלות נפוצות - יכול להופיע ישירות בתוצאות החיפוש):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "האם צריך ניסיון קודם לבולדרינג?",
    "acceptedAnswer": { "@type": "Answer", "text": "לא, מתאים גם למתחילים לחלוטין." }
  }]
}
```

בחר את סוג ה-Schema המתאים לתוכן העמוד - אל תוסיף LocalBusiness לכתבה או Article לעמוד "צור קשר".

## 5. בדיקה לפני מסירה

- [ ] title/description ייחודיים ובאורך הנכון
- [ ] מילות מפתח ספציפיות (long-tail) בעברית, לא רק מונחים גנריים
- [ ] תגיות OpenGraph מלאות כולל תמונה בגודל תקין
- [ ] Schema.org מהסוג הנכון לתוכן העמוד, ותקין מבחינת JSON (בדוק עם [Rich Results Test](https://search.google.com/test/rich-results) אם יש גישה)
- [ ] כל תמונה עם `alt` תיאורי בעברית
