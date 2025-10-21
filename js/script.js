/*
 * ------------------------------------------------------------------
 * ملف app.js النهائي: دعم صور الأغلفة والتحميل من JSON (v20251029)
 * ------------------------------------------------------------------
 */

// ===============================================
// I. البيانات الأصلية والثوابت
// ===============================================
let booksData = []; // سيتم ملؤه من ملف /data/books.json
const DEBOUNCE_DELAY = 300; 
let searchTimeout;

// ===============================================
// II. وظائف المساعدة الرئيسية (منطق المكتبة)
// ===============================================

/** يعرض الكتب في شبكة معينة */
function displayBooks(gridElement, books, query = '') {
    const resultsStatus = document.getElementById('results-status');
    const template = document.getElementById('post-template');
    
    if (!template || !gridElement) return;

    gridElement.innerHTML = '';
    
    if (gridElement.id === 'books-grid' && resultsStatus) {
        const titleText = query 
            ? `نتائج البحث عن: "${query}" في الأرشيف (${books.length} كتاب)` 
            : "جميع الكتب المتوفرة في الأرشيف";
        resultsStatus.textContent = titleText;

        if (books.length === 0 && query) {
            gridElement.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-color);">لم يتم العثور على نتائج مطابقة.</p>';
            return;
        }
    }
    
    const fragment = document.createDocumentFragment();

    books.forEach(book => {
        const cardClone = document.importNode(template.content, true);
        const card = cardClone.querySelector('.book-card');

        // 👈🏻 تحديث معالجة الغلاف (باستخدام <img>)
        const bookCoverDiv = card.querySelector('.book-cover');
        if (bookCoverDiv) {
            const img = document.createElement('img');
            img.src = book.cover; 
            img.alt = `غلاف كتاب: ${book.title}`; 
            img.loading = 'lazy'; 
            
            bookCoverDiv.innerHTML = ''; 
            bookCoverDiv.appendChild(img);
        }

        if (card.querySelector('h3')) card.querySelector('h3').textContent = book.title;
        const authorSpan = card.querySelector('.card-info p span');
        if(authorSpan) authorSpan.textContent = book.author;
        
        // ربط رابط التحميل المباشر
        const downloadLink = card.querySelector('.download-btn'); 
        if (downloadLink) {
            downloadLink.href = book.pdf_link;
            downloadLink.setAttribute('download', `${book.title} - ${book.author}.pdf`);
            downloadLink.addEventListener('click', (e) => { e.stopPropagation(); });
        }
        
        const tagsDiv = card.querySelector('.book-tags');
        if (tagsDiv) tagsDiv.innerHTML = book.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('');

        // حدث النقر على البطاقة (للتفاصيل)
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag')) return; 
            alert(`معلومات عن الكتاب: ${book.title}\nالمؤلف: ${book.author}\nسنة النشر: ${book.year}\nالتصنيفات: ${book.tags.join(', ')}`);
        });
        
        fragment.appendChild(card);
    });
    
    gridElement.appendChild(fragment);
}

/** يعرض آخر 4 كتب مضافة */
function displayLatestBooks() {
    if (booksData.length === 0) return;
    const latestBooksGrid = document.getElementById('latest-books-grid');
    if (!latestBooksGrid) return;
    const sortedBooks = [...booksData].sort((a, b) => b.year - a.year);
    const latestFour = sortedBooks.slice(0, 4); 
    displayBooks(latestBooksGrid, latestFour);
}


/** يقوم بمنطق البحث ويخفي/يظهر الأقسام */
function performSearch(query) {
    if (booksData.length === 0) return;
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return;
    
    query = query.trim().toLowerCase();
    
    const filteredBooks = booksData.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    const sectionsToHide = ['latest-books', 'author-section', 'categories-section', 'about-section'];
    sectionsToHide.forEach(id => {
        const section = document.getElementById(id);
        if(section) section.style.display = query ? 'none' : 'block';
    });
    
    displayBooks(booksGrid, filteredBooks, query);
}

/** وظيفة تحميل البيانات من ملف JSON */
async function loadBooksData() {
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) resultsContainer.innerHTML = '<p style="text-align:center;">يتم تحميل بيانات المكتبة...</p>';

    try {
        const response = await fetch('./data/books.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        booksData = await response.json();
        
        // بمجرد تحميل البيانات، ابدأ بعرض الكتب
        performSearch(''); 
        displayLatestBooks();
        
    } catch (error) {
        console.error("خطأ في تحميل بيانات الكتب من ملف JSON:", error);
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p style="color:red; text-align:center;">تعذر تحميل بيانات المكتبة. يرجى التحقق من ملف /data/books.json.</p>';
        }
    }
}


// ===============================================
// III. دالة DOMContentLoaded الرئيسية (إصلاحات الأزرار والـ Menu)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تحميل البيانات
    loadBooksData(); 

    // 2. العناصر الأساسية
    const themeToggle = document.getElementById('theme-toggle'); 
    const menuToggle = document.getElementById('menu-toggle');     
    const sideMenu = document.getElementById('side-menu');         
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('overlay');
    const bodyElement = document.body;
    const searchInput = document.getElementById('search-input');
    const telegramBanner = document.getElementById('telegram-banner');
    const closeBannerBtn = document.getElementById('close-banner-btn');
    const scrollTopBtn = document.getElementById('scroll-top-btn');

    // 3. الوضع الليلي (Dark Mode)
    const currentMode = localStorage.getItem('theme') || 'light-mode';
    const updateDarkMode = (isDark) => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark-mode' : 'light-mode');
        if (themeToggle) {
             themeToggle.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
             themeToggle.setAttribute('aria-pressed', isDark);
        }
    };
    if (themeToggle) {
        updateDarkMode(currentMode === 'dark-mode');
        themeToggle.addEventListener('click', () => {
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'light';
            updateDarkMode(isDarkMode);
        });
    }

    // 4. القائمة الجانبية (Hamburger Menu) - إصلاح شامل ومضمون
    const toggleMenu = () => {
         if (!sideMenu || !overlay) return;
         const isMenuOpen = sideMenu.classList.contains('open');
         
         if (isMenuOpen) {
             sideMenu.classList.remove('open');
             overlay.classList.remove('active');
             bodyElement.style.overflow = 'auto'; 
             if (menuToggle) menuToggle.setAttribute('aria-expanded', false);
         } else {
             sideMenu.classList.add('open');
             overlay.classList.add('active');
             bodyElement.style.overflow = 'hidden'; 
             if (menuToggle) menuToggle.setAttribute('aria-expanded', true);
         }
    };
    
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sideMenu?.classList.contains('open') ?? false) { toggleMenu(); }
    });

    // 5. شريط إشعار تيليجرام
    if (telegramBanner) {
        telegramBanner.style.display = localStorage.getItem('bannerHidden') !== 'true' ? 'block' : 'none';
    }
    if (closeBannerBtn && telegramBanner) {
         closeBannerBtn.addEventListener('click', () => {
             telegramBanner.style.setProperty('opacity', '0');
             setTimeout(() => { telegramBanner.style.setProperty('display', 'none'); }, 300);
             localStorage.setItem('bannerHidden', 'true');
         });
    }

    // 6. منطق البحث العادي والبحث الفوري (Tags & Categories)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => { performSearch(e.target.value); }, DEBOUNCE_DELAY);
        });
    }
    if (document.getElementById('search-button') && searchInput) {
        document.getElementById('search-button').addEventListener('click', (e) => {
            e.preventDefault();
            performSearch(searchInput.value);
            searchInput.focus();
        });
    }
    document.addEventListener('click', (e) => {
        const target = e.target;
        let tag = null;
        if (target.classList.contains('tag')) { tag = target.getAttribute('data-tag'); } 
        else if (target.closest('.category-btn')) { tag = target.closest('.category-btn').getAttribute('data-tag'); }

        if (tag && searchInput) {
            searchInput.value = tag;
            performSearch(tag);
            if (sideMenu?.classList.contains('open')) { toggleMenu(); }
        }
        
        if (target.classList.contains('menu-link') && target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = target.getAttribute('href').substring(1);
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            if (sideMenu?.classList.contains('open')) { toggleMenu(); }
        }
    });

    // 7. زر "كتاب عشوائي"
    document.getElementById('random-book-btn')?.addEventListener('click', () => {
         if (booksData.length === 0) { alert('يتم تحميل بيانات الكتب، يرجى الانتظار.'); return; }
         const randomIndex = Math.floor(Math.random() * booksData.length);
         window.open(booksData[randomIndex].pdf_link, '_blank');
         alert(`كتاب اليوم المختار: ${booksData[randomIndex].title}.`);
    });

    // 8. ميزة البحث الصوتي (API)
    document.getElementById('voice-search-btn')?.addEventListener('click', () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
             alert('البحث الصوتي غير مدعوم في متصفحك الحالي.'); return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA'; 
        const micIcon = document.getElementById('voice-search-btn').querySelector('i');
        
        if (micIcon) micIcon.className = 'fas fa-microphone-alt-slash';
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (searchInput) { searchInput.value = transcript; performSearch(transcript); }
        };
        recognition.onend = () => { if (micIcon) micIcon.className = 'fas fa-microphone'; };
        recognition.onerror = (event) => { 
            console.error('Speech Recognition Error:', event.error);
            if (micIcon) micIcon.className = 'fas fa-microphone';
        };
        recognition.start();
    });

    // 9. زر الصعود للأعلى (Scroll Top Button)
    if(scrollTopBtn){
        window.addEventListener('scroll', () => {
            scrollTopBtn.style.display = window.scrollY > 200 ? 'flex' : 'none';
        });
        scrollTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // 10. تحديث تاريخ الفوتر
    const footerDateSpan = document.getElementById('footer-date');
    if (footerDateSpan) { footerDateSpan.textContent = new Date().getFullYear(); }

    // 11. تسجيل Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch(err => console.error('Service Worker Failed:', err));
    }
});
