/*
 * ------------------------------------------------------------------
 * ملف app.js النهائي: التزامن الكامل والوظائف المضافة
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
             resultsStatus.textContent = `نتائج البحث عن: "${query}" في الأرشيف (${books.length} كتاب)`;
        } else {
             resultsStatus.textContent = "الكتب المتوفرة في الأرشيف (ابدأ البحث)";
        }

        if (books.length === 0 && query) {
            gridElement.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-color);">لم يتم العثور على نتائج مطابقة.</p>';
            return;
        }
    }
    
    const fragment = document.createDocumentFragment();

    books.forEach(book => {
        const cardClone = template ? document.importNode(template.content, true) : document.createElement('div');
        const card = cardClone.querySelector('.book-card') || cardClone;

        if (card.querySelector('.book-cover')) card.querySelector('.book-cover').innerHTML = book.cover;
        if (card.querySelector('h3')) card.querySelector('h3').textContent = book.title;
        // تحديث المؤلف ليناسب هيكل Template:
        const authorSpan = card.querySelector('.card-info p span');
        if(authorSpan) authorSpan.textContent = book.author;
        
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
    
    // إخفاء الأقسام الأخرى عند البحث
    const latestBooksSection = document.getElementById('latest-books');
    const authorsSection = document.getElementById('author-section');
    const categoriesSection = document.getElementById('categories-section');
    const aboutSection = document.getElementById('about-section');

    if(latestBooksSection) latestBooksSection.style.display = query ? 'none' : 'aside';
    if(authorsSection) authorsSection.style.display = query ? 'none' : 'block';
    if(categoriesSection) categoriesSection.style.display = query ? 'none' : 'block';
    if(aboutSection) aboutSection.style.display = query ? 'none' : 'block';
    
    displayBooks(booksGrid, filteredBooks, query);
}

// ===============================================
// III. دالة DOMContentLoaded الرئيسية (حل نهائي للأزرار)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 🛑 العناصر الحيوية (الأزرار المعطلة)
    const themeToggle = document.getElementById('theme-toggle'); // زر التبديل
    const menuToggle = document.getElementById('menu-toggle');     // زر القائمة
    const sideMenu = document.getElementById('side-menu');         // القائمة
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('overlay');
    const bodyElement = document.body;
    const searchInput = document.getElementById('search-input');

    // 1. **الوضع الليلي (Dark Mode) - وظيفة التبديل**
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
            // منطق التبديل الصحيح: إذا كان فاتحاً ('light') يصبح داكناً.
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'light';
            updateDarkMode(isDarkMode);
        });
    }

    // 2. **القائمة الجانبية (Hamburger Menu) - وظيفة التبديل**
    const toggleMenu = () => {
         if (!sideMenu || !overlay) return;
         const isMenuOpen = sideMenu.classList.toggle('open');
         overlay.classList.toggle('active');
         // منع التمرير في الخلفية:
         bodyElement.style.overflow = isMenuOpen ? 'hidden' : 'auto'; 
         if (menuToggle) menuToggle.setAttribute('aria-expanded', isMenuOpen);
    };
    
    // ربط الأزرار (حل مشكلة عدم العمل)
    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    
    // إغلاق القائمة بالـ Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sideMenu?.classList.contains('open') ?? false) {
            toggleMenu();
        }
    });
    

    // 3. **منطق البحث والعرض**
    const booksGrid = document.getElementById('books-grid');
    const resultsStatus = document.getElementById('results-status');
    const latestBooksGrid = document.getElementById('latest-books-grid');

    if (booksGrid && resultsStatus) {
        resultsStatus.textContent = "الكتب المتوفرة في الأرشيف (ابدأ البحث)";
        displayBooks(booksGrid, booksData);
    }
    if (latestBooksGrid) {
        displayLatestBooks();
    }
    
    // ربط البحث وزر عشوائي (تمت إضافتهما من الردود السابقة)
    if (searchInput) {
        // Debouncing
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
    document.getElementById('random-book-btn')?.addEventListener('click', () => {
         if (booksData.length === 0) return;
         const randomIndex = Math.floor(Math.random() * booksData.length);
         window.open(booksData[randomIndex].pdf_link, '_blank');
         alert(`كتاب اليوم المختار: ${booksData[randomIndex].title}.`);
    });


    // تفعيل البحث الفوري بالنقر على الـ Tag أو زر الأقسام
    document.addEventListener('click', (e) => {
        const target = e.target;
        let tag = null;

        if (target.classList.contains('tag')) {
            tag = target.getAttribute('data-tag');
        } else if (target.classList.contains('category-btn')) {
            tag = target.getAttribute('data-tag');
        }

        if (tag && searchInput) {
            searchInput.value = tag;
            performSearch(tag);
            if (sideMenu?.classList.contains('open')) {
                 toggleMenu();
            }
        }
        
        // الانتقال للقسم عند النقر على رابط القائمة الجانبية
        if (target.classList.contains('menu-link')) {
             if (target.getAttribute('href').startsWith('#')) {
                 e.preventDefault();
                 const targetId = target.getAttribute('href').substring(1);
                 document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                 toggleMenu();
             }
         }
    });

    // 4. **وظائف إضافية**
    document.getElementById('scroll-top-btn')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // (24) تسجيل Service Worker (لتحسين الأداء لاحقاً)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch(err => console.error('Service Worker Failed:', err));
    }
});
