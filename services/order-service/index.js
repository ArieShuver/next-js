/**
 * services/order-service/index.js — מיקרו-שירות הזמנות
 * =====================================================
 * 
 * מה זה מיקרו-שירות (Microservice)?
 * מיקרו-שירות הוא אפליקציה קטנה ועצמאית שעושה דבר אחד.
 * במקום שתהיה אפליקציה ענקית אחת שמטפלת בהכל ("מונוליט"),
 * מפצלים אותה להרבה שירותים קטנים שמתקשרים זה עם זה.
 * 
 * השירות הזה:
 * - רץ על פורט 4001
 * - יש לו שתי נקודות קצה:
 *     POST /create-order  → יוצר הזמנה חדשה
 *     POST /cancel-order  → מבטל הזמנה (משמש לביטול ב-saga)
 * 
 * איך להריץ:
 *   node services/order-service/index.js
 *  או
 *   npm run order-service
 * 
 * השוואה לעולם האמיתי:
 * בפרודקשן, זה היה פרויקט נפרד עם מסד נתונים משלו,
 * מותקן על שרת משלו (או קונטיינר). כאן, אנחנו מדמים אותו
 * כשרת Express פשוט שרץ על פורט אחר.
 */

const express = require("express");

// יצירת אפליקציית Express
const app = express();

// Middleware: אומר ל-Express לפענח גופי JSON
// בלי זה, אנחנו לא יכולים לקרוא את הנתונים שנשלחים בבקשות
app.use(express.json());

// "מסד נתונים" פשוט בזיכרון — רק מערך
// באפליקציה אמיתית, זה היה מסד נתונים אמיתי (PostgreSQL, MongoDB וכו')
const orders = [];

// ============================================================
// POST /create-order — יוצר הזמנה חדשה
// ============================================================
app.post("/create-order", (req, res) => {
    // קריאת נתונים מגוף הבקשה
    const { customerName, productId, quantity } = req.body;

    // יצירת אובייקט ההזמנה
    const order = {
        id: `ORD-${Date.now()}`,
        customerName,
        productId,
        quantity: quantity || 1,
        status: "נוצרה",
        createdAt: new Date().toISOString(),
    };

    // שמירה ב"מסד הנתונים" (המערך)
    orders.push(order);

    // רישום בקונסול כדי לראות מה קורה
    console.log("✅ [שירות הזמנות] הזמנה נוצרה:", order.id);
    console.log("   לקוח:", customerName);
    console.log("   מזהה מוצר:", productId);
    console.log("   כמות:", quantity || 1);
    console.log("---");

    // שליחת ההזמנה בחזרה כתגובה
    res.status(201).json({
        success: true,
        message: "ההזמנה נוצרה בהצלחה",
        order,
    });
});

// ============================================================
// POST /cancel-order — ביטול הזמנה (פעולה מפצה)
// ============================================================
// נקרא כשמשהו משתבש אחרי שההזמנה נוצרה.
// זה חלק מתבנית ה-SAGA — אם שלב מאוחר יותר נכשל, אנחנו "מבטלים"
// את ההזמנה ע"י שינוי הסטטוס שלה ל"בוטלה".
app.post("/cancel-order", (req, res) => {
    const { orderId } = req.body;

    // מחפש את ההזמנה ב"מסד הנתונים"
    const order = orders.find((o) => o.id === orderId);

    if (order) {
        // סימון כמבוטלת
        order.status = "בוטלה";
        console.log("❌ [שירות הזמנות] הזמנה בוטלה:", orderId);
        console.log("   (זו פעולה מפצה — ביטול ההזמנה)");
        console.log("---");
    } else {
        console.log("⚠️ [שירות הזמנות] הזמנה לא נמצאה לביטול:", orderId);
    }

    res.json({ success: true, message: "ההזמנה בוטלה", orderId });
});

// ============================================================
// הפעלת השרת על פורט 4001
// ============================================================
const PORT = 4001;
app.listen(PORT, () => {
    console.log(`\n🟢 שירות הזמנות רץ על http://localhost:${PORT}`);
    console.log("   נקודות קצה:");
    console.log("   POST /create-order  → יצירת הזמנה חדשה");
    console.log("   POST /cancel-order  → ביטול הזמנה (rollback)\n");
});
