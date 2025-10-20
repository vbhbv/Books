// ملف: js/script.js

// البيانات الوهمية (تبقى كما هي)
const booksData = [
    { id: 1, title: "مقدمة في الفلسفة الحديثة", author: "أحمد شوقي", year: 2024, tags: ["فلسفة", "منطق"], cover: "غلاف 1", pdf_link: "https://t.me/iiollr" }, 
    { id: 2, title: "أسرار الكون والفيزياء", author: "نورة القحطاني", year: 2025, tags: ["علم", "فيزياء"], cover: "غلاف 2", pdf_link: "https://t.me/iiollr" },
    { id: 3, title: "فن الإقناع والجدل", author: "خالد الزهراني", year: 2023, tags: ["منطق", "بلاغة"], cover: "غلاف 3", pdf_link: "https://t.me/iiollr" },
    { id: 4, title: "مكتبة النور للبرمجة", author: "محمد علي", year: 2025, tags: ["برمجة", "JavaScript"], cover: "غلاف 4", pdf_link: "https://t.me/iiollr" },
    // 🛑 أكواد 1-5: إضافة بيانات وهمية إضافية لتمثيل النمو والتصنيفات الجديدة
    { id: 5, title: "أساسيات الذكاء الاصطناعي", author: "سارة محمود", year: 2024, tags: ["برمجة", "AI", "علم"], cover: "غلاف 5", pdf_link: "https://t.me/iiollr" },
    { id: 6, title: "تاريخ الحضارات القديمة", author: "علي عبدالله", year: 2020, tags: ["تاريخ", "ثقافة", "فلسفة"], cover: "غلاف 6", pdf_link: "https://t.me/iiollr" },
    { id: 7, title: "كيمياء الحياة", author: "فاطمة الزهراء", year: 2024, tags: ["علم", "كيمياء", "أحياء"], cover: "غلاف 7", pdf_link: "https://t.me/iiollr" },
    { id: 8, title: "الرواية العربية المعاصرة", author: "يوسف إدريس", year: 2021, tags: ["أدب", "روايات"], cover: "غلاف 8", pdf_link: "https://t.me/iiollr" },
    { id: 9, title: "تحليل البيانات الضخمة", author: "أحمد خالد", year: 2025, tags: ["برمجة", "بيانات", "AI"], cover: "غلاف 9", pdf_link: "https://t.me/iiollr" },
];

document.addEventListener('DOMContentLoaded', () => {
    // العناصر الرئيسية
    const searchInput = document.getElementById('search-input');
    const booksGrid = document.getElementById('books-grid');
    const latestBooksGrid = document.getElementById('latest-books-grid');
    const resultsStatus = document.getElementById('results-status');
    const randomBookBtn = document.getElementById('random-book-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.getElementById('side-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('overlay');
    const telegramBanner = document.getElementById('telegram-banner');
    const closeBannerBtn = document.getElementById('close-banner-btn');
    
    // 🛑 كود 6: استخدام الـ Debounce لتحسين أداء البحث (يؤخر التشغيل لتقليل استهلاك الموارد)
    let searchTimeout;
    const DEBOUNCE_DELAY = 300; // 300ms تأخير

    // 🛑 كود 7: حفظ متغيرات DOM في الذاكرة لتجنب إعادة البحث عنها (تحسين الأداء)
    const bodyElement = document.body;

    // 1. **الوضع الليلي (Dark Mode)**
    const currentMode = localStorage.getItem('theme') || 'light-mode';
    bodyElement.className = currentMode;
    // 🛑 كود 8: تحديث منطق الوضع الليلي لاستخدام الـ Ternary Operator (تنظيف للكود)
    const updateDarkMode = (isDark) => {
        bodyElement.classList.toggle('dark-mode', isDark);
        bodyElement.classList.toggle('light-mode', !isDark);
        localStorage.setItem('theme', isDark ? 'dark-mode' : 'light-mode');
        darkModeToggle.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    };

    darkModeToggle.addEventListener('click', () => {
        const isDarkMode = bodyElement.classList.contains('light-mode'); // إذا كان فاتحاً، سيصبح مظلماً
        updateDarkMode(isDarkMode);
    });
    
    // 🛑 كود 9: تشغيل تحديث الوضع الليلي عند التحميل لضمان تطابق الأيقونة مع الحالة المحفوظة
    updateDarkMode(currentMode === 'dark-mode');


    // 2. **القائمة الجانبية (Hamburger Menu)**
    const toggleMenu = () => {
        // 🛑 كود 10: استخدام Scroll Lock لمنع تمرير الجسم عند فتح القائمة (UX)
        const isMenuOpen = sideMenu.classList.toggle('open');
        overlay.classList.toggle('active');
        bodyElement.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    };
    
    menuToggle.addEventListener('click', toggleMenu);
    closeMenuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu); 
    
    // 🛑 كود 11: إضافة إغلاق القائمة عند ضغط مفتاح ESC (تحسين UX إضافي)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sideMenu.classList.contains('open')) {
            toggleMenu();
        }
    });
    

    // 3. **شريط إشعار تيليجرام**
    // 🛑 كود 12: تحسين إخفاء الشريط ليكون أكثر سلاسة (UX)
    closeBannerBtn.addEventListener('click', () => {
        telegramBanner.style.opacity = '0';
        setTimeout(() => {
            telegramBanner.style.display = 'none';
        }, 300); // يتطابق مع مدة انتقال CSS
        localStorage.setItem('bannerHidden', 'true');
    });
    if (localStorage.getItem('bannerHidden') === 'true') {
        telegramBanner.style.display = 'none';
    } else {
        // 🛑 كود 13: جعل شريط الإشعار يظهر بتأثير تلاشي لطيف (Fade-In)
        setTimeout(() => {
            telegramBanner.style.opacity = '1';
        }, 100);
    }
    
    // 🛑 كود 14: تفعيل انتقال CSS لـ opacity على البانر في ملف CSS (يجب إضافة هذا إلى CSS)
    telegramBanner.style.transition = 'opacity 0.3s ease-out';
    telegramBanner.style.opacity = telegramBanner.style.display === 'none' ? '0' : '1';

    
    // 4. **منطق البحث والعرض**
    
    resultsStatus.textContent = "الكتب المتوفرة في المخزن (ابدأ البحث)";
    displayBooks(booksGrid, booksData);
    displayLatestBooks();

    // تشغيل البحث باستخدام DEBOUNCE
    searchInput.addEventListener('input', (e) => {
        // 🛑 كود 15: استخدام Debounce للبحث (تحسين الأداء)
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, DEBOUNCE_DELAY);
    });
    
    // تشغيل البحث عند النقر
    document.getElementById('search-button').addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    // 🛑 كود 16: إضافة دالة للتركيز على حقل البحث عند النقر على أيقونة البحث (UX)
    document.getElementById('search-button').addEventListener('click', () => {
        performSearch(searchInput.value);
        searchInput.focus();
    });

    // 🛑 كود 17: إضافة وظيفة البحث عن طريق الضغط على Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    // 🛑 كود 18: دالة رئيسية للبحث مع تنظيف الإدخال
    function performSearch(query) {
        // 🛑 كود 19: تنظيف المدخلات لإزالة المسافات الزائدة
        query = query.trim().toLowerCase();
        
        const filteredBooks = booksData.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.tags.some(tag => tag.toLowerCase().includes(query))
        );
        
        document.getElementById('latest-books').style.display = query ? 'none' : 'block';
        
        displayBooks(booksGrid, filteredBooks, query);
    }

    randomBookBtn.addEventListener('click', () => {
        // 🛑 كود 20: التأكد من وجود كتب قبل اختيار عشوائي
        if (booksData.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * booksData.length);
        const randomBook = booksData[randomIndex];
        window.open(randomBook.pdf_link, '_blank');
        
        // 🛑 كود 21: استخدام الـ Template Literals لتحسين رسالة التنبيه (تنظيف الكود)
        alert(`كتاب اليوم المختار من مخزن الكتب: ${randomBook.title} للمؤلف ${randomBook.author}. تم فتح رابط التحميل مباشرة!`);
    });

    // 🛑 كود 22: دالة عرض آخر الكتب في القسم المخصص (تنظيف الكود)
    function displayLatestBooks() {
        // 🛑 كود 23: فرز الكتب باستخدام لغة الـ locale للمقارنة إذا كانت البيانات نصية
        const sortedBooks = [...booksData].sort((a, b) => b.year - a.year);
        const latestFour = sortedBooks.slice(0, 4); 
        displayBooks(latestBooksGrid, latestFour);
    }
    
    // 🛑 كود 24: وظيفة جلب البيانات من الخادم (محاكاة جلب JSON من مجلد all-books)
    async function fetchBooksData() {
        try {
            // محاكاة جلب البيانات، يجب استبدالها برابط API حقيقي
            // const response = await fetch('/api/all-books');
            // const data = await response.json();
            // booksData = data; // تحديث قائمة الكتب
            console.log("تمت محاكاة جلب بيانات الكتب بنجاح!");
            // إعادة تشغيل العرض بعد جلب البيانات
            resultsStatus.textContent = "الكتب المتوفرة في المخزن (ابدأ البحث)";
            displayBooks(booksGrid, booksData);
            displayLatestBooks();

        } catch (error) {
            // 🛑 كود 25: معالجة خطأ تحميل البيانات (UX)
            console.error("خطأ في تحميل بيانات الكتب:", error);
            resultsStatus.textContent = "عذراً، حدث خطأ في تحميل الكتب.";
        }
    }
    // 🛑 كود 26: استدعاء جلب البيانات
    // fetchBooksData(); // معطل حالياً لعدم وجود API حقيقي

    // دالة إنشاء بطاقة الكتاب وعرضها (تم تعميمها لتعمل مع أي شبكة)
    function displayBooks(gridElement, books, query = '') {
        gridElement.innerHTML = '';
        
        if (gridElement === booksGrid) {
            if (query) {
                 resultsStatus.textContent = `نتائج البحث عن: "${query}" في المخزن (${books.length} كتاب)`;
            } else {
                 resultsStatus.textContent = "الكتب المتوفرة في المخزن (ابدأ البحث)";
            }

            if (books.length === 0 && query) {
                gridElement.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #888;">لم يتم العثور على نتائج مطابقة.</p>';
                return;
            }
        }
        
        // 🛑 كود 27: استخدام fragment لتحسين الأداء عند إضافة عناصر متعددة (Performance)
        const fragment = document.createDocumentFragment();

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            card.innerHTML = `
                <div class="book-cover">${book.cover}</div>
                <h3>${book.title}</h3>
                <p>المؤلف: ${book.author}</p>
                <p>السنة: ${book.year}</p>
                <button 
                    class="download-btn" 
                    onclick="window.open('${book.pdf_link}', '_blank')" 
                    title="تحميل الملف يوجهك مباشرة لصفحة الكتاب على قناة تيليجرام">
                    تحميل PDF <i class="fas fa-download"></i>
                </button>
                <div class="book-tags">
                   ${book.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
                </div>
            `;
            // 🛑 كود 29: إضافة معالج حدث النقر لعرض معلومات إضافية (UX)
            card.addEventListener('click', (e) => {
                // منع تشغيل هذا الحدث عند النقر على زر التحميل
                if (e.target.classList.contains('download-btn')) return; 
                alert(`معلومات عن الكتاب: ${book.title}\nسنة النشر: ${book.year}\nالتصنيفات: ${book.tags.join(', ')}`);
            });
            
            fragment.appendChild(card);
        });
        
        // إضافة fragment إلى الـ DOM مرة واحدة (Performance)
        gridElement.appendChild(fragment);
    }
    
    // 🛑 كود 30: تفعيل البحث الفوري بالنقر على الـ Tag (New Feature)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag')) {
            const tag = e.target.getAttribute('data-tag');
            searchInput.value = tag;
            performSearch(tag);
            // إغلاق القائمة الجانبية إذا كان النقر منها
            if (sideMenu.classList.contains('open')) {
                 toggleMenu();
            }
        }
    });
});
