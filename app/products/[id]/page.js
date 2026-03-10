/**
 * app/products/[id]/page.js — דף מוצר דינמי
 * ============================================
 * 
 * זהו קומפוננט שרת (SERVER COMPONENT) ✅
 * 
 * מה זה [id]?
 * ה-[id] בשם התיקייה אומר שזהו נתיב דינמי (DYNAMIC ROUTE).
 * - /products/1 → id = "1"
 * - /products/2 → id = "2"
 * - /products/99 → id = "99"
 * 
 * Next.js מחלץ אוטומטית את ה-"id" מה-URL
 * ומעביר אותו לקומפוננט שלנו דרך ה-prop "params".
 * 
 * מה הדף הזה עושה?
 * 1. קורא את מזהה המוצר מה-URL
 * 2. מושך את הנתונים של המוצר הספציפי
 * 3. מציג את פרטי המוצר
 * 4. כולל <AddToCartButton /> (קומפוננט לקוח!)
 */

// ייבוא פונקציית הנתונים המדומים
import { getProductById } from "../../../lib/data";

// ייבוא קומפוננט הלקוח שלנו (כפתור אינטראקטיבי)
import AddToCartButton from "../../components/AddToCartButton";

export default async function ProductDetailPage({ params }) {
    // חילוץ ה-"id" מפרמטרי ה-URL
    // לדוגמה, אם ה-URL הוא /products/3, אז params.id = "3"
    const { id } = await params;

    // מושך את המוצר הבודד (רץ על השרת)
    const product = await getProductById(id);

    // אם לא נמצא מוצר, מציג הודעת "לא נמצא"
    if (!product) {
        return (
            <div className="not-found">
                <h1>מוצר לא נמצא</h1>
                <p>מצטערים, לא מצאנו מוצר עם מזהה: {id}</p>
                <a href="/products" className="back-link">
                    → חזרה למוצרים
                </a>
            </div>
        );
    }

    return (
        <div className="product-detail">
            {/* קישור חזרה */}
            <a href="/products" className="back-link">
                → חזרה למוצרים
            </a>

            <div className="product-detail-card">
                {/* פרטי המוצר */}
                <span className="product-emoji">{product.emoji}</span>
                <h1>{product.name}</h1>
                <div className="price">₪{product.price}</div>
                <p className="description">{product.description}</p>

                {/*
          AddToCartButton הוא קומפוננט לקוח (CLIENT COMPONENT).
          הוא מטפל באינטראקציית משתמש (לחיצות) בצד הדפדפן.
          אנחנו מעבירים את שם המוצר כ-prop כדי שהכפתור ישתמש בו.
          
          קומפוננטי שרת יכולים לרנדר קומפוננטי לקוח בתוכם!
          ככה Next.js מערבב קוד שרת וקוד לקוח.
        */}
                <AddToCartButton productName={product.name} />
            </div>
        </div>
    );
}
