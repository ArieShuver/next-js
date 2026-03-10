/**
 * services/inventory-service/index.js — מיקרו-שירות מלאי
 * =========================================================
 * 
 * השירות הזה:
 * - רץ על פורט 4003
 * - יש לו שתי נקודות קצה:
 *     POST /reserve    → שומר מלאי עבור הזמנה
 *     POST /release    → משחרר מלאי שנשמר (פעולה מפצה)
 * 
 * מה זה "שמירת מלאי"?
 * כשמישהו קונה מוצר, צריך "להפריש" (לשמור) את הפריט
 * כדי שאף אחד אחר לא יוכל לקנות אותו. זה כמו שאתה שם
 * משהו בעגלת הקניות באמזון — זה שמור בשבילך זמנית.
 * 
 * למה שתי נקודות קצה?
 * - /reserve: נקרא כשהזמנה מעובדת
 * - /release: נקרא אם משהו משתבש אחר כך (גלגול אחורה של saga)
 *   לדוגמה, אם התשלום נכשל אחרי שהמלאי נשמר,
 *   המתזמר יקרא ל-/release כדי להחזיר את הפריטים.
 * 
 * איך להריץ:
 *   node services/inventory-service/index.js
 *  או
 *   npm run inventory-service
 */

const express = require("express");

const app = express();
app.use(express.json());

// "מסד נתונים" בזיכרון של הזמנות מלאי
const reservations = [];

// ============================================================
// POST /reserve — שמירת מלאי עבור הזמנה
// ============================================================
app.post("/reserve", (req, res) => {
    const { orderId, productId, quantity } = req.body;

    console.log(`📦 [שירות מלאי] שומר ${quantity}x מוצר #${productId} עבור הזמנה ${orderId}...`);

    // יצירת הזמנת מלאי
    const reservation = {
        id: `RES-${Date.now()}`,
        orderId,
        productId,
        quantity: quantity || 1,
        status: "נשמר",
        createdAt: new Date().toISOString(),
    };

    reservations.push(reservation);

    console.log("✅ [שירות מלאי] מלאי נשמר:", reservation.id);
    console.log(`   מוצר #${productId}, כמות: ${quantity || 1}`);
    console.log("---");

    res.status(200).json({
        success: true,
        message: "המלאי נשמר בהצלחה",
        reservation,
    });
});

// ============================================================
// POST /release — שחרור מלאי שנשמר (פעולה מפצה)
// ============================================================
app.post("/release", (req, res) => {
    const { orderId } = req.body;

    const reservation = reservations.find((r) => r.orderId === orderId);

    if (reservation) {
        reservation.status = "שוחרר";
        console.log("📤 [שירות מלאי] מלאי שוחרר עבור הזמנה:", orderId);
        console.log("   (זו פעולה מפצה — החזרת פריטים)");
        console.log("---");
    }

    res.json({ success: true, message: "המלאי שוחרר", orderId });
});

// ============================================================
// הפעלת השרת על פורט 4003
// ============================================================
const PORT = 4003;
app.listen(PORT, () => {
    console.log(`\n🟢 שירות מלאי רץ על http://localhost:${PORT}`);
    console.log("   נקודות קצה:");
    console.log("   POST /reserve  → שמירת מלאי עבור הזמנה");
    console.log("   POST /release  → שחרור מלאי (rollback)\n");
});
