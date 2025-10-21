/*
 * ------------------------------------------------------------------
 * ملف script.js النهائي والموحد (Router Mode) (v20251038)
 * الوظائف: يخدم index.html و category.html، ويحل مشكلة مسار JSON.
 * ------------------------------------------------------------------
 */

// ===============================================
// I. البيانات الأصلية والثوابت
// ===============================================
let booksData = []; 
const DEBOUNCE_DELAY = 300; 
let searchTimeout;
let currentCategory = null; // متغير لتخزين القسم الحالي (إذا كنا في صفحة قسم)

// ===============================================
// II. وظائف المساعدة الرئيسية (منطق المكتبة)
// ===============================================

/** يستخرج اسم القسم من رابط الصفحة إذا كان موجوداً */
function getCategoryFromURL() {
    // التحقق من اسم الصفحة (إذا كان category.html)
    const pageName = window.location.pathname.split('/').pop();
    if (pageName !== 'category.html') {
        return null; // لسنا في صفحة قسم
    }

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat');
    
    if (category) {
        const decodedCategory = decodeURIComponent(category);
        document.getElementById('category-name')?.textContent = decodedCategory;
        document.title = `أرشيف الكتب المجانية | ${decodedCategory}`;
        return decodedCategory;
    }
    return null;
}

/** يعرض الكتب في شبكة معينة (مع دعم وضع Router) */
function displayBooks(gridElement, books, isCategoryPage = false, query = '') {
    const resultsStatus = document.getElementById('results-status');
    const template = document.getElementById('post-template');
    
    if (!template || !gridElement) return;
    gridElement.innerHTML = '';
    
    // منطق تحديث الحالة والعنوان (موحد)
    if (resultsStatus) {
        if (isCategoryPage) {
             resultsStatus.textContent = query 
                ? `نتائج البحث عن: "${query}" في قسم ${currentCategory} (${books.length} كتاب)` 
                : `يتم عرض ${books.length} كتاب في قسم ${currentCategory}.`;
        } else { // الصفحة الرئيسية
             resultsStatus.textContent = query 
                ? `نتائج البحث عن: "${query}" في الأرشيف (${books.length} كتاب)` 
                : "";
        }

        if (books.length === 0 && (isCategoryPage || query)) {
            gridElement.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-color);">لم يتم العثور على نتائج مطابقة.</p>';
            if (isCategoryPage && !query) gridElement.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-color);">لا تتوفر كتب في هذا التصنيف حالياً.</p>';
            return;
        }
        // 🚀 إضافة #3: تشغيل تأثير العد لنتائج البحث
        if (query) { animateCountUp(resultsStatus, books.length); }
    }
    
    const fragment = document.createDocumentFragment();

    books.forEach(book => {
        const cardClone = document.importNode(template.content, true);
        const card = cardClone.querySelector('.book-card');
        
        // 🚀 إضافة #7: تتبع نقرات التحميل
        card.querySelector('.download-btn')?.addEventListener('click', () => trackDownload(book.title));
        
        // 🚀 إضافة #10: عرض نص مختصر للكتاب
        const snippetElement = card.querySelector('.book-snippet');
        if (snippetElement) { snippetElement.textContent = book.snippet || 'اضغط للعرض التفاصيل...'; }
        
        const bookCoverDiv = card.querySelector('.book-cover');
        if (bookCoverDiv) {
            const img = document.createElement('img');
            img.src = book.cover; // img/arsheef_alkutb.jpg
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
            downloadLink.href = book.pdf_link; // pdfs/arsheef_alkutb.pdf
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


/** يعرض آخر 4 كتب مضافة (فقط في الصفحة الرئيسية) */
function displayLatestBooks() {
    if (booksData.length === 0) return;
    const latestBooksGrid = document.getElementById('latest-books-grid');
    if (!latestBooksGrid) return;
    // نفترض أن الكتب مرتبة تنازلياً حسب ID أو Year للعرض كـ "آخر الإضافات"
    const sortedBooks = [...booksData].sort((a, b) => (b.id || b.year) - (a.id || a.year)); 
    const latestFour = sortedBooks.slice(0, 4); 
    displayBooks(latestBooksGrid, latestFour, false);
}

/** يقوم بمنطق البحث (شامل في Index، ومحدود في Category) */
function performSearch(query) {
    if (booksData.length === 0) return;
    
    const isCategoryPage = currentCategory !== null;
    // استخدام الإيدي الموحد لشبكة نتائج البحث/القسم
    const booksGrid = document.getElementById('books-grid'); 
    const latestSection = document.getElementById('latest-books'); // قسم آخر الإضافات

    if (!booksGrid) return;
    
    query = query.trim().toLowerCase();
    
    // 1. تحديد المجموعة الأساسية للبحث
    let searchPool = booksData;
    if (isCategoryPage) {
        // في صفحة القسم: نبحث فقط ضمن كتب هذا القسم
        searchPool = booksData.filter(book => book.tags.some(tag => tag === currentCategory));
    }
    
    // 2. تصفية الكتب
    const filteredBooks = searchPool.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    // 3. إظهار/إخفاء الأقسام في الصفحة الرئيسية فقط (بناءً على وجود استعلام بحث)
    if (!isCategoryPage && latestSection) {
        if (query) {
            latestSection.style.display = 'none'; // إخفاء قسم آخر الإضافات
            booksGrid.style.display = 'grid'; // إظهار شبكة نتائج البحث
        } else {
            latestSection.style.display = 'block'; // إظهار قسم آخر الإضافات
            booksGrid.style.display = 'none'; // إخفاء شبكة نتائج البحث
            displayLatestBooks(); // إعادة عرض آخر الإضافات
        }
    }

    // 4. عرض النتائج
    displayBooks(booksGrid, filteredBooks, isCategoryPage, query);
    
    // 5. حفظ آخر بحث في ذاكرة المتصفح
    localStorage.setItem('lastSearchQuery', query);
}

/** وظيفة تحميل البيانات من ملف JSON - (الحل الجذري للمسار) */
async function loadBooksData() {
    const errorContainer = document.createElement('p');
    errorContainer.style.color = 'red';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.padding = '10px 0';
    
    const resultsContainer = document.getElementById('latest-books-grid') || document.getElementById('books-grid');
    if (resultsContainer) {
        resultsContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align:center;">يتم تحميل بيانات المكتبة...</p>';
    }

    // 🏆 تصحيح الخطأ: قائمة بالمسارات المحتملة للبيانات (في بيئة GitHub Pages أو بيئة محلية)
    // هذا يحل مشكلة الـ MIME Type و الـ Root Path الشائعة جداً
    const possiblePaths = ['/Books/data/books.json', './data/books.json', '/data/books.json'];
    let success = false;
    
    for (const path of possiblePaths) {
        try {
            const response = await fetch(path); 
            if (!response.ok) { continue; } 
            
            booksData = await response.json();
            
            if (!Array.isArray(booksData)) { throw new Error("JSON format error: Expected an array of books."); }
            
            if (resultsContainer) resultsContainer.innerHTML = ''; 
            
            // ----------------------------------------------------
            // 🏆 منطق التوجيه (Routing Logic)
            // ----------------------------------------------------
            currentCategory = getCategoryFromURL();
            
            if (currentCategory) {
                // الوضع 1: نحن في صفحة قسم (category.html)
                performSearch(''); // لعرض جميع كتب القسم
            } else {
                // الوضع 2: نحن في الصفحة الرئيسية (index.html)
                updateLibraryStats(); 
                displayLatestBooks();

                // استرجاع آخر بحث وتشغيله (للبحث الشامل)
                const lastQuery = localStorage.getItem('lastSearchQuery');
                const searchInput = document.getElementById('main-search-input');
                if (lastQuery && lastQuery.trim() !== '' && searchInput) {
                    searchInput.value = lastQuery;
                    performSearch(lastQuery);
                }
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

/** 🚀 إضافة #1: وظيفة لتحديث إحصائيات المكتبة (المؤلفين والكتب) */
function updateLibraryStats() {
    if (booksData.length === 0) return;
    const totalBooks = booksData.length;
    const uniqueAuthors = new Set(booksData.map(book => book.author.trim().toLowerCase()));
    const totalAuthors = uniqueAuthors.size;
    const totalBooksEl = document.getElementById('total-books-count');
    const totalAuthorsEl = document.getElementById('total-authors-count');
    if (totalBooksEl) totalBooksEl.textContent = totalBooks;
    if (totalAuthorsEl) totalAuthorsEl.textContent = totalAuthors;
}


/** 🚀 إضافة #3: تأثير عداد (Count-Up) لعدد نتائج البحث */
function animateCountUp(element, finalValue) {
    if (finalValue === 0) return;
    const duration = 800; 
    let startTime;
    
    const originalText = element.textContent.replace(/\((.*?)\)/, '(COUNT)');

    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        const currentValue = Math.floor(percentage * finalValue);

        element.textContent = originalText.replace('(COUNT)', `(${currentValue} كتاب)`);

        if (percentage < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

/** 🚀 إضافة #6: تفعيل البحث عند ضغط زر Enter */
function handleEnterKeySearch(event) {
    if (event.key === 'Enter') {
        // تحديد حقل البحث الصحيح بناءً على الصفحة
        const searchInput = document.getElementById('main-search-input') || document.getElementById('section-search-input');
        if (searchInput) {
            event.preventDefault(); 
            performSearch(searchInput.value);
            searchInput.blur(); 
        }
    }
}

/** 🚀 إضافة #7: تتبع نقرات التحميل (إحصائية بسيطة) */
function trackDownload(bookTitle) {
    let downloadCounts = JSON.parse(localStorage.getItem('downloadCounts') || '{}');
    downloadCounts[bookTitle] = (downloadCounts[bookTitle] || 0) + 1;
    localStorage.setItem('downloadCounts', JSON.stringify(downloadCounts));
    console.log(`تم تسجيل تحميل كتاب: ${bookTitle}. إجمالي التحميلات: ${downloadCounts[bookTitle]}`);
}


// ===============================================
// IV. دالة DOMContentLoaded الرئيسية
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
    
    // 🔑 تحديد حقل البحث الرئيسي أو بحث القسم بناءً على الصفحة الحالية
    const searchInput = document.getElementById('main-search-input') || document.getElementById('section-search-input'); 
    const searchButton = document.getElementById('main-search-button') || document.getElementById('section-search-button');

    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const voiceSearchBtn = document.getElementById('voice-search-btn'); 

    
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

    // 4. منطق عمل القائمة الجانبية (Hamburger Menu) 
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
        searchInput.addEventListener('keydown', handleEnterKeySearch);
    }
    
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

    // 6. ربط النقرات على العلامات وروابط القائمة الجانبية
    document.addEventListener('click', (e) => {
        const target = e.target;
        let tag = null;
        if (target.classList.contains('tag')) { tag = target.getAttribute('data-tag'); } 
        
        if (tag && searchInput) {
            searchInput.value = tag;
            performSearch(tag);
            if (sideMenu?.classList.contains('open')) { toggleMenu(true); } 
        }
        
        // معالجة التنقل السلس (Smooth Scroll)
        if (target.classList.contains('menu-link') && target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = target.getAttribute('href').substring(1);
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            if (sideMenu?.classList.contains('open')) { toggleMenu(true); }
        }
    });

    // 7. زر "كتاب عشوائي" 
    document.getElementById('random-book-btn')?.addEventListener('click', () => {
         if (booksData.length === 0) { alert('يتم تحميل بيانات الكتب، يرجى الانتظار.'); return; }
         const randomIndex = Math.floor(Math.random() * booksData.length);
         window.open(booksData[randomIndex].pdf_link, '_blank');
         alert(`كتاب اليوم المختار: ${booksData[randomIndex].title}.`);
    });


    // 8. زر الصعود للأعلى (Scroll Top Button) 
    if(scrollTopBtn){
        window.addEventListener('scroll', () => {
            scrollTopBtn.style.display = window.scrollY > 200 ? 'flex' : 'none';
            // 🚀 إضافة #9: تأثير اللون الديناميكي للزر 
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            scrollTopBtn.style.backgroundColor = isDark ? 'var(--accent-color)' : 'var(--primary-color)';
        });
        scrollTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // 9. تحديث تاريخ الفوتر وتسجيل Service Worker
    const footerDateSpan = document.getElementById('footer-date');
    if (footerDateSpan) { footerDateSpan.textContent = new Date().getFullYear(); }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch(err => console.error('Service Worker Failed:', err));
    }
});
