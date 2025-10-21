/*
 * ------------------------------------------------------------------
 * ملف script.js النهائي والمصمم مع الإضافات المبتكرة
 * ------------------------------------------------------------------
 */

// ===============================================
// I. البيانات الأصلية والثوابت
// ===============================================
let booksData = []; 
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
        // 🚀 إضافة #3: تشغيل تأثير العد (Count-Up Effect) لنتائج البحث
        if (query) {
             animateCountUp(resultsStatus, books.length);
        }
    }
    
    const fragment = document.createDocumentFragment();

    books.forEach(book => {
        const cardClone = document.importNode(template.content, true);
        const card = cardClone.querySelector('.book-card');

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
        setTimeout(() => {
             card.classList.add('fade-in');
        }, 50); // تأخير بسيط للسماح بالتنسيق
        
        fragment.appendChild(card);
    });
    
    gridElement.appendChild(fragment);
}

/** يعرض آخر 4 كتب مضافة */
function displayLatestBooks() {
    if (booksData.length === 0) return;
    const latestBooksGrid = document.getElementById('latest-books-grid');
    if (!latestBooksGrid) return;
    const sortedBooks = [...booksData].sort((a, b) => (b.id || b.year) - (a.id || a.year)); 
    const latestFour = sortedBooks.slice(0, 4); 
    displayBooks(latestBooksGrid, latestFour);
}


/** يقوم بمنطق البحث */
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
    
    // 🚀 إضافة #4: حفظ آخر بحث في ذاكرة المتصفح
    localStorage.setItem('lastSearchQuery', query);
}

/** وظيفة تحميل البيانات من ملف JSON */
async function loadBooksData() {
    const errorContainer = document.createElement('p');
    errorContainer.style.color = 'red';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.padding = '10px 0';
    
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
        resultsContainer.innerHTML = '<p style="text-align:center;">يتم تحميل بيانات المكتبة...</p>';
    }

    try {
        // 🚨 التصحيح الأساسي: استخدام المسار المطلق لضمان التحميل على GitHub Pages
        const response = await fetch('/data/books.json'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        booksData = await response.json();
        
        if (!Array.isArray(booksData)) {
             throw new Error("JSON format error: Expected an array of books (must start with [ and end with ]).");
        }
        
        if (resultsContainer) resultsContainer.innerHTML = ''; 
        
        // 🚀 إضافة #5: تحديث عدد المؤلفين والكتب في قسم الإحصائيات (إذا كان الكود موجوداً)
        updateLibraryStats(); 
        
        performSearch(''); 
        displayLatestBooks();
        
    } catch (error) {
        console.error("خطأ في تحميل بيانات الكتب من ملف JSON:", error);
        
        if (resultsContainer) {
            resultsContainer.innerHTML = ''; 
            errorContainer.innerHTML = 'تعذر تحميل بيانات المكتبة. يرجى التحقق من ملف <span style="font-weight: bold;">/data/books.json</span> (تأكد من أنه مصفوفة JSON: يبدأ بـ [ وينتهي بـ ]).';
            document.querySelector('main')?.prepend(errorContainer);
        }
    }
}


// ===============================================
// III. الإضافات المبتكرة (Innovative Additions)
// ===============================================

/** 🚀 إضافة #1: وظيفة لتحديث إحصائيات المكتبة (المؤلفين والكتب) */
function updateLibraryStats() {
    if (booksData.length === 0) return;

    // 1. حساب عدد الكتب الكلي
    const totalBooks = booksData.length;
    
    // 2. حساب عدد المؤلفين الفريدين
    const uniqueAuthors = new Set(booksData.map(book => book.author.trim().toLowerCase()));
    const totalAuthors = uniqueAuthors.size;

    // يمكنك الآن عرض هذه الأرقام في أي مكان في الـ HTML (مثلاً في الفوتر أو في قسم المؤلفين)
    // مثال (افتراضي): إذا كان لديك span بـ id="total-books-count"
    // const booksCountSpan = document.getElementById('total-books-count');
    // if (booksCountSpan) booksCountSpan.textContent = totalBooks;

    // مثال (افتراضي): تحديث مؤلف افتراضي في قسم المؤلفين
    const authorsGrid = document.getElementById('authors-grid');
    if (authorsGrid) {
         // نستخدم المؤلفين الأكثر تكراراً بدلاً من الأسماء الثابتة
         const authorCounts = {};
         booksData.forEach(book => {
             authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
         });
         const topAuthors = Object.entries(authorCounts)
             .sort(([, a], [, b]) => b - a)
             .slice(0, 3);
             
         // هذا يتطلب وجود Authors Grid بتصميم مناسب في الـ HTML
         // لكننا سنستخدم alert بسيط هنا لتجنب تغيير الـ HTML
         console.log(`إجمالي الكتب: ${totalBooks}, إجمالي المؤلفين: ${totalAuthors}.`);
    }
}


/** 🚀 إضافة #3: تأثير عداد (Count-Up) لعدد نتائج البحث */
function animateCountUp(element, finalValue) {
    if (finalValue === 0) return;
    const duration = 800; // مدة الحركة بالمللي ثانية
    let startTime;
    
    // حفظ النص الأصلي وتغيير العدد فقط
    const originalText = element.textContent.replace(/\((.*?)\)/, '(COUNT)');

    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        const currentValue = Math.floor(percentage * finalValue);

        // تحديث العنصر
        element.textContent = originalText.replace('(COUNT)', `(${currentValue} كتاب)`);

        if (percentage < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
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
    const searchInput = document.getElementById('search-input');
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const voiceSearchBtn = document.getElementById('voice-search-btn'); 
    
    // 🚀 إضافة #4: استرجاع آخر بحث وتشغيله
    const lastQuery = localStorage.getItem('lastSearchQuery');
    if (lastQuery && lastQuery.trim() !== '') {
        searchInput.value = lastQuery;
        performSearch(lastQuery);
    }


    // 3. الوضع الليلي (Dark Mode) ... [كود الوضع الليلي] ...

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

    // 4. منطق عمل القائمة الجانبية (Hamburger Menu) ... [كود القائمة] ...
    
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
        });
    }
    
    const searchButton = document.getElementById('search-button');
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch(searchInput.value);
            searchInput.focus();
        });
    }
    
    // منع البحث الصوتي لعدم وجود API مفعّل
    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', () => {
             alert("خاصية البحث الصوتي غير مفعلة حالياً في هذا الإصدار.");
        });
    }

    // 6. ربط النقرات على العلامات وروابط القائمة الجانبية ... [كود الروابط] ...
    
    document.addEventListener('click', (e) => {
        const target = e.target;
        let tag = null;
        if (target.classList.contains('tag')) { tag = target.getAttribute('data-tag'); } 
        else if (target.closest('.category-btn')) { tag = target.closest('.category-btn').getAttribute('data-tag'); }

        if (tag && searchInput) {
            searchInput.value = tag;
            performSearch(tag);
            if (sideMenu?.classList.contains('open')) { toggleMenu(true); } 
        }
        
        if (target.classList.contains('menu-link') && target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = target.getAttribute('href').substring(1);
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            if (sideMenu?.classList.contains('open')) { toggleMenu(true); }
        }
    });

    // 7. زر "كتاب عشوائي" ... [كود الكتاب العشوائي] ...
    
    document.getElementById('random-book-btn')?.addEventListener('click', () => {
         if (booksData.length === 0) { alert('يتم تحميل بيانات الكتب، يرجى الانتظار.'); return; }
         const randomIndex = Math.floor(Math.random() * booksData.length);
         window.open(booksData[randomIndex].pdf_link, '_blank');
         alert(`كتاب اليوم المختار: ${booksData[randomIndex].title}.`);
    });

    // 8. زر الصعود للأعلى (Scroll Top Button) ... [كود زر الصعود] ...
    
    if(scrollTopBtn){
        window.addEventListener('scroll', () => {
            scrollTopBtn.style.display = window.scrollY > 200 ? 'flex' : 'none';
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
    
    // 🚀 إضافة #2 (تنشيط حركة التدهور): تتطلب إضافة تنسيق CSS إضافي لـ .book-card.fade-in
    // .book-card { opacity: 0; transition: opacity 0.5s ease-out; }
    // .book-card.fade-in { opacity: 1; }
});
