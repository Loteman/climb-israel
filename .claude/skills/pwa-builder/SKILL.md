---
name: pwa-builder
description: הופך אתר רגיל לאפליקציית PWA (Progressive Web App) שאפשר להתקין על iPhone/Android ולהשתמש בה גם בלי חיבור לאינטרנט (Offline), כולל צפייה במידע שמור (כמו קליעות/מסלולים) בשטח בלי קליטה. יש להשתמש בסקיל הזה כשמבקשים הוספת אפשרות התקנה לאתר, תמיכה אופליין, Service Worker, manifest.json, או "להפוך את זה לאפליקציה".
---

# בניית PWA (Progressive Web App)

## 1. Web App Manifest

קובץ `manifest.json` (או `.webmanifest`) בשורש האתר, מקושר מה-`<head>`:

```html
<link rel="manifest" href="/manifest.json" />
```

```json
{
  "name": "שם האפליקציה המלא",
  "short_name": "שם קצר לאייקון",
  "description": "תיאור קצר",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#111111",
  "dir": "rtl",
  "lang": "he",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- `display: "standalone"` הוא מה שגורם לאפליקציה להיפתח בלי סרגל הכתובת של הדפדפן, כמו אפליקציה אמיתית.
- שדה `icons` חייב לכלול לפחות 192x192 ו-512x512 - אלו הגדלים שמערכות ההפעלה דורשות למסך הבית ולמסך הפתיחה (splash screen).
- הוסף גרסת `maskable` לאייקון (עם שוליים בטוחים סביב הלוגו) כדי שאנדרואיד לא יחתוך את הלוגו כשהוא ממסך אותו לצורה עגולה/מרובעת.
- `dir`/`lang` חשובים כאן במיוחד לאתר עברי - הם קובעים איך שם האפליקציה מוצג במסך הבית.

## 2. תמיכה ב-iOS (Safari לא תומך מלא ב-manifest)

Safari/iOS זקוק לתגיות meta נוספות ב-`<head>`, בנוסף למניפסט:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="שם קצר" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

בלי אלו, ב-iOS ה"הוספה למסך הבית" תעבוד באופן חלקי בלבד (בלי אייקון תקין, בלי סטטוס-בר מותאם).

## 3. Service Worker - הבסיס לעבודה אופליין

רשום את ה-Service Worker מה-JS הראשי:

```js
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
```

בתוך `sw.js`, בחר אסטרטגיית caching לפי סוג התוכן:

- **Cache-first** לקבצים סטטיים שכמעט לא משתנים (CSS, JS, אייקונים, פונטים) - טעינה מהירה, ורענון ברקע.
- **Network-first עם fallback ל-cache** לתוכן דינמי (מידע על אולמות, שעות פתיחה, מסלולים) - כדי שהמשתמש יראה תמיד את הגרסה העדכנית כשיש רשת, אבל עדיין יקבל את הגרסה האחרונה שנשמרה כשאין רשת (בדיוק המקרה של "לצפות בקליעות מהשטח בלי קליטה").

```js
const CACHE_NAME = "app-v1";
const STATIC_ASSETS = ["/", "/styles.css", "/app.js", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((res) => res || caches.match("/offline.html")))
  );
});
```

- שנה את `CACHE_NAME` (למשל ל-`app-v2`) בכל פעם שמפרסמים גרסה חדשה, ומחק cache-ים ישנים ב-`activate` event - אחרת משתמשים ייתקעו עם גרסה מיושנת.
- בנה עמוד `offline.html` פשוט שמוצג כשאין רשת וגם אין cache רלוונטי, כדי שלא יראו שגיאת דפדפן גולמית.

## 4. בדיקה

- PWA דורש HTTPS (חוץ מ-`localhost` בפיתוח) - Service Worker לא יירשם על HTTP רגיל.
- בדוק עם Chrome DevTools → Application → Manifest/Service Workers, או עם Lighthouse (טאב Audits) שמריץ בדיקת "Installable" ו-"PWA" מלאה.
- בדוק בפועל: פתח את האתר בנייד, ודא שמופיעה אפשרות "הוסף למסך הבית", התקן, כבה רשת, ופתח את האפליקציה שוב - ודא שהתוכן השמור נטען.

## סדר עבודה מומלץ

1. `manifest.json` + אייקונים בכל הגדלים.
2. תגיות meta ל-iOS.
3. Service Worker בסיסי עם cache לקבצים סטטיים בלבד.
4. הרחבת ה-Service Worker לתמיכה אופליין בנתונים דינמיים (לפי הצורך של האתר).
5. בדיקה עם Lighthouse ובדיקה ידנית של "הוספה למסך הבית".
