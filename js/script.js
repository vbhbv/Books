// ==========================================================
// script.js: وظائف الصفحة الرئيسية (index.html)
// ==========================================================
let booksData = []; 
const DEBOUNCE_DELAY = 300; 
let searchTimeout;

// 1. عرض بطاقات الكتب
function displayBooks(gridElement, books, query = '') {
    const template = document.getElementById('post-template');
    gridElement.innerHTML = '';
    
    books.forEach(book => {
        const cardClone = document.importNode(template.content, true);
        const card = cardClone.querySelector('.book-card');
        
        // ربط البيانات
        card.querySelector('.book-cover').src = book.cover;
        card.querySelector('.book-title').textContent = book.title;
        card.querySelector('.book-author span').textContent = book.author;
        
        // ربط رابط التفاصيل بالصفحة المنفصلة
        const detailsLink = card.querySelector('.details-link');
        detailsLink.href = `book.html?id=${book.id}`;

        // ربط التاجات
        const tagsDiv = card.querySelector('.book-tags');
        tagsDiv.innerHTML = book.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('');
        
        gridElement.appendChild(card);
    });
}

// 2. البحث الرئيسي
function performSearch(query) {
    const booksGrid = document.getElementById('books-grid'); 
    const latestSection = document.getElementById('latest-books');
    const resultsStatus = document.getElementById('results-status');

    query = query.trim().toLowerCase();
    
    const filteredBooks = booksData.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.tags.some(tag => tag.toLowerCase().includes(query)) 
    );
    
    // إظهار/إخفاء الأقسام بناءً على نتيجة البحث
    if (query) {
        latestSection.style.display = 'none';
        document.getElementById('stats-section').style.display = 'none';
        booksGrid.parentElement.style.display = 'block'; 
        resultsStatus.textContent = `نتائج البحث عن: "${query}" (${filteredBooks.length} كتاب)`;
    } else {
        latestSection.style.display = 'block';
        document.getElementById('stats-section').style.display = 'block';
        booksGrid.parentElement.style.display = 'none';
        // نتائج البحث عن الجميع
    }

    displayBooks(booksGrid, filteredBooks, query); 
}

// 3. تحديث الإحصائيات
function updateLibraryStats() {
    const totalBooks = booksData.length;
    const totalAuthors = new Set(booksData.map(book => book.author)).size;
    const totalDownloads = booksData.reduce((sum, book) => sum + (book.downloads || 0), 0);

    document.getElementById('total-books-count').textContent = totalBooks;
    document.getElementById('total-authors-count').textContent = totalAuthors;
    document.getElementById('monthly-downloads-count').textContent = totalDownloads.toLocaleString('en-US'); 
}

// 4. تحميل البيانات
async function loadBooksData() {
    try {
        const response = await fetch('data/books.json'); 
        if (!response.ok) { throw new Error('Network response was not ok'); } 
        booksData = await response.json();
        
        updateLibraryStats(); 
        displayBooks(document.getElementById('latest-books-grid'), booksData.slice(0, 4));
        
        // إذا كان هناك بحث سابق، قم بتنفيذه
        const lastQuery = localStorage.getItem('lastSearchQuery') || '';
        document.getElementById('main-search-input').value = lastQuery;
        if (lastQuery) performSearch(lastQuery);
    } catch (error) {
        console.error("فشل تحميل بيانات المكتبة:", error);
        document.getElementById('latest-books-grid').innerHTML = '<p style="color: red;">تعذر تحميل بيانات المكتبة. يرجى التأكد من ملف books.json.</p>';
    }
}


// 5. DOMContentLoaded والروابط
document.addEventListener('DOMContentLoaded', () => {
    loadBooksData(); 

    // منطق البحث
    const searchInput = document.getElementById('main-search-input'); 
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => { 
            performSearch(e.target.value); 
            localStorage.setItem('lastSearchQuery', e.target.value);
        }, DEBOUNCE_DELAY);
    });

    // منطق القائمة الجانبية والوضع الليلي (تم تبسيطه)
    document.getElementById('menu-toggle').addEventListener('click', () => { document.getElementById('side-menu').classList.add('open'); document.getElementById('overlay').classList.add('active'); });
    document.getElementById('close-menu-btn').addEventListener('click', () => { document.getElementById('side-menu').classList.remove('open'); document.getElementById('overlay').classList.remove('active'); });
    document.getElementById('overlay').addEventListener('click', () => { document.getElementById('side-menu').classList.remove('open'); document.getElementById('overlay').classList.remove('active'); });
    
    // رابط "جميع الكتب"
    document.getElementById('all-books-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('main-search-input').value = '';
        localStorage.setItem('lastSearchQuery', '');
        performSearch('');
        
        // إظهار شبكة الكتب وتمرير الصفحة
        document.getElementById('books-grid-section').scrollIntoView({ behavior: 'smooth' });
    });

    // النقر على التاجات
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag')) { 
            searchInput.value = e.target.getAttribute('data-tag');
            performSearch(searchInput.value);
            document.getElementById('books-grid-section').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // الوضع الليلي (Dark Mode) - تم وضعه في كود منفصل بسيط هنا
    const themeToggle = document.getElementById('theme-toggle'); 
    const currentMode = localStorage.getItem('theme') || 'light-mode';
    const updateDarkMode = (isDark) => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark-mode' : 'light-mode');
    };
    updateDarkMode(currentMode === 'dark-mode');
    themeToggle.addEventListener('click', () => {
        updateDarkMode(document.documentElement.getAttribute('data-theme') === 'light');
    });

});
