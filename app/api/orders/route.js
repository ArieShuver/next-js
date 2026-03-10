/**
 * app/api/orders/route.js — נתיב API
 * =====================================
 * 
 * מה זה נתיב API?
 * נתיבי API מאפשרים ליצור נקודות קצה (ENDPOINTS) צד-שרת
 * בתוך אפליקציית Next.js. במקום ליצור שרת נפרד, Next.js מטפל בזה בשבילך.
 * 
 * איך זה עובד?
 * - הקובץ נמצא ב-app/api/orders/route.js
 * - זה יוצר נקודת קצה בכתובת: /api/orders
 * - אנחנו מייצאים פונקציות עם שמות לפי שיטת HTTP:
 *     export async function GET()  → מטפל ב-GET  /api/orders
 *     export async function POST() → מטפל ב-POST /api/orders
 * 
 * מה קורה כשהצד הקדמי קורא לזה?
 * 1. הצד הקדמי שולח בקשת POST עם גוף JSON (שם לקוח, מוצר)
 * 2. הפונקציה הזו מקבלת את הבקשה
 * 3. אנחנו יוצרים הזמנה מדומה עם מזהה אקראי
 * 4. אנחנו מחזירים את ההזמנה כ-JSON
 * 
 * באפליקציה אמיתית, היינו שומרים את זה במסד נתונים!
 */

import { NextResponse } from "next/server";

/**
 * POST /api/orders
 * -----------------
 * יוצר הזמנה חדשה.
 *
 * NextResponse.json() הוא הדרך של Next.js לשלוח תגובות JSON.
 * זה דומה ל-res.json() של Express.
 */
export async function POST(request) {
    try {
        // פענוח גוף ה-JSON מהבקשה
        // הצד הקדמי שולח את הנתונים האלה כשקורא ל-fetch()
        const body = await request.json();

        // חילוץ השדות שאנחנו מצפים להם
        const { customerName, productId, quantity } = body;

        // אימות פשוט — לוודא ששדות חובה קיימים
        if (!customerName || !productId) {
            return NextResponse.json(
                { error: "חסרים שדות חובה: שם לקוח ומזהה מוצר" },
                { status: 400 } // 400 = בקשה שגויה
            );
        }

        // יצירת הזמנה מדומה (באפליקציה אמיתית, שמירה במסד נתונים)
        const order = {
            id: `ORD-${Date.now()}`, // מזהה ייחודי פשוט באמצעות חותמת זמן
            customerName,
            productId: parseInt(productId),
            quantity: quantity || 1,
            status: "נוצרה",
            createdAt: new Date().toISOString(),
        };

        // רישום ההזמנה על השרת (תראה את זה בטרמינל)
        console.log("📦 הזמנה חדשה נוצרה:", order);

        // החזרת ההזמנה שנוצרה כ-JSON
        // סטטוס 201 = נוצר (משהו נוצר בהצלחה)
        return NextResponse.json(
            {
                message: "ההזמנה נוצרה בהצלחה!",
                order,
            },
            { status: 201 }
        );
    } catch (error) {
        // אם משהו השתבש, מחזירים תגובת שגיאה
        console.error("❌ שגיאה ביצירת הזמנה:", error);

        return NextResponse.json(
            { error: "נכשל ביצירת הזמנה" },
            { status: 500 } // 500 = שגיאת שרת פנימית
        );
    }
}

/**
 * GET /api/orders
 * ----------------
 * מחזיר הודעה פשוטה (להדגמה בלבד).
 * באפליקציה אמיתית, זה היה מחזיר רשימה של כל ההזמנות ממסד הנתונים.
 */
export async function GET() {
    return NextResponse.json({
        message: "ה-API של ההזמנות עובד! השתמש ב-POST כדי ליצור הזמנה.",
        example: {
            method: "POST",
            body: {
                customerName: "ישראל ישראלי",
                productId: 1,
                quantity: 2,
            },
        },
    });
}
