/**
 * app/layout.js — תבנית ראשית (ROOT LAYOUT)
 * ============================================
 * 
 * מה זה תבנית (Layout)?
 * תבנית עוטפת את כל הדפים באפליקציה.
 * תחשבו על זה כמו מסגרת לתמונה — המסגרת נשארת אותו דבר,
 * אבל התמונה בפנים משתנה כשמנווטים לדף אחר.
 * 
 * זהו קומפוננט שרת (SERVER COMPONENT) — ברירת המחדל ב-App Router.
 * קומפוננטי שרת רצים על השרת, לא בדפדפן.
 * הם מעולים לדברים שלא צריכים אינטראקציה עם המשתמש.
 * 
 * מה יש בפנים?
 * - תגיות <html> ו-<body> (חובה!)
 * - סרגל ניווט (מופיע בכל דף)
 * - פוטר (מופיע בכל דף)
 * - {children} = כל דף שהמשתמש צופה בו כרגע
 */

// ייבוא הסגנונות הגלובליים שלנו
import "./globals.css";

// האובייקט metadata מגדיר את כותרת הדף והתיאור
// Next.js משתמש בזה ליצירת תגיות <title> ו-<meta> אוטומטית
export const metadata = {
    title: "לומדים Next.js ומיקרו-שירותים",
    description:
        "פרויקט ידידותי למתחילים ללמוד Next.js App Router, מיקרו-שירותים ותבנית ה-Saga",
};

/**
 * קומפוננט RootLayout
 * --------------------
 * זהו הקומפוננט העליון ביותר שעוטף כל דף.
 * ה-prop {children} מתמלא אוטומטית ע"י Next.js
 * עם כל דף שהמשתמש צופה בו כרגע.
 */
export default function RootLayout({ children }) {
    return (
        <html lang="he" dir="rtl">
            <body>
                {/* ====== סרגל ניווט ====== */}
                {/* זה מופיע בראש כל דף */}
                <nav className="navbar">
                    <a href="/" className="navbar-brand">
                        🚀 אפליקציית לימוד
                    </a>
                    <ul className="navbar-links">
                        <li>
                            <a href="/">דף הבית</a>
                        </li>
                        <li>
                            <a href="/products">מוצרים</a>
                        </li>
                        <li>
                            <a href="/orders">יצירת הזמנה</a>
                        </li>
                    </ul>
                </nav>

                {/* ====== תוכן הדף ====== */}
                {/* כאן מופיע התוכן של הדף הנוכחי */}
                <main className="page-container">{children}</main>

                {/* ====== פוטר ====== */}
                <footer className="footer">
                    נבנה ללמידה • Next.js + מיקרו-שירותים + תבנית Saga
                </footer>
            </body>
        </html>
    );
}
