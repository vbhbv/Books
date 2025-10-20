// ملف: js/script.js

// البيانات الوهمية
const booksData = [
    { id: 1, title: "مقدمة في الفلسفة الحديثة", author: "أحمد شوقي", year: 2024, tags: ["فلسفة", "منطق"], cover: "غلاف 1", pdf_link: "https://t.me/iiollr" }, 
    { id: 2, title: "أسرار الكون والفيزياء", author: "نورة القحطاني", year: 2025, tags: ["علم", "فيزياء"], cover: "غلاف 2", pdf_link: "https://t.me/iiollr" },
    { id: 3, title: "فن الإقناع والجدل", author: "خالد الزهراني", year: 2023, tags: ["منطق", "بلاغة"], cover: "غلاف 3", pdf_link: "https://t.me/iiollr" },
    { id: 4, title: "مكتبة النور للبرمجة", author: "محمد علي", year: 2025, tags: ["برمجة", "JavaScript"], cover: "غلاف 4", pdf_link: "https://t.me/iiollr" },
    { id: 5, title: "أساسيات الذكاء الاصطناعي", author: "سارة محمود", year: 2024, tags: ["برمجة", "AI", "علم"], cover: "غلاف 5", pdf_link: "https://t.me/iiollr" },
    { id: 6, title: "تاريخ الحضارات القديمة", author: "علي عبدالله", year: 2020, tags: ["تاريخ", "ثقافة", "فلسفة"], cover: "غلاف 6", pdf_link: "https://t.me/iiollr" },
    { id: 7, title: "كيمياء الحياة", author: "فاطمة الزهراء", year: 2024, tags: ["علم", "كيمياء", "أحياء"], cover: "غلاف 7", pdf_link: "https://t.me/iiollr" },
    { id: 8, title: "الرواية العربية المعاصرة", author: "يوسف إدريس", year: 2021, tags: ["أدب", "روايات"], cover: "غلاف 8", pdf_link: "https://t.me/iiollr" },
    { id: 9, title: "تحليل البيانات الضخمة", author: "أحمد خالد", year: 2025, tags: ["برمجة", "بيانات", "AI"], cover: "غلاف 9", pdf_link: "https://t.me/iiollr" },
];

const DEBOUNCE_DELAY = 300; 
let searchTimeout;

document.addEventListener('DOMContentLoaded', () => {
    // 🛑 التحقق من وجود جميع العناصر الحيوية
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
    const bodyElement = document.body;
    
    // 1. **الوضع الليلي (Dark Mode)**
    const currentMode = localStorage.getItem('theme') || 'light-mode';
    bodyElement.className = currentMode;

    const updateDarkMode = (isDark) => {
        bodyElement.classList.toggle('dark-mode', isDark);
        bodyElement.classList.toggle('light-mode', !isDark);
        localStorage.setItem('theme', isDark ? 'dark-mode' : 'light-mode');
        if (darkModeToggle) {
             darkModeToggle.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
             darkModeToggle.setAttribute('aria-pressed', isDark);
        }
    };
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isDarkMode = bodyElement.classList.contains('light-mode');
            updateDarkMode(isDarkMode);
        });
        updateDarkMode(currentMode === 'dark-mode');
    }


    // 2. **القائمة الجانبية (Hamburger Menu)**
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
        if (e.key === 'Escape' && sideMenu && sideMenu.classList.contains('open')) {
            toggleMenu();
        }
    });
    

    // 3. **شريط إشعار تيليجرام**
    if (telegramBanner) {
        telegramBanner.style.transition = 'opacity 0.3s ease-out';
        if (localStorage.getItem('bannerHidden') !== 'true') {
            telegramBanner.style.opacity = '1';
        } else {
            telegramBanner.style.display = 'none';
        }
    }
    
    if (closeBannerBtn) {
         closeBannerBtn.addEventListener('click', () => {
             if (telegramBanner) telegramBanner.style.opacity = '0';
             setTimeout(() => {
                 if (telegramBanner) telegramBanner.style.display = 'none';
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


    function performSearch(query) {
        if (!booksGrid || !resultsStatus || !document.getElementById('latest-books')) return;
        
        query = query.trim().toLowerCase();
        
        const filteredBooks = booksData.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.tags.some(tag => tag.toLowerCase().includes(query))
        );
        
        document.getElementById('latest-books').style.display = query ? 'none' : 'aside';
        
        displayBooks(booksGrid, filteredBooks, query);
    }
    
    // ربط البحث
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
            alert(`كتاب اليوم المختار من مخزن الكتب: ${randomBook.title} للمؤلف ${randomBook.author}. تم فتح رابط التحميل مباشرة!`);
        });
    }

    // تفعيل البحث الفوري بالنقر على الـ Tag
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag') && searchInput) {
            const tag = e.target.getAttribute('data-tag');
            searchInput.value = tag;
            performSearch(tag);
            if (sideMenu && sideMenu.classList.contains('open')) {
                 toggleMenu();
            }
        }
    });

    // دالة عرض آخر الكتب في القسم المخصص
    function displayLatestBooks() {
        if (!latestBooksGrid) return;
        const sortedBooks = [...booksData].sort((a, b) => b.year - a.year);
        const latestFour = sortedBooks.slice(0, 4); 
        displayBooks(latestBooksGrid, latestFour);
    }

    // دالة إنشاء بطاقة الكتاب وعرضها
    function displayBooks(gridElement, books, query = '') {
        gridElement.innerHTML = '';
        
        if (gridElement === booksGrid && resultsStatus) {
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
            
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('download-btn') || e.target.classList.contains('tag')) return; 
                alert(`معلومات عن الكتاب: ${book.title}\nسنة النشر: ${book.year}\nالتصنيفات: ${book.tags.join(', ')}`);
            });
            
            fragment.appendChild(card);
        });
        
        gridElement.appendChild(fragment);
    }
});
