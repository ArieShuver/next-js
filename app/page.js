/**
 * app/page.js — דף הבית
 * =======================
 * 
 * זהו קומפוננט שרת (SERVER COMPONENT) ✅
 * (כברירת מחדל, כל הקומפוננטים ב-App Router הם קומפוננטי שרת)
 * 
 * קומפוננטי שרת:
 * - רצים על השרת (לא בדפדפן)
 * - יכולים לגשת ישירות למסדי נתונים, מערכת קבצים וכו'
 * - לא יכולים להשתמש ב-React hooks (כמו useState, useEffect)
 * - לא יכולים לטפל באירועי משתמש (onClick, onChange וכו')
 * - מהירים יותר כי הם לא שולחים JavaScript לדפדפן
 * 
 * מה הדף הזה עושה?
 * מציג אזור ברוכים הבאים וכרטיסי תכונות שמסבירים
 * את מה שהפרויקט הזה מכסה.
 */

export default function HomePage() {
    // מכיוון שזה קומפוננט שרת, הקוד הזה רץ על השרת.
    // הדפדפן מקבל רק את ה-HTML הסופי — בלי JavaScript לקומפוננט הזה!

    return (
        <>
            {/* ====== אזור ראשי ====== */}
            <section className="hero">
                <h1>למד פיתוח Full-Stack</h1>
                <p>
                    פרויקט מעשי להבנת Next.js, ממשקי API, מיקרו-שירותים ותבנית ה-Saga
                    — הכל מוסבר צעד אחר צעד.
                </p>
            </section>

            {/* ====== כרטיסי תכונות ====== */}
            <section className="features-grid">
                <div className="feature-card">
                    <span className="emoji">📄</span>
                    <h3>Next.js App Router</h3>
                    <p>
                        למד איך דפים, תבניות וניתוב עובדים עם ה-App Router המודרני.
                    </p>
                </div>

                <div className="feature-card">
                    <span className="emoji">🔗</span>
                    <h3>נתיבי API</h3>
                    <p>
                        בנה נקודות קצה (endpoints) צד-שרת ישירות בתוך אפליקציית Next.js שלך.
                    </p>
                </div>

                <div className="feature-card">
                    <span className="emoji">🧩</span>
                    <h3>מיקרו-שירותים</h3>
                    <p>
                        הבן איך אפליקציות מפוצלות לשירותים קטנים ועצמאיים.
                    </p>
                </div>

                <div className="feature-card">
                    <span className="emoji">🎭</span>
                    <h3>תבנית Saga</h3>
                    <p>
                        למד איך לתאם בין שירותים מרובים ולטפל בכשלים בצורה חלקה.
                    </p>
                </div>
            </section>
        </>
    );
}
