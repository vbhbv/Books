// ==========================================================
// book-page.js: وظائف صفحة عرض الكتاب (book.html)
// ==========================================================

async function loadBookDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
        document.getElementById('loading-message').textContent = 'لم يتم تحديد معرف الكتاب.';
        return;
    }
    
    try {
        const response = await fetch('data/books.json'); 
        if (!response.ok) { throw new Error('Network response was not ok'); } 
        const booksData = await response.json();
        
        const book = booksData.find(b => b.id.toString() === bookId);

        if (!book) {
            document.getElementById('loading-message').textContent = `لم يتم العثور على كتاب بالمعرف: ${bookId}`;
            return;
        }

        // إخفاء رسالة التحميل وإظهار المحتوى
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('book-details-content').style.display = 'block';

        // 1. تحديث عناوين الصفحة
        document.getElementById('page-title').textContent = `${book.title} - المكتبة الرقمية`;
        document.getElementById('book-title-header').textContent = book.title;

        // 2. تحديث البيانات الأساسية
        document.getElementById('book-cover-img').src = book.cover;
        document.getElementById('book-title-main').textContent = book.title;
        document.getElementById('book-author').textContent = book.author;
        document.getElementById('book-year').textContent = book.year;
        document.getElementById('book-description').textContent = book.description || 'لا يوجد وصف متاح لهذا الكتاب.';
        
        // 3. تحديث التاجات
        const tagsDiv = document.getElementById('book-tags-list');
        tagsDiv.innerHTML = book.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // 4. تحديث عداد التحميلات
        let downloads = book.downloads || 0;
        document.getElementById('download-count').textContent = downloads.toLocaleString('en-US');
        
        // 5. روابط التحميل
        const directLink = document.getElementById('download-direct');
        directLink.href = book.pdf_link;
        directLink.addEventListener('click', () => {
            // منطق زيادة العداد عند النقر على التحميل المباشر
            book.downloads = (book.downloads || 0) + 1;
            document.getElementById('download-count').textContent = book.downloads.toLocaleString('en-US');
            // ملاحظة: حفظ التغيير يتطلب استخدام خادم أو قاعدة بيانات حقيقية
        });

        if (book.telegram_link) {
            const telegramLink = document.getElementById('download-telegram');
            telegramLink.href = book.telegram_link;
            telegramLink.style.display = 'inline-flex'; 
        }

    } catch (error) {
        console.error("خطأ أثناء جلب بيانات الكتاب:", error);
        document.getElementById('loading-message').textContent = 'حدث خطأ أثناء تحميل بيانات الكتاب.';
    }
}

document.addEventListener('DOMContentLoaded', loadBookDetails);
