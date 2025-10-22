// ==========================================================
// script.js: وظائف الصفحة الرئيسية (index.html) - تم التحديث
// ==========================================================
let booksData = []; 
const DEBOUNCE_DELAY = 300; 
let searchTimeout;

// 1. عرض بطاقات الكتب (لم يتغير)
function displayBooks(gridElement, books, query = '') {
    const template = document.getElementById('post-template');
    gridElement.innerHTML = '';
    
    books.forEach(book => {
        const cardClone = document.importNode(template.content, true);
        const card = cardClone.querySelector('.book-card');
        
        card.querySelector('.book-cover').src = book.cover;
        card.querySelector('.book-title').textContent = book.title;
        card.querySelector('.book-author span').textContent = book.author;
        
        const detailsLink = card.querySelector('.details-link');
        detailsLink.href = `book.html?id=${book.id}`;

        const tagsDiv = card.querySelector('.book-tags');
        tagsDiv.innerHTML = book.tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('');
        
        gridElement.appendChild(card);
    });
}

// 2. البحث الرئيسي (تم تعديل إخفاء/إظهار الأقسام)
function performSearch(query) {
    const booksGrid = document.getElementById('books-grid'); 
    const latestSection = document.getElementById('latest-books');
    const categoriesSection = document.getElementById('categories-section-main'); // 🏆 تم تحديث الـ ID
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
        if (categoriesSection) categoriesSection.style.display = 'none'; // 🏆 إخفاء قسم الأقسام
        booksGrid.parentElement.style.display = 'block'; 
        resultsStatus.textContent = `نتائج البحث عن: "${query}" (${filteredBooks.length} كتاب)`;
    } else {
        latestSection.style.display = 'block';
        document.getElementById('stats-section').style.display = 'block';
        if (categoriesSection) categoriesSection.style.display = 'block'; // 🏆 إظهار قسم الأقسام
        booksGrid.parentElement.style.display = 'none';
    }

    displayBooks(booksGrid, filteredBooks, query); 
}

// 3. تحديث الإحصائيات (تم إضافة إجمالي التحميلات)
function updateLibraryStats() {
    const totalBooks = booksData.length;
    const totalAuthors = new Set(booksData.map(book => book.author)).size;
    const totalDownloads = booksData.reduce((sum, book) => sum + (book.downloads || 0), 0); // 🏆 إضافة إجمالي التحميلات

    document.getElementById('total-books-count').textContent = totalBooks;
    document.getElementById('total-authors-count').textContent = totalAuthors;
    document.getElementById('total-downloads-count').textContent = totalDownloads.toLocaleString('en-US'); // 🏆 ID جديد
}

// 4. تحميل البيانات (لم يتغير)
async function loadBooksData() {
    try {
        const response = await fetch('data/books.json'); 
        if (!response.ok) { throw new Error('Network response was not ok'); } 
        booksData = await response.json();
        
        updateLibraryStats(); 
        displayBooks(document.getElementById('latest-books-grid'), booksData.slice(0, 4));
        
        const lastQuery = localStorage.getItem('lastSearchQuery') || '';
        document.getElementById('main-search-input').value = lastQuery;
        if (lastQuery) performSearch(lastQuery);
    } catch (error) {
        console.error("فشل تحميل بيانات المكتبة:", error);
        document.getElementById('latest-books-grid').innerHTML = '<p style="color: red;">تعذر تحميل بيانات المكتبة. يرجى التأكد من ملف books.json.</p>';
    }
}


// 5. DOMContentLoaded والروابط (تم تعديل منطق النقر على الأقسام)
document.addEventListener('DOMContentLoaded', () => {
    loadBooksData(); 

    const searchInput = document.getElementById('main-search-input'); 
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => { 
            performSearch(e.target.value); 
            localStorage.setItem('lastSearchQuery', e.target.value);
        }, DEBOUNCE_DELAY);
    });

    // منطق القائمة الجانبية (لم يتغير)
    document.getElementById('menu-toggle').addEventListener('click', () => { document.getElementById('side-menu').classList.add('open'); document.getElementById('overlay').classList.add('active'); });
    document.getElementById('close-menu-btn').addEventListener('click', () => { document.getElementById('side-menu').classList.remove('open'); document.getElementById('overlay').classList.remove('active'); });
    document.getElementById('overlay').addEventListener('click', () => { document.getElementById('side-menu').classList.remove('open'); document.getElementById('overlay').classList.remove('active'); });
    
    // رابط "جميع الكتب"
    document.getElementById('all-books-link').addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.value = '';
        localStorage.setItem('lastSearchQuery', '');
        performSearch('');
        
        document.getElementById('books-grid-section').scrollIntoView({ behavior: 'smooth' });
    });

    // 🏆 النقر على التاجات و الأقسام الرئيسية
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.tag') || e.target.closest('.category-tag');
        
        if (target) { 
            const tag = target.getAttribute('data-tag');
            if (tag) {
                searchInput.value = tag;
                performSearch(tag);
                document.getElementById('books-grid-section').scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // تحديث التاريخ في الفوتر السفلي
    document.getElementById('footer-date-bottom').textContent = new Date().getFullYear(); 

    // الوضع الليلي (Dark Mode) - تم وضعه هنا ليعمل
    const themeToggle = document.getElementById('theme-toggle'); 
    const currentMode = localStorage.getItem('theme') || 'light-mode';
    const updateDarkMode = (isDark) => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark-mode' : 'light-mode');
        if (themeToggle) {
             const icon = themeToggle.querySelector('i');
             if(icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    };
    updateDarkMode(currentMode === 'dark-mode');
    themeToggle.addEventListener('click', () => {
        updateDarkMode(document.documentElement.getAttribute('data-theme') === 'light');
    });
});
