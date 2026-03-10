/**
 * services/payment-service/index.js — מיקרו-שירות תשלומים
 * =========================================================
 * 
 * השירות הזה:
 * - רץ על פורט 4002
 * - יש לו שתי נקודות קצה:
 *     POST /charge  → מחייב תשלום (נכשל באקראי ~30% מהזמן!)
 *     POST /refund  → מחזיר תשלום (פעולה מפצה ל-saga)
 * 
 * למה הוא נכשל באקראי?
 * בחיים האמיתיים, תשלומים יכולים להיכשל מסיבות רבות:
 *   - כרטיס אשראי נדחה
 *   - אין יתרה מספקת
 *   - timeout ברשת
 *   - זיהוי הונאה
 * 
 * אנחנו מדמים את זה כדי להדגים איך ה-SAGA מטפל בכשלים.
 * כשתשלום נכשל, המתזמר (orchestrator) צריך "לגלגל אחורה" — לבטל
 * את ההזמנה שכבר נוצרה.
 * 
 * איך להריץ:
 *   node services/payment-service/index.js
 *  או
 *   npm run payment-service
 */

const express = require("express");

const app = express();
app.use(express.json());

// "מסד נתונים" בזיכרון של תשלומים
const payments = [];

// ============================================================
// POST /charge — חיוב תשלום
// ============================================================
app.post("/charge", (req, res) => {
    const { orderId, amount } = req.body;

    console.log(`💳 [שירות תשלומים] מנסה לחייב ₪${amount} עבור הזמנה ${orderId}...`);

    // ====== הדמיית כשל אקראי ======
    // Math.random() מחזיר מספר בין 0 ל-1
    // אם הוא קטן מ-0.3 (סיכוי של 30%), התשלום "נכשל"
    const shouldFail = Math.random() < 0.3;

    if (shouldFail) {
        // התשלום נכשל!
        console.log("❌ [שירות תשלומים] התשלום נכשל! (כרטיס נדחה)");
        console.log("   זה יפעיל גלגול אחורה (ROLLBACK) של ה-SAGA");
        console.log("---");

        return res.status(400).json({
            success: false,
            message: "התשלום נכשל — כרטיס נדחה",
            orderId,
        });
    }

    // התשלום הצליח!
    const payment = {
        id: `PAY-${Date.now()}`,
        orderId,
        amount,
        status: "חויב",
        createdAt: new Date().toISOString(),
    };

    payments.push(payment);

    console.log("✅ [שירות תשלומים] תשלום חויב:", payment.id);
    console.log(`   סכום: ₪${amount}`);
    console.log(`   הזמנה: ${orderId}`);
    console.log("---");

    res.status(200).json({
        success: true,
        message: "התשלום חויב בהצלחה",
        payment,
    });
});

// ============================================================
// POST /refund — החזרת תשלום (פעולה מפצה)
// ============================================================
app.post("/refund", (req, res) => {
    const { orderId } = req.body;

    const payment = payments.find((p) => p.orderId === orderId);

    if (payment) {
        payment.status = "הוחזר";
        console.log("💰 [שירות תשלומים] תשלום הוחזר עבור הזמנה:", orderId);
        console.log("   (זו פעולה מפצה)");
        console.log("---");
    }

    res.json({ success: true, message: "התשלום הוחזר", orderId });
});

// ============================================================
// הפעלת השרת על פורט 4002
// ============================================================
const PORT = 4002;
app.listen(PORT, () => {
    console.log(`\n🟢 שירות תשלומים רץ על http://localhost:${PORT}`);
    console.log("   נקודות קצה:");
    console.log("   POST /charge  → חיוב תשלום (~30% סיכוי כשל)");
    console.log("   POST /refund  → החזרת תשלום (rollback)\n");
});
