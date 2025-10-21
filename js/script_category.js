/*
 * ------------------------------------------------------------------
 * ملف script_category.js: خاص بصفحة الأقسام (category.html) (v20251037)
 * الوظائف: قراءة القسم من URL، تصفية الكتب ضمن القسم، البحث المحدود.
 * ------------------------------------------------------------------
 */

// ===============================================
// I. البيانات الأصلية والثوابت
// ===============================================
let booksData = []; 
const DEBOUNCE_DELAY = 300; 
let searchTimeout;
let currentCategory = null; // متغير لتخزين القسم الحالي

// ===============================================
// II. وظائف المساعدة الرئيسية (منطق المكتبة)
// ===============================================

/** يستخرج اسم القسم من رابط الصفحة إذا كان موجوداً */
function getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');
    
    if (category) {
        // فك تشفير اسم القسم ليتوافق مع اللغة العربية
        const decodedCategory = decodeURIComponent(category);
        document.getElementById('category-name')?.textContent = decodedCategory;
        document.title = `أرشيف الكتب المجانية | ${decodedCategory}`;
        return decodedCategory;
    }
    return null;
}

/** يعرض الكتب في شبكة معينة */
function displayBooks(gridElement, books, query = '') {
    const resultsStatus = document.getElementById('results-status');
    const template = document.getElementById('post-template');
    
    if (!template || !gridElement) return;
    gridElement.innerHTML = '';
    
    // منطق تحديث الحالة والعنوان في صفحة القسم
    if (resultsStatus && gridElement.id === 'books-grid') {
        resultsStatus.textContent = query 
            ? `نتائج البحث عن: "${query}" في قسم ${currentCategory} (${books.length} كتاب)` 
            : `يتم عرض ${books.length} كتاب في قسم ${currentCategory}.`;

        if (books.length === 0) {
            gridElement.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-color);">لا تتوفر كتب في هذا التصنيف حالياً أو لم يتم العثور على نتائج مطابقة.</p>';
            return;
        }
        // 🚀 إضافة #3: تشغيل تأثير العد لنتائج البحث
        if (query) {
             animateCountUp(resultsStatus, books.length);
        }
    }
    
    const fragment = document.createDocumentFragment();

    books.forEach(book => {
        const cardClone = document.importNode(template.content, true);
        const card = cardClone.querySelector('.book-card');

        // 🚀 إضافة #7: تتبع نقرات التحميل لكل كتاب
        card.querySelector('.download-btn')?.addEventListener('click', () => trackDownload(book.title));

        // 🚀 إضافة #10: عرض نص مختصر للكتاب 
        const snippetElement = card.querySelector('.book-snippet');
        if (snippetElement) { snippetElement.textContent = book.snippet || 'اضغط للعرض التفاصيل...'; }
        
        const bookCoverDiv = card.querySelector('.book-cover');
        if (bookCoverDiv) {
            const img = document.createElement('img');
            img.src = book.cover; 
            img.alt = `غلاف كتاب: ${book.title}`; 
            img.loading = 'lazy'; 
            
            // 🚀 إضافة #8: إضافة معالج للأخطاء (Fallback) عند فشل تحميل الغلاف
            img.onerror = () => { img.src = '/img/default_cover.jpg'; img.alt = 'غلاف افتراضي'; };
            bookCoverDiv.innerHTML = ''; 
            bookCoverDiv.appendChild(img);
        }

        if (card.querySelector('h3')) card.querySelector('h3').textContent = book.title;
        const authorSpan = card.querySelector('.card-info p span');
        if(authorSpan) authorSpan.textContent = book.author;
        
        const downloadLink = card.querySelector('.download-btn'); 
        if (downloadLink) {
            downloadLink.href = book.pdf_link;
            downloadLink.setAttribute('download', `${book.title} - ${book.author}.pdf`);
            downloadLink.addEventListener('click', (e) => { e.stopPropagation(); }); 
        }
        
        const tagsDiv = card.querySelector('.book-tags');
        if (tagsDiv) tagsDiv.innerHTML = book.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('');

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag')) return; 
            alert(`معلومات عن الكتاب: ${book.title}\nالمؤلف: ${book.author}\nسنة النشر: ${book.year}\nالتصنيفات: ${book.tags.join(', ')}`);
        });
        
        // 🚀 إضافة #2: إضافة حركة تدهور (Fade-in) للبطاقة
        setTimeout(() => { card.classList.add('fade-in'); }, 50);
        
        fragment.appendChild(card);
    });
    
    gridElement.appendChild(fragment);
}


/** يقوم بمنطق البحث المحدود ضمن القسم الحالي */
function performSearch(query) {
    if (booksData.length === 0 || !currentCategory) return;
    const booksGrid = document.getElementById('books-grid');
    if (!booksGrid) return;
    
    query = query.trim().toLowerCase();
    
    // 1. تحديد المجموعة الأساسية للبحث: كتب القسم الحالي فقط
    const categoryBooks = booksData.filter(book => book.tags.some(tag => tag === currentCategory));
    
    // 2. تصفية الكتب بناءً على الاستعلام (ضمن كتب القسم فقط)
    const filteredBooks = categoryBooks.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    // 3. عرض النتائج
    displayBooks(booksGrid, filteredBooks, query);
    
    // 4. 🚀 إضافة #4: حفظ آخر بحث في ذاكرة المتصفح
    // لا نحفظ البحث هنا إلا إذا كنا نريد استرجاعه في نفس صفحة القسم لاحقاً
    // localStorage.setItem('lastSearchQueryCategory', query);
}

/** وظيفة تحميل البيانات من ملف JSON */
async function loadBooksData() {
    const errorContainer = document.createElement('p');
    errorContainer.style.color = 'red';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.padding = '10px 0';
    
    const resultsContainer = document.getElementById('books-grid');
    if (resultsContainer) {
        resultsContainer.innerHTML = '<p style="text-align:center;">يتم تحميل بيانات المكتبة...</p>';
    }

    // 🏆 منطق المسار المزدوج (لضمان التحميل)
    const possiblePaths = ['/data/books.json', './data/books.json'];
    let success = false;
    
    for (const path of possiblePaths) {
        try {
            const response = await fetch(path); 
            if (!response.ok) { continue; } 
            
            booksData = await response.json();
            
            if (!Array.isArray(booksData)) { throw new Error("JSON format error: Expected an array of books."); }
            
            if (resultsContainer) resultsContainer.innerHTML = ''; 
            
            // ----------------------------------------------------
            // 🏆 المنطق الخاص بصفحة القسم:
            // ----------------------------------------------------
            currentCategory = getCategoryFromURL();
            
            if (currentCategory) {
                // نحن في صفحة قسم: نقوم بالتصفية الفورية وعرض جميع كتب القسم
                performSearch(''); 
            } else {
                 // إذا تم فتح category.html بدون متغير cat، نعرض رسالة خطأ
                 resultsContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">لم يتم تحديد القسم المراد عرضه في الرابط.</p>';
            }
            // ----------------------------------------------------

            success = true;
            break; 
            
        } catch (error) {
            console.error(`خطأ في تحميل بيانات الكتب من المسار ${path}:`, error);
        }
    }
    
    if (!success) {
        console.error("فشل تحميل البيانات من جميع المسارات المتاحة.");
        if (resultsContainer) {
            resultsContainer.innerHTML = ''; 
            errorContainer.innerHTML = 'تعذر تحميل بيانات المكتبة. يرجى التأكد من أن ملف <span style="font-weight: bold;">data/books.json</span> موجود وصيغته صحيحة.';
            document.querySelector('main')?.prepend(errorContainer);
        }
    }
}


// ===============================================
// III. الإضافات المبتكرة العشرة (وظائف مشتركة)
// ===============================================

/** 🚀 إضافة #3: تأثير عداد (Count-Up) لعدد نتائج البحث */
function animateCountUp(element, finalValue) {
    // ... (الكود كما هو سابقاً) ...
}

/** 🚀 إضافة #6: تفعيل البحث عند ضغط زر Enter */
function handleEnterKeySearch(event) {
    if (event.key === 'Enter') {
        const searchInput = document.getElementById('section-search-input'); // الإيدي الخاص ببحث القسم
        if (searchInput) {
            event.preventDefault(); 
            performSearch(searchInput.value);
            searchInput.blur(); 
        }
    }
}

/** 🚀 إضافة #7: تتبع نقرات التحميل (إحصائية بسيطة) */
function trackDownload(bookTitle) {
    // ... (الكود كما هو سابقاً) ...
}

// ===============================================
// IV. دالة DOMContentLoaded الرئيسية
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تحميل البيانات
    loadBooksData(); 

    // 2. العناصر الأساسية 
    // (جميع عناصر القائمة/الوضع الليلي المشتركة)
    const themeToggle = document.getElementById('theme-toggle'); 
    const menuToggle = document.getElementById('menu-toggle');     
    const sideMenu = document.getElementById('side-menu');         
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('overlay');
    const bodyElement = document.body;
    
    // 🔑 الإيدي الخاص بصفحة category.html
    const searchInput = document.getElementById('section-search-input'); 
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const voiceSearchBtn = document.getElementById('voice-search-btn'); 

    
    // 3. الوضع الليلي (Dark Mode) ... (كود الوضع الليلي) ...
    // (يجب أن يبقى كود الوضع الليلي كما هو)
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

    // 4. منطق عمل القائمة الجانبية (Hamburger Menu) ... 
    // (يجب أن يبقى كود القائمة كما هو)
    const toggleMenu = (forceClose = false) => {
         if (!sideMenu || !overlay) return;
         const isMenuOpen = sideMenu.classList.contains('open');

         if (isMenuOpen || forceClose) {
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
    
    if (menuToggle) menuToggle.addEventListener('click', () => toggleMenu());
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => toggleMenu(true));
    if (overlay) overlay.addEventListener('click', () => toggleMenu(true));
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sideMenu?.classList.contains('open')) { toggleMenu(true); }
    });

    // 5. منطق البحث
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => { performSearch(e.target.value); }, DEBOUNCE_DELAY);
            // 🚀 إضافة #10: إظهار/إخفاء زر مسح البحث عند الكتابة
            const clearBtn = document.getElementById('clear-search-btn');
            if (clearBtn) clearBtn.style.display = e.target.value.length > 0 ? 'block' : 'none';
        });
         // 🚀 إضافة #6: ربط دالة Enter Key
        searchInput.addEventListener('keydown', handleEnterKeySearch);
    }
    
    const searchButton = document.getElementById('section-search-button'); 
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch(searchInput.value);
            searchInput.focus();
        });
    }

    // 🚀 إضافة #10: زر مسح البحث 
    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            performSearch('');
            clearSearchBtn.style.display = 'none';
            searchInput.focus();
        });
    }
    
    // منع البحث الصوتي لعدم وجود API مفعّل
    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', () => {
             alert("خاصية البحث الصوتي غير مفعلة حالياً في هذا الإصدار.");
        });
    }

    // 6. زر الصعود للأعلى (Scroll Top Button) ...
    
    if(scrollTopBtn){
        window.addEventListener('scroll', () => {
            scrollTopBtn.style.display = window.scrollY > 200 ? 'flex' : 'none';
            // 🚀 إضافة #9: تأثير اللون الديناميكي للزر 
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            scrollTopBtn.style.backgroundColor = isDark ? 'var(--accent-color)' : 'var(--primary-color)';
        });
        scrollTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // 7. تحديث تاريخ الفوتر وتسجيل Service Worker
    const footerDateSpan = document.getElementById('footer-date');
    if (footerDateSpan) { footerDateSpan.textContent = new Date().getFullYear(); }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch(err => console.error('Service Worker Failed:', err));
    }
});
