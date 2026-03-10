/**
 * app/products/page.js — דף רשימת המוצרים
 * ==========================================
 * 
 * זהו קומפוננט שרת (SERVER COMPONENT) ✅
 * הוא מושך נתונים על השרת לפני שליחת HTML לדפדפן.
 * 
 * מה זה "async" כאן?
 * Next.js App Router מאפשר לקומפוננטי שרת להיות פונקציות async.
 * זה אומר שאנחנו יכולים להשתמש ב-"await" כדי למשוך נתונים לפני הרנדור.
 * הדף מחכה לנתונים, ואז שולח את ה-HTML המלא לדפדפן.
 * 
 * מה הדף הזה עושה?
 * 1. קורא ל-getAllProducts() כדי לקבל את נתוני המוצרים המדומים
 * 2. עובר על מערך המוצרים ויוצר כרטיס לכל מוצר
 * 3. כל כרטיס מקשר ל-/products/[id] (דף המוצר הדינמי)
 */

// ייבוא פונקציית הנתונים המדומים שלנו
import { getAllProducts } from "../../lib/data";

// שימו לב למילה "async" — הקומפוננט הזה רץ על השרת
// ויכול לחכות לנתונים לפני הרנדור
export default async function ProductsPage() {
    // מושך את כל המוצרים (זה רץ על השרת!)
    // באפליקציה אמיתית, זו הייתה יכולה להיות שאילתת מסד נתונים או קריאת API
    const products = await getAllProducts();

    return (
        <>
            {/* ====== כותרת הדף ====== */}
            <div className="products-header">
                <h1>🛍️ מוצרים</h1>
                <p>עיין באוסף שלנו. לחץ על מוצר כדי לראות פרטים.</p>
            </div>

            {/* ====== רשת מוצרים ====== */}
            {/*
        .map() עובר על כל מוצר ויוצר כרטיס.
        ה-prop "key" עוזר ל-React לעקוב אחרי אילו פריטים השתנו.
      */}
            <div className="products-grid">
                {products.map((product) => (
                    <a
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="product-card"
                    >
                        <span className="product-emoji">{product.emoji}</span>
                        <h2>{product.name}</h2>
                        <span className="price">₪{product.price}</span>
                        <p className="description">{product.description}</p>
                    </a>
                ))}
            </div>
        </>
    );
}
