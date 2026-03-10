/**
 * app/orders/page.js — דף יצירת הזמנה
 * ======================================
 * 
 * זהו קומפוננט לקוח (CLIENT COMPONENT) 🖥️ (שימו לב ל-"use client" למטה)
 * 
 * למה קומפוננט לקוח?
 * כי בדף הזה יש:
 * - טופס (קלט משתמש)
 * - כפתור שליחה (אינטראקציית משתמש)
 * - מצב שמשתנה (תגובת ה-API)
 * כל אלה דורשים שהקומפוננט ירוץ בדפדפן.
 * 
 * איך הצד הקדמי קורא לצד האחורי?
 * אנחנו משתמשים בפונקציית fetch() המובנית כדי לשלוח בקשת POST
 * לנתיב ה-API שלנו בכתובת /api/orders.
 * 
 * התהליך:
 *   משתמש ממלא טופס → לוחץ שלח → fetch("/api/orders", { method: "POST" })
 *   → נתיב ה-API מעבד → מחזיר JSON → אנחנו מציגים את התוצאה
 */

"use client"; // הופך את זה לקומפוננט לקוח

import { useState } from "react";

export default function OrdersPage() {
    // ====== משתני מצב ======
    // הערכים האלה יכולים להשתנות כשהמשתמש מתקשר עם הדף

    const [customerName, setCustomerName] = useState(""); // ערך שדה הטקסט
    const [productId, setProductId] = useState("1"); // מוצר נבחר
    const [quantity, setQuantity] = useState("1"); // כמות
    const [result, setResult] = useState(null); // תגובת ה-API
    const [loading, setLoading] = useState(false); // האם הטופס נשלח?

    /**
     * handleSubmit — נקרא כשהמשתמש לוחץ "צור הזמנה"
     * 
     * כאן הצד הקדמי קורא לצד האחורי:
     * 
     * fetch("/api/orders", {        ← כתובת נתיב ה-API שלנו
     *   method: "POST",             ← שיטת HTTP
     *   headers: { ... },           ← אומר לשרת שאנחנו שולחים JSON
     *   body: JSON.stringify({...}) ← ממיר אובייקט JS למחרוזת JSON
     * })
     */
    const handleSubmit = async (e) => {
        // מונע את שליחת הטופס הרגילה (שהייתה טוענת מחדש את הדף)
        e.preventDefault();

        // מציג מצב טעינה
        setLoading(true);
        setResult(null);

        try {
            // ====== זו הקריאה ל-API ======
            // fetch() שולח בקשת HTTP לנתיב ה-API שלנו
            const response = await fetch("/api/orders", {
                method: "POST", // אנחנו רוצים ליצור משהו, אז משתמשים ב-POST
                headers: {
                    "Content-Type": "application/json", // אומר לשרת: "אני שולח JSON"
                },
                // ממיר את הנתונים שלנו למחרוזת JSON
                body: JSON.stringify({
                    customerName,
                    productId,
                    quantity: parseInt(quantity),
                }),
            });

            // פענוח תגובת ה-JSON מהשרת
            const data = await response.json();

            // שמירת התוצאה כדי שנוכל להציג אותה
            setResult({
                success: response.ok, // true אם הסטטוס הוא 200-299
                data,
            });
        } catch (error) {
            // אם הבקשה נכשלת לחלוטין (שגיאת רשת וכו')
            setResult({
                success: false,
                data: { error: "נכשל בחיבור ל-API" },
            });
        } finally {
            // עוצר את מצב הטעינה לא משנה מה קרה
            setLoading(false);
        }
    };

    return (
        <div className="order-section">
            <h1>📋 צור הזמנה</h1>
            <p>
                הטופס הזה קורא לנתיב ה-API שלנו בכתובת <code>/api/orders</code> באמצעות{" "}
                <code>fetch()</code>.
            </p>

            {/* ====== טופס הזמנה ====== */}
            <form className="order-form" onSubmit={handleSubmit}>
                {/* שדה שם הלקוח */}
                <div className="form-group">
                    <label htmlFor="customerName">שם הלקוח</label>
                    <input
                        type="text"
                        id="customerName"
                        placeholder="הכנס את שמך"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                    />
                </div>

                {/* בחירת מוצר */}
                <div className="form-group">
                    <label htmlFor="productId">מוצר</label>
                    <select
                        id="productId"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                    >
                        <option value="1">🎧 אוזניות אלחוטיות — ₪79.99</option>
                        <option value="2">⌨️ מקלדת מכנית — ₪129.99</option>
                        <option value="3">🔌 מפצל USB-C — ₪49.99</option>
                        <option value="4">💡 תאורת מסך — ₪59.99</option>
                        <option value="5">🖱️ עכבר ארגונומי — ₪39.99</option>
                    </select>
                </div>

                {/* שדה כמות */}
                <div className="form-group">
                    <label htmlFor="quantity">כמות</label>
                    <input
                        type="number"
                        id="quantity"
                        min="1"
                        max="10"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </div>

                {/* כפתור שליחה */}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "⏳ יוצר..." : "🚀 צור הזמנה"}
                </button>
            </form>

            {/* ====== תצוגת תוצאה ====== */}
            {/* מוצג רק אחרי שה-API מגיב */}
            {result && (
                <div className={`order-result ${result.success ? "success" : "error"}`}>
                    <strong>
                        {result.success ? "✅ ההזמנה נוצרה!" : "❌ שגיאה"}
                    </strong>
                    {/* מציג את תגובת ה-JSON הגולמית לצורך לימוד */}
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
