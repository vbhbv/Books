/*
 * ------------------------------------------------------------------
 * ملف script.js المُعدّل والنهائي (يشمل جميع تصحيحات المستخدم)
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

function displayBooks(gridElement, books, query = '') {
    const resultsStatus = document.getElementById('results-status');
    const template = document.getElementById('post-template');
    
    if (!template || !gridElement) return;
    gridElement.innerHTML = '';
    
    if (resultsStatus) {
        resultsStatus.textContent = query 
           ? `نتائج البحث عن: "${query}" في الأرشيف (${books.length} كتاب)` 
           : "";

        if (books.length === 0 && query) {
            const message = 'لم يتم العثور على نتائج مطابقة.';
            gridElement.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-color); margin-top: 20px;">${message}</p>`;
            return;
        }
        if (query) { animateCountUp(resultsStatus, books.length); }
    }
    
    const fragment = document.createDocumentFragment();

    books.forEach(book => {
        const cardClone = document.importNode(template.content, true);
        const card = cardClone.querySelector('.book-card');
        
        const snippetElement = card.querySelector('.book-snippet');
        if (snippetElement) { snippetElement.textContent = book.snippet || 'اضغط للعرض التفاصيل...'; }
        
        const bookCoverDiv = card.querySelector('.book-cover');
        if (bookCoverDiv) {
            const img = document.createElement('img');
            img.src = book.cover; 
            img.alt = `غلاف كتاب: ${book.title}`; 
            img.loading = 'lazy'; 
            
            img.onerror = () => { img.src = 'img/default_cover.jpg'; img.alt = 'غلاف افتراضي'; };
            bookCoverDiv.innerHTML = ''; 
            bookCoverDiv.appendChild(img);
        }
        
        if (card.querySelector('h3')) card.querySelector('h3').textContent = book.title;
        const authorSpan = card.querySelector('.card-info p span');
        if(authorSpan) authorSpan.textContent = book.author;
        
        // 🏆 منطق روابط التحميل (تمت إضافة تليجرام هنا)
        const downloadLinksDiv = card.querySelector('.download-links');
        if (downloadLinksDiv) {
            downloadLinksDiv.innerHTML = ''; 

            // رابط التحميل المباشر
            if (book.pdf_link) {
                const directLink = document.createElement('a');
                directLink.href = book.pdf_link; 
                directLink.className = 'download-btn';
                directLink.setAttribute('download', `${book.title} - ${book.author}.pdf`);
                directLink.innerHTML = '<i class="fas fa-download"></i> تحميل مباشر';
                directLink.addEventListener('click', (e) => { 
                    e.stopPropagation();
                    trackDownload(book.title);
                });
                downloadLinksDiv.appendChild(directLink);
            }

            // رابط تليجرام (يجب أن يكون موجوداً في books.json)
            if (book.telegram_link) {
                const telegramLink = document.createElement('a');
                telegramLink.href = book.telegram_link;
                telegramLink.className = 'download-btn telegram-btn'; // يمكنك إضافة تنسيق خاص لـ telegram-btn في CSS
                telegramLink.setAttribute('target', '_blank');
                telegramLink.innerHTML = '<i class="fab fa-telegram-plane"></i> عبر تليجرام';
                telegramLink.addEventListener('click', (e) => { e.stopPropagation(); }); 
                downloadLinksDiv.appendChild(telegramLink);
            }
        }
        
        
        const tagsDiv = card.querySelector('.book-tags');
        if (tagsDiv) tagsDiv.innerHTML = book.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('');

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag') || e.target.classList.contains('download-btn')) return; 
            alert(`معلومات عن الكتاب: ${book.title}\nالمؤلف: ${book.author}\nسنة النشر: ${book.year}\nالتصنيفات: ${book.tags.join(', ')}`);
        });
        
        setTimeout(() => { card.classList.add('fade-in'); }, 50);

        fragment.appendChild(card);
    });
    
    gridElement.appendChild(fragment);
}


function displayLatestBooks() {
    if (booksData.length === 0) return;
    const latestBooksGrid = document.getElementById('latest-books-grid');
    if (!latestBooksGrid) return;
    const sortedBooks = [...booksData].sort((a, b) => (b.id || b.year) - (a.id || a.year)); 
    const latestFour = sortedBooks.slice(0, 4); 
    displayBooks(latestBooksGrid, latestFour);
}

// 🏆 دالة البحث الرئيسية (تدعم البحث عن طريق الفئة)
function performSearch(query) {
    if (booksData.length === 0) return;
    
    const booksGrid = document.getElementById('books-grid'); 
    const latestSection = document.getElementById('latest-books');
    const authorsSection = document.getElementById('author-section'); 
    const categoriesSection = document.getElementById('categories-section'); 

    if (!booksGrid) return;
    
    query = query.trim().toLowerCase();
    
    let searchPool = booksData;
    
    const filteredBooks = searchPool.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        // هذا السطر يسمح بالبحث عن الفئة (العلامة)
        book.tags.some(tag => tag.toLowerCase().includes(query)) 
    );
    
    // منطق العرض والإخفاء للأقسام
    if (latestSection && authorsSection && categoriesSection) {
        const displayMode = query ? 'none' : 'block';

        latestSection.style.display = displayMode;
        authorsSection.style.display = displayMode;
        categoriesSection.style.display = displayMode;
        
        if (query) {
            booksGrid.style.display = 'grid'; 
        } else {
            booksGrid.style.display = 'none'; 
            displayLatestBooks(); 
        }
    }

    displayBooks(booksGrid, filteredBooks, query); 
    
    localStorage.setItem('lastSearchQuery', query);
}

// ⚠️ هذه هي الدالة المعدلة بمسارات محددة للنجاح
async function loadBooksData() {
    const errorContainer = document.createElement('p');
    errorContainer.style.color = 'red';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.padding = '10px 0';
    
    const resultsContainer = document.getElementById('latest-books-grid') || document.getElementById('books-grid');
    if (resultsContainer) {
        resultsContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align:center;">يتم تحميل بيانات المكتبة...</p>';
    }
    
    // المسارات التي ثبت أنها تعمل على GitHub Pages
    const possiblePaths = [
        '/Books/data/books.json', 
        './data/books.json', 
        'data/books.json'
    ];
    
    let success = false;
    
    for (const path of possiblePaths) {
        try {
            const response = await fetch(path); 
            if (!response.ok) { continue; } 
            
            booksData = await response.json();
            
            if (!Array.isArray(booksData)) { throw new Error("JSON format error: Expected an array of books."); }
            
            if (resultsContainer) resultsContainer.innerHTML = ''; 
            
            updateLibraryStats(); 
            displayLatestBooks();

            const lastQuery = localStorage.getItem('lastSearchQuery');
            const searchInput = document.getElementById('main-search-input');
            if (lastQuery && lastQuery.trim() !== '' && searchInput) {
                searchInput.value = lastQuery;
                performSearch(lastQuery);
            }
            
            success = true;
            break; 
            
        } catch (error) {
            console.error(`فشل تحميل بيانات الكتب من المسار ${path}:`, error);
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

function handleEnterKeySearch(event) {
    if (event.key === 'Enter') {
        const searchInput = document.getElementById('main-search-input'); 
        if (searchInput) {
            event.preventDefault(); 
            performSearch(searchInput.value);
            searchInput.blur(); 
        }
    }
}

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
    
    loadBooksData(); 

    // 2. العناصر الأساسية 
    const themeToggle = document.getElementById('theme-toggle'); 
    const menuToggle = document.getElementById('menu-toggle');     
    const sideMenu = document.getElementById('side-menu');         
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlay = document.getElementById('overlay');
    const bodyElement = document.body;
    
    const searchInput = document.getElementById('main-search-input'); 
    const searchButton = document.getElementById('main-search-button'); 
    const clearSearchBtn = document.getElementById('clear-search-btn');

    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const voiceSearchBtn = document.getElementById('voice-search-btn'); // ❌ ملغي

    
    // 3. الوضع الليلي (Dark Mode)
    const currentMode = localStorage.getItem('theme') || 'light-mode';
    const updateDarkMode = (isDark) => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark-mode' : 'light-mode');
        if (themeToggle) {
             const icon = themeToggle.querySelector('i');
             if(icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
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
            
            if (clearSearchBtn) clearSearchBtn.style.display = e.target.value.length > 0 ? 'block' : 'none';
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

    // 🚀 زر مسح البحث 
    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            performSearch('');
            clearSearchBtn.style.display = 'none';
            searchInput.focus();
        });
    }
    
    // ❌ إلغاء البحث الصوتي (يبقى الزر معطلًا برسالة)
    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', (e) => {
             e.preventDefault();
             alert("خاصية البحث الصوتي ملغاة بناءً على طلبك.");
        });
    }

    // 6. ربط النقرات على العلامات وروابط القائمة الجانبية (الآن يدعم النقر على الأقسام)
    document.addEventListener('click', (e) => {
        const target = e.target;
        let tag = null;
        
        // النقر على الأقسام الرئيسية (يفترض أن القسم يحمل class="category-link" أو "category-tag")
        if (target.closest('.category-tag') || target.classList.contains('category-tag')) { 
            tag = target.closest('.category-tag')?.getAttribute('data-tag') || target.getAttribute('data-tag');
        }
        
        // النقر على علامات التاج داخل بطاقة الكتاب
        if (target.classList.contains('tag')) { tag = target.getAttribute('data-tag'); }
        
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

    // 7. زر "كتاب عشوائي" 
    document.getElementById('random-book-btn')?.addEventListener('click', () => {
         if (booksData.length === 0) { alert('يتم تحميل بيانات الكتب، يرجى الانتظار.'); return; }
         const randomIndex = Math.floor(Math.random() * booksData.length);
         // يفتح الرابط المباشر
         window.open(booksData[randomIndex].pdf_link, '_blank'); 
         alert(`كتاب اليوم المختار: ${booksData[randomIndex].title}.`);
    });


    // 8. زر الصعود للأعلى (Scroll Top Button) 
    if(scrollTopBtn){
        window.addEventListener('scroll', () => {
            scrollTopBtn.style.display = window.scrollY > 200 ? 'flex' : 'none';
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
