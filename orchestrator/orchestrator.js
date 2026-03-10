/**
 * orchestrator/orchestrator.js — מתזמר ה-SAGA
 * ==============================================
 * 
 * ═══════════════════════════════════════════════════
 *  מה זה תבנית ה-SAGA?
 * ═══════════════════════════════════════════════════
 * 
 * SAGA הוא דרך לנהל פעולה מורכבת שמתפרשת על
 * מספר מיקרו-שירותים. במקום טרנזקציה אחת במסד נתונים,
 * ה-saga מפרק את העבודה לשלבים, כאשר לכל שלב יש
 * "פעולה מפצה" (ביטול) למקרה שמשהו נכשל אחר כך.
 * 
 * ═══════════════════════════════════════════════════
 *  מה זה מתזמר (Orchestrator)?
 * ═══════════════════════════════════════════════════
 * 
 * יש שתי דרכים לתאם saga:
 * 
 * 1. מתזמר (ORCHESTRATOR) — מה שאנחנו משתמשים כאן:
 *    - "בוס" מרכזי אחד שמבקר על כל התהליך
 *    - הוא אומר לכל שירות מה לעשות, שלב אחר שלב
 *    - אם משהו נכשל, הוא אומר לשירותים הקודמים לבטל
 *    - כמו מנצח שמכוון תזמורת 🎵
 * 
 * 2. כוריאוגרפיה (CHOREOGRAPHY) — החלופה:
 *    - אין בקר מרכזי
 *    - כל שירות מקשיב לאירועים ומגיב
 *    - כמו רקדנים שמגיבים למוזיקה 💃
 *    - יותר עצמאי אבל יותר קשה לדיבוג
 * 
 * ═══════════════════════════════════════════════════
 *  מה הסקריפט הזה עושה?
 * ═══════════════════════════════════════════════════
 * 
 * הוא מדמה משתמש שמבצע הזמנה:
 * 
 *   שלב 1: יצירת הזמנה    → קורא לשירות הזמנות
 *   שלב 2: חיוב תשלום     → קורא לשירות תשלומים
 *   שלב 3: שמירת מלאי     → קורא לשירות מלאי
 * 
 * אם שלב 2 (תשלום) נכשל:
 *   גלגול אחורה שלב 1: ביטול הזמנה → קורא לשירות הזמנות /cancel-order
 * 
 * אם שלב 3 (מלאי) נכשל:
 *   גלגול אחורה שלב 2: החזרת תשלום → קורא לשירות תשלומים /refund
 *   גלגול אחורה שלב 1: ביטול הזמנה → קורא לשירות הזמנות /cancel-order
 * 
 * ═══════════════════════════════════════════════════
 *  איך להריץ
 * ═══════════════════════════════════════════════════
 * 
 * 1. קודם, הפעל את שלושת המיקרו-שירותים (בטרמינלים נפרדים):
 *      npm run order-service
 *      npm run payment-service
 *      npm run inventory-service
 * 
 * 2. אז הרץ את המתזמר:
 *      npm run orchestrator
 * 
 * 3. צפה בפלט הקונסול כדי לראות את זרימת ה-saga!
 *    הרץ מספר פעמים — לפעמים התשלום ייכשל
 *    ותראה את הגלגול אחורה בפעולה.
 */

// ============================================================
// הגדרות — איפה המיקרו-שירותים שלנו רצים
// ============================================================
const SERVICES = {
    ORDER_SERVICE: "http://localhost:4001",
    PAYMENT_SERVICE: "http://localhost:4002",
    INVENTORY_SERVICE: "http://localhost:4003",
};

// ============================================================
// פונקציית עזר — שליחת בקשות HTTP
// ============================================================
/**
 * callService(url, data)
 * -----------------------
 * שולח בקשת POST למיקרו-שירות ומחזיר את התגובה.
 * 
 * ככה מיקרו-שירותים מתקשרים זה עם זה — דרך
 * בקשות HTTP (בדיוק כמו שהדפדפן שלך מדבר עם אתרים!)
 */
async function callService(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return response.json();
}

// ============================================================
// מתזמר ה-SAGA
// ============================================================
/**
 * processOrderSaga(orderData)
 * ----------------------------
 * זהו הלב של המתזמר.
 * הוא מריץ כל שלב ברצף ומטפל בכשלים עם גלגול אחורה.
 * 
 * תחשבו על זה כרשימת תיוג:
 * ✅ שלב 1: יצירת הזמנה
 * ✅ שלב 2: חיוב תשלום  ← אם נכשל, בטל שלב 1
 * ✅ שלב 3: שמירת מלאי   ← אם נכשל, בטל שלבים 2 ו-1
 */
async function processOrderSaga(orderData) {
    console.log("\n" + "═".repeat(60));
    console.log("🎭 מתזמר ה-SAGA — מתחיל תהליך הזמנה");
    console.log("═".repeat(60));
    console.log(`לקוח: ${orderData.customerName}`);
    console.log(`מוצר:  #${orderData.productId}`);
    console.log(`כמות: ${orderData.quantity}`);
    console.log("═".repeat(60) + "\n");

    // נעקוב אחרי מה עשינו כדי לדעת מה לבטל אם משהו נכשל
    let orderId = null;
    let paymentDone = false;
    let inventoryDone = false;

    try {
        // ========================================
        // שלב 1: יצירת הזמנה
        // ========================================
        console.log("📋 שלב 1: יוצר הזמנה...");
        const orderResult = await callService(
            `${SERVICES.ORDER_SERVICE}/create-order`,
            {
                customerName: orderData.customerName,
                productId: orderData.productId,
                quantity: orderData.quantity,
            }
        );

        if (!orderResult.success) {
            throw new Error("נכשל ביצירת הזמנה");
        }

        orderId = orderResult.order.id;
        console.log(`   ✅ הזמנה נוצרה: ${orderId}\n`);

        // ========================================
        // שלב 2: חיוב תשלום
        // ========================================
        console.log("💳 שלב 2: מחייב תשלום...");
        const paymentResult = await callService(
            `${SERVICES.PAYMENT_SERVICE}/charge`,
            {
                orderId: orderId,
                amount: 79.99 * orderData.quantity, // חישוב מחיר פשוט
            }
        );

        if (!paymentResult.success) {
            // התשלום נכשל! צריך לגלגל אחורה את שלב 1
            throw new Error("התשלום נכשל — " + paymentResult.message);
        }

        paymentDone = true;
        console.log(`   ✅ תשלום חויב: ${paymentResult.payment.id}\n`);

        // ========================================
        // שלב 3: שמירת מלאי
        // ========================================
        console.log("📦 שלב 3: שומר מלאי...");
        const inventoryResult = await callService(
            `${SERVICES.INVENTORY_SERVICE}/reserve`,
            {
                orderId: orderId,
                productId: orderData.productId,
                quantity: orderData.quantity,
            }
        );

        if (!inventoryResult.success) {
            // שמירת המלאי נכשלה! גלגול אחורה של שלבים 2 ו-1
            throw new Error("שמירת המלאי נכשלה");
        }

        inventoryDone = true;
        console.log(`   ✅ מלאי נשמר: ${inventoryResult.reservation.id}\n`);

        // ========================================
        // כל השלבים הצליחו! 🎉
        // ========================================
        console.log("═".repeat(60));
        console.log("🎉 ה-SAGA הושלם בהצלחה!");
        console.log("═".repeat(60));
        console.log(`   מזהה הזמנה:  ${orderId}`);
        console.log(`   תשלום:       ${paymentResult.payment.id}`);
        console.log(`   שמירת מלאי:  ${inventoryResult.reservation.id}`);
        console.log("═".repeat(60) + "\n");

    } catch (error) {
        // ========================================
        // משהו נכשל — מתחילים גלגול אחורה!
        // ========================================
        console.log("\n" + "!".repeat(60));
        console.log(`❌ ה-SAGA נכשל: ${error.message}`);
        console.log("!".repeat(60));
        console.log("\n🔄 מתחיל פעולות מפצות (גלגול אחורה)...\n");

        // גלגול אחורה בסדר הפוך (האחרון שנעשה → הראשון שנעשה)

        // אם מלאי נשמר, משחררים אותו
        if (inventoryDone) {
            console.log("   📤 מגלגל אחורה: משחרר מלאי...");
            await callService(`${SERVICES.INVENTORY_SERVICE}/release`, {
                orderId,
            });
            console.log("   ✅ מלאי שוחרר\n");
        }

        // אם תשלום חויב, מחזירים אותו
        if (paymentDone) {
            console.log("   💰 מגלגל אחורה: מחזיר תשלום...");
            await callService(`${SERVICES.PAYMENT_SERVICE}/refund`, {
                orderId,
            });
            console.log("   ✅ תשלום הוחזר\n");
        }

        // אם הזמנה נוצרה, מבטלים אותה
        if (orderId) {
            console.log("   🚫 מגלגל אחורה: מבטל הזמנה...");
            await callService(`${SERVICES.ORDER_SERVICE}/cancel-order`, {
                orderId,
            });
            console.log("   ✅ הזמנה בוטלה\n");
        }

        console.log("═".repeat(60));
        console.log("🔄 ה-SAGA גולגל אחורה — כל השינויים בוטלו");
        console.log("═".repeat(60) + "\n");
    }
}

// ============================================================
// הרצת ה-SAGA!
// ============================================================
// זו נקודת הכניסה — מתחילה את ה-saga עם נתוני דוגמה.

console.log("\n🚀 הדגמת מתזמר Saga");
console.log("========================\n");
console.log("הסקריפט הזה:");
console.log("1. יוצר הזמנה        (שירות הזמנות על :4001)");
console.log("2. מחייב תשלום       (שירות תשלומים על :4002)");
console.log("3. שומר מלאי         (שירות מלאי על :4003)");
console.log("\n⚠️  לתשלום יש ~30% סיכוי להיכשל.");
console.log("   אם הוא נכשל, תראה את הגלגול אחורה בפעולה!\n");
console.log("מתחיל בעוד שנייה...\n");

// מחכה שנייה, ואז מריץ את ה-saga
setTimeout(() => {
    processOrderSaga({
        customerName: "אליס כהן",
        productId: 1,
        quantity: 2,
    });
}, 1000);
