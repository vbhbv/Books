/*
 * ------------------------------------------------------------------
 * الملف app.js المصحح والنهائي (مرتبط تماماً بالهيكل الأخير لـ index.html)
 * ------------------------------------------------------------------
 */

// ===============================================
// I. البيانات الأصلية والثوابت
// ===============================================

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

const CONFIG = Object.freeze({
    API_URL: 'https://api.example.com/v2',
    TIMEOUT: 10000,
    CACHE_NAME: 'v3-app-cache'
});


// ===============================================
// II. وظائف المساعدة الرئيسية (منطق المكتبة)
// ===============================================

function displayLatestBooks() {
    const latestBooksGrid = document.getElementById('latest-books-grid');
    if (!latestBooksGrid) return;
    const sortedBooks = [...booksData].sort((a, b) => b.year - a.year);
    const latestFour = sortedBooks.slice(0, 4); 
    displayBooks(latestBooksGrid, latestFour);
}

function displayBooks(gridElement, books, query = '') {
    const resultsStatus = document.getElementById('results-status');
    const template = document.getElementById('post-template');
    
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
        // استخدام <template> المصحح في HTML
        const cardClone = template ? document.importNode(template.content, true) : document.createElement('div');
        const card = cardClone.querySelector('.book-card') || cardClone;

        // تحديث محتويات البطاقة باستخدام البيانات
        if (card.querySelector('.book-cover')) card.querySelector('.book-cover').innerHTML = book.cover;
        if (card.querySelector('h3')) card.querySelector('h3').textContent = book.title;
        if (card.querySelector('p span')) card.querySelector('p span').textContent = book.author; 
        
        const downloadBtn = card.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.onclick = () => window.open(book.pdf_link, '_blank');
            downloadBtn.innerHTML = `تحميل PDF <i class="fas fa-download"></i>`;
        }
        
        const tagsDiv = card.querySelector('.book-tags');
        if (tagsDiv) tagsDiv.innerHTML = book.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('');


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
// III. دالة DOMContentLoaded الرئيسية
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 🛑 العناصر الحيوية (مصححة للتزامن مع index.html)
    const searchInput = document.getElementById('search-input');
    const booksGrid = document.getElementById('books-grid');
    const latestBooksGrid = document.getElementById('latest-books-grid');
    const resultsStatus = document.getElementById('results-status');
    const randomBookBtn = document.getElementById('random-book-btn');
    
    // 🛑 تصحيح: استخدام 'theme-toggle' كما هو في ملف index.html الأخير
    const themeToggle = document.getElementById('theme-toggle'); 
    const bodyElement = document.body;

    // 1. **الوضع الليلي (Dark Mode) - تصحيح ID الزر ومنطق التشغيل**
    const currentMode = localStorage.getItem('theme') || 'light-mode';
    document.documentElement.setAttribute('data-theme', currentMode === 'dark-mode' ? 'dark' : 'light'); 

    const updateDarkMode = (isDark) => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark-mode' : 'light-mode');
        if (themeToggle) {
             themeToggle.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
             themeToggle.setAttribute('aria-pressed', isDark);
        }
    };
    
    if (themeToggle) {
        const isDarkModeInitial = currentMode === 'dark-mode';
        updateDarkMode(isDarkModeInitial);

        themeToggle.addEventListener('click', () => {
            // منطق التبديل: إذا كان فاتحاً، يصبح داكناً. إذا كان داكناً، يصبح فاتحاً.
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'light';
            updateDarkMode(isDarkMode);
        });
    }

    // 2. **القائمة الجانبية (Hamburger Menu) - المنطق الأصلي يعمل**
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
        if (e.key === 'Escape' && sideMenu?.classList.contains('open') ?? false) {
            toggleMenu();
        }
    });
    

    // 3. **شريط إشعار تيليجرام**
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

    
    // 4. **منطق البحث والعرض**
    if (booksGrid && resultsStatus) {
        resultsStatus.textContent = "الكتب المتوفرة في المخزن (ابدأ البحث)";
        displayBooks(booksGrid, booksData);
    }
    if (latestBooksGrid) {
        displayLatestBooks();
    }
    
    // ربط البحث (Debouncing)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, DEBOUNCE_DELAY);
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

    // 5. **ميزة البحث الصوتي (Speech Recognition API)**
    const voiceSearchBtn = document.getElementById('voice-search-btn');
    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', () => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                 alert('البحث الصوتي غير مدعوم في متصفحك الحالي، يرجى استخدام متصفح كروم أو فايرفوكس.');
                 return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'ar-SA'; // لغة عربية
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            
            const micIcon = voiceSearchBtn.querySelector('i');
            if (micIcon) micIcon.className = 'fas fa-microphone-alt-slash';
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = transcript;
                    performSearch(transcript); 
                }
            };

            recognition.onend = () => {
                if (micIcon) micIcon.className = 'fas fa-microphone';
            };

            recognition.onerror = (event) => {
                console.error('Speech Recognition Error:', event.error);
                alert(`حدث خطأ أثناء البحث الصوتي: ${event.error}`);
                if (micIcon) micIcon.className = 'fas fa-microphone';
            };

            recognition.start();
        });
    }


    // 6. **تحسين تجربة القراءة والتنقل**
    
    // (45) دالة التمرير إلى أعلى الصفحة
    document.getElementById('scroll-top-btn')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // (24) تسجيل Service Worker (لتحسين الأداء لاحقاً)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch(err => console.error('Service Worker Failed:', err));
    }
});
