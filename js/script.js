// ملف: js/script.js

// البيانات الوهمية (تبقى كما هي)
const booksData = [
    { id: 1, title: "مقدمة في الفلسفة الحديثة", author: "أحمد شوقي", year: 2024, tags: ["فلسفة", "منطق"], cover: "غلاف 1", pdf_link: "https://t.me/iiollr" }, 
    { id: 2, title: "أسرار الكون والفيزياء", author: "نورة القحطاني", year: 2025, tags: ["علم", "فيزياء"], cover: "غلاف 2", pdf_link: "https://t.me/iiollr" },
    { id: 3, title: "فن الإقناع والجدل", author: "خالد الزهراني", year: 2023, tags: ["منطق", "بلاغة"], cover: "غلاف 3", pdf_link: "https://t.me/iiollr" },
    { id: 4, title: "مكتبة النور للبرمجة", author: "محمد علي", year: 2025, tags: ["برمجة", "JavaScript"], cover: "غلاف 4", pdf_link: "https://t.me/iiollr" }, 
];

document.addEventListener('DOMContentLoaded', () => {
    // ... (جميع عناصر DOM والعناصر الرئيسية تبقى كما هي) ...

    // 4. **منطق البحث والعرض**
    
    // عرض الكل في البداية في قسم نتائج البحث
    resultsStatus.textContent = "الكتب المتوفرة في المخزن (ابدأ البحث)";
    displayBooks(booksGrid, booksData);
    
    // عرض أحدث 4 كتب في القسم الجديد
    displayLatestBooks();


    // ... (بقية الدالة) ...

    randomBookBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * booksData.length);
        const randomBook = booksData[randomIndex];
        // استخدام الرابط المباشر لتيليجرام
        window.open(randomBook.pdf_link, '_blank');
        // 🛑 تحديث رسالة التنبيه
        alert(`كتاب اليوم المختار من مخزن الكتب: ${randomBook.title} للمؤلف ${randomBook.author}. تم فتح رابط التحميل مباشرة!`);
    });

    // ... (بقية الدالة) ...

    // دالة إنشاء بطاقة الكتاب وعرضها (تم تعميمها لتعمل مع أي شبكة)
    function displayBooks(gridElement, books, query = '') {
        gridElement.innerHTML = '';
        
        if (gridElement === booksGrid) {
            // تحديث حالة نتائج البحث فقط في قسم البحث الرئيسي
            if (query) {
                 // 🛑 تحديث رسالة حالة البحث
                 resultsStatus.textContent = `نتائج البحث عن: "${query}" في المخزن (${books.length} كتاب)`;
            } else {
                 resultsStatus.textContent = "الكتب المتوفرة في المخزن (ابدأ البحث)";
            }

            // ... (بقية كود التعامل مع النتائج) ...
        }

        // ... (كود إنشاء بطاقة الكتاب يبقى كما هو) ...
    }
});
