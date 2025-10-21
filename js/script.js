/*
 * ------------------------------------------------------------------
 * الملف الكامل app.js (دمج 40 كود جديد مع منطق المكتبة القديم)
 * ------------------------------------------------------------------
 */

// ===============================================
// I. البيانات الأصلية والثوابت
// ===============================================

// البيانات الوهمية
const booksData = [
    { id: 1, title: "مقدمة في الفلسفة الحديثة", author: "أحمد شوقي", year: 2024, tags: ["فلسفة", "منطق"], cover: "غلاف 1", pdf_link: "https://t.me/iiollr" }, 
    { id: 2, title: "أسرار الكون والفيزياء", author: "نورة القحطاني", year: 2025, tags: ["علم", "فيزياء"], cover: "غلاف 2", pdf_link: "https://t.me/iiollr" },
    { id: 3, title: "فن الإقناع والجدل", author: "خالد الزهراني", year: 2023, tags: ["منطق", "بلاغة"], cover: "غلاف 3", pdf_link: "https://t.me/iiollr" },
    { id: 4, title: "مكتبة النور للبرمجة", author: "محمد علي", year: 2025, tags: ["برمجة", "JavaScript"], cover: "غلاف 4", pdf_link: "https://t.me/iiollr" },
    { id: 5, title: "أساسيات الذكاء الاصطناعي", author: "سارة محمود", year: 2024, tags: ["برمجة", "AI", "علم"], cover: "غلاف 5", pdf_link: "https://t.me/iiollr" },
    { id: 6, title: "تاريخ الحضارات القديمة", author: "علي عبدالله", year: 2020, tags: ["تاريخ", "ثقافة", "فلسفة"], cover: "غلاف 6", "pdf_link": "https://t.me/iiollr" },
    { id: 7, title: "كيمياء الحياة", author: "فاطمة الزهراء", year: 2024, tags: ["علم", "كيمياء", "أحياء"], cover: "غلاف 7", "pdf_link": "https://t.me/iiollr" },
    { id: 8, title: "الرواية العربية المعاصرة", author: "يوسف إدريس", year: 2021, tags: ["أدب", "روايات"], cover: "غلاف 8", "pdf_link": "https://t.me/iiollr" },
    { id: 9, title: "تحليل البيانات الضخمة", author: "أحمد خالد", year: 2025, tags: ["برمجة", "بيانات", "AI"], cover: "غلاف 9", "pdf_link": "https://t.me/iiollr" },
];

const DEBOUNCE_DELAY = 300; 
let searchTimeout;

// 39. تجميد الكائنات (لإعدادات الموقع الثابتة)
const CONFIG = Object.freeze({
    API_URL: 'https://api.example.com/v2',
    TIMEOUT: 10000,
    CACHE_NAME: 'v3-app-cache'
});

// 37. استخدام دوال السهم
const isEmailValid = email => email.includes('@') && email.length > 5;

// (49) استخدام WeakMap للتخزين المؤقت للبيانات المعالجة
const processedCache = new WeakMap();

// 9. async/await with fetch و 32. معالجة معلمات URL (محدث ليعمل كمحاكاة fetch)
async function fetchLatestPosts() {
    // محاكاة الاتصال الخارجي باستخدام بيانات الكتب الموجودة
    const params = new URLSearchParams({ sort: 'date', limit: 10 });
    const url = `${CONFIG.API_URL}/posts?${params.toString()}`;
    
    // محاكاة Fetch بجلب آخر 10 كتب
    return new Promise(resolve => {
        setTimeout(() => {
            const latestPosts = [...booksData].sort((a, b) => b.year - a.year).slice(0, 10);
            resolve(latestPosts.map(book => ({ id: book.id, title: book.title, tags: book.tags })));
        }, 500); // تأخير لمحاكاة الاتصال
    });
}


// ===============================================
// II. وظائف المساعدة الرئيسية (منطق المكتبة)
// ===============================================

// دالة عرض آخر الكتب في القسم المخصص
function displayLatestBooks() {
    const latestBooksGrid = document.getElementById('latest-books-grid');
    if (!latestBooksGrid) return;
    const sortedBooks = [...booksData].sort((a, b) => b.year - a.year);
    const latestFour = sortedBooks.slice(0, 4); 
    displayBooks(latestBooksGrid, latestFour);
}

// دالة إنشاء بطاقة الكتاب وعرضها (محدثة لدعم <template> لاحقاً)
function displayBooks(gridElement, books, query = '') {
    const resultsStatus = document.getElementById('results-status');
    
    gridElement.innerHTML = '';
    
    if (gridElement.id === 'books-grid' && resultsStatus) {
        if (query) {
             resultsStatus.textContent = `نتائج البحث عن: "${query}" في المخزن (${books.length} كتاب)`;
        } else {
             resultsStatus.textContent = "الكتب المتوفرة في المخزن (ابدأ البحث)";
        }

        if (books.length === 0 && query) {
            gridElement.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-color);">لم يتم العثور على نتائج مطابقة.</p>';
            return;
        }
    }
    
    const fragment = document.createDocumentFragment();

    books.forEach(book => {
        // (47) يمكن استخدام الـ template هنا مستقبلاً لتحسين الأداء
        const card = document.createElement('div');
        card.className = 'book-card card'; // إضافة كلاس card لتطبيق تنسيقات CSS المتقدمة
        
        card.innerHTML = `
            <div class="book-cover">${book.cover}</div>
            <h3>${book.title}</h3>
            <p>المؤلف: ${book.author}</p>
            <p>السنة: ${book.year}</p>
            <button 
                class="download-btn button" 
                onclick="window.open('${book.pdf_link}', '_blank')" 
                title="تحميل الملف يوجهك مباشرة لصفحة الكتاب على قناة تيليجرام">
                تحميل PDF <i class="fas fa-download"></i>
            </button>
            <div class="book-tags">
               ${book.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('download-btn') || e.target.classList.contains('tag')) return; 
            alert(`معلومات عن الكتاب: ${book.title}\nسنة النشر: ${book.year}\nالتصنيفات: ${book.tags.join(', ')}`);
        });
        
        fragment.appendChild(card);
    });
    
    gridElement.appendChild(fragment);
}

function performSearch(query) {
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid || !document.getElementById('latest-books')) return;
    
    query = query.trim().toLowerCase();
    
    const filteredBooks = booksData.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    const latestBooksSection = document.getElementById('latest-books');
    if(latestBooksSection) latestBooksSection.style.display = query ? 'none' : 'aside';
    
    displayBooks(booksGrid, filteredBooks, query);
}

// ===============================================
// III. دالة DOMContentLoaded الرئيسية (ES6+ Features)
// ===============================================

// 21. التأكد من جاهزية DOM
document.addEventListener('DOMContentLoaded', () => {
    
    // 🛑 التحقق من وجود جميع العناصر الحيوية للمكتبة
    const searchInput = document.getElementById('search-input');
    const booksGrid = document.getElementById('books-grid');
    const latestBooksGrid = document.getElementById('latest-books-grid');
    const resultsStatus = document.getElementById('results-status');
    const randomBookBtn = document.getElementById('random-book-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const bodyElement = document.body;

    // 1. **الوضع الليلي (Dark Mode) - دمج منطق المكتبة مع JS الحديثة**
    const currentMode = localStorage.getItem('theme') || 'light-mode';
    bodyElement.className = currentMode;
    
    const updateDarkMode = (isDark) => {
        // استخدام data-theme بدلاً من كلاس على body (أفضل ممارسة مع CSS Variables)
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark-mode' : 'light-mode');
        // يمكن تحديث الأيقونة هنا إذا كان لديك
    };
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isDarkMode = currentMode === 'light-mode'; // المنطق القديم مقلوب، يتم تصحيحه هنا
            updateDarkMode(isDarkMode);
        });
        updateDarkMode(currentMode === 'dark-mode');
    }

    // 2. **القائمة الجانبية (Hamburger Menu) - ترك المنطق الأصلي**
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.getElementById('side-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('overlay');

    const toggleMenu = () => {
         if (!sideMenu || !overlay) return;
         const isMenuOpen = sideMenu.classList.toggle('open');
         overlay.classList.toggle('active');
         bodyElement.style.overflow = isMenuOpen ? 'hidden' : 'auto';
         if (menuToggle) menuToggle.setAttribute('aria-expanded', isMenuOpen);
    };
    
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    
    document.addEventListener('keydown', (e) => {
        // 6. الوصول الآمن (Optional Chaining) + Nullish Coalescing
        if (e.key === 'Escape' && sideMenu?.classList.contains('open') ?? false) {
            toggleMenu();
        }
    });
    

    // 3. **شريط إشعار تيليجرام - ترك المنطق الأصلي**
    const telegramBanner = document.getElementById('telegram-banner');
    const closeBannerBtn = document.getElementById('close-banner-btn');

    if (telegramBanner) {
        if (localStorage.getItem('bannerHidden') !== 'true') {
            telegramBanner.style.opacity = '1';
        } else {
            telegramBanner.style.display = 'none';
        }
    }
    
    if (closeBannerBtn) {
         closeBannerBtn.addEventListener('click', () => {
             telegramBanner?.style.setProperty('opacity', '0');
             setTimeout(() => {
                 telegramBanner?.style.setProperty('display', 'none');
             }, 300);
             localStorage.setItem('bannerHidden', 'true');
         });
    }

    
    // 4. **منطق البحث والعرض - ترك المنطق الأصلي**
    if (booksGrid && resultsStatus) {
        resultsStatus.textContent = "الكتب المتوفرة في المخزن (ابدأ البحث)";
        displayBooks(booksGrid, booksData);
    }
    if (latestBooksGrid) {
        displayLatestBooks();
    }
    
    // ربط البحث (5. Debouncing)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, DEBOUNCE_DELAY);
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(searchInput.value);
            }
        });
    }
    if (document.getElementById('search-button') && searchInput) {
        document.getElementById('search-button').addEventListener('click', (e) => {
            e.preventDefault();
            performSearch(searchInput.value);
            searchInput.focus();
        });
    }

    // زر عشوائي
    if (randomBookBtn) {
        randomBookBtn.addEventListener('click', () => {
            if (booksData.length === 0) return;
            const randomIndex = Math.floor(Math.random() * booksData.length);
            const randomBook = booksData[randomIndex];
            window.open(randomBook.pdf_link, '_blank');
            // (35) إطلاق حدث مخصص بعد الإضافة
            document.dispatchEvent(new CustomEvent('randomBookSelected', { detail: randomBook })); 
            alert(`كتاب اليوم المختار: ${randomBook.title}.`);
        });
    }

    // تفعيل البحث الفوري بالنقر على الـ Tag
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag') && searchInput) {
            const tag = e.target.getAttribute('data-tag');
            searchInput.value = tag;
            performSearch(tag);
            if (sideMenu?.classList.contains('open')) {
                 toggleMenu();
            }
        }
    });

    // ===============================================
    // IV. تحسين تجربة القراءة والتنقل
    // ===============================================

    // 22. تأخير تحميل الصور (Lazy Loading) مع 23. Intersection Observer API
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '0px 0px 200px 0px' });
    lazyImages.forEach(img => imageObserver.observe(img));

    // 24. تسجيل Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch(err => console.error('Service Worker Failed:', err));
    }
    
    // 8. الاستيراد الديناميكي (Dynamic Import)
    document.getElementById('heavy-module-btn')?.addEventListener('click', () => {
        import('./analytics.js') 
            .then(module => {
                module.trackEvent('Button Clicked');
            })
            .catch(error => {
                console.error('فشل تحميل الوحدة:', error);
            });
    });
    
    // (50) إضافة ميزة البحث الصوتي (Speech Recognition API)
    document.getElementById('voice-search-btn')?.addEventListener('click', () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            const lang = navigator.language;
            recognition.lang = lang; 
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = transcript;
            };
            recognition.start();
        } else {
            alert('البحث الصوتي غير مدعوم في متصفحك.');
        }
    });
    
    // (45) دالة التمرير إلى أعلى الصفحة
    document.getElementById('scroll-top-btn')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
});
