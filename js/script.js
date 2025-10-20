/*
 * ------------------------------------------------------------------
 * الملف الكامل app.js (40 كود مُحدَّث)
 * التركيز: الأداء الفائق، التفاعلات الذكية، التعامل مع البيانات.
 * ------------------------------------------------------------------
 */

// 39. تجميد الكائنات (لإعدادات الموقع الثابتة)
const CONFIG = Object.freeze({
    API_URL: 'https://api.example.com/v2',
    TIMEOUT: 10000,
    CACHE_NAME: 'v3-app-cache'
});

// 37. استخدام دوال السهم
const isEmailValid = email => email.includes('@') && email.length > 5;

// (49) استخدام WeakMap للتخزين المؤقت للبيانات المعالجة
const processedCache = new WeakMap();
function getCachedData(obj) {
    if (processedCache.has(obj)) {
        return processedCache.get(obj);
    }
    // (36) استخدام flatMap لتجهيز البيانات
    const result = obj.flatMap(item => ({ id: item.id, tagCount: item.tags.length })); 
    processedCache.set(obj, result);
    return result;
}

// 9. async/await with fetch و 32. معالجة معلمات URL
async function fetchLatestPosts() {
    const params = new URLSearchParams({ sort: 'date', limit: 10 });
    const url = `${CONFIG.API_URL}/posts?${params.toString()}`;
    try {
        // (46) استخدام AbortController للمهلة
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId); 
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json(); 
        return data;
    } catch (error) {
        console.error('Could not fetch posts:', error);
        return [];
    }
}


// 21. التأكد من جاهزية DOM
document.addEventListener('DOMContentLoaded', () => {

    // ===============================================
    // I. وظائف الأداء والتحميل
    // ===============================================

    // 22. تأخير تحميل الصور (Lazy Loading) مع 23. Intersection Observer API
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '0px 0px 200px 0px' });
    lazyImages.forEach(img => imageObserver.observe(img));

    // 24. تسجيل Service Worker (يتطلب ملف sw.js)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .catch(err => console.error('Service Worker Failed:', err));
    }

    // 25. تنفيذ مهام ذات أولوية منخفضة
    if (window.requestIdleCallback) {
        requestIdleCallback(() => {
            console.log('تنفيذ مهام ذات أولوية منخفضة (مثل تحليل البيانات)...');
        });
    }

    // (42) استخدام Web Workers (يتطلب ملف worker.js)
    if (window.Worker) {
        const myWorker = new Worker('worker.js');
        myWorker.postMessage({ type: 'CALCULATE_HASH', data: 'article-content' });
    }

    // (43) استخدام ResizeObserver لتتبع تغيير حجم العناصر
    const headerObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.contentRect.width < 600) {
                entry.target.classList.add('small-header');
            } else {
                entry.target.classList.remove('small-header');
            }
        }
    });
    const headerEl = document.querySelector('header');
    if (headerEl) headerObserver.observe(headerEl);


    // ===============================================
    // II. تحسين تجربة القراءة والتنقل
    // ===============================================

    // 26. شريط تقدم القراءة
    const article = document.getElementById('article');
    const progress = document.getElementById('reading-progress-bar');
    if (article && progress) {
        const updateReadingProgress = () => {
            const articleHeight = article.offsetHeight;
            const scrollFromTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const totalScroll = articleHeight - windowHeight;
            if (totalScroll > 0 && scrollFromTop >= article.offsetTop) {
                const scrollInArticle = scrollFromTop - article.offsetTop;
                const percentage = (scrollInArticle / totalScroll) * 100;
                progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
            } else {
                progress.style.width = '0%';
            }
        };
        window.addEventListener('scroll', updateReadingProgress);
    }
    
    // 27. فتح الروابط الخارجية في نافذة جديدة
    article?.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.hostname !== window.location.hostname) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
    
    // 29. حفظ تفضيل الثيم (مع 7. Nullish Coalescing)
    const savedTheme = localStorage.getItem('theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // 30. تنسيق التاريخ حسب اللغة (Intl.DateTimeFormat) وتنسيق الأرقام
    const date = new Date();
    const lang = navigator.language;
    const dateFormat = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric' });
    const numberFormat = new Intl.NumberFormat(lang, { style: 'decimal' });
    
    const footerDateEl = document.getElementById('footer-date');
    if (footerDateEl) footerDateEl.textContent = dateFormat.format(date);
    
    const viewsElement = document.getElementById('article-views');
    if (viewsElement) {
        viewsElement.textContent = numberFormat.format(parseInt(viewsElement.textContent));
    }
    
    // (44) ميزة تمييز الكلمات الرئيسية
    function highlightKeywords(article, keywords) {
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
            // التأكد من عدم استبدال نص HTML نفسه (يجب أن يتم التنفيذ قبل أي تحليل HTML)
            if(article) article.innerHTML = article.innerHTML.replace(regex, `<mark class="highlighted-keyword">$1</mark>`);
        });
    }
    if (article) highlightKeywords(article, ['التقنية', 'الأداء', 'القراءة', 'الويب']);

    // (45) دالة التمرير إلى أعلى الصفحة
    document.getElementById('scroll-top-btn')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // ===============================================
    // III. تفاعل ونماذج متقدمة
    // ===============================================

    // 31. التحقق المباشر من صحة المدخلات
    document.getElementById('email-input')?.addEventListener('input', (e) => {
        e.target.setCustomValidity(isEmailValid(e.target.value) ? "" : "الرجاء إدخال بريد إلكتروني صالح.");
        e.target.reportValidity(); 
    });

    // (47) استخدام وسم <template> لإنشاء عناصر القائمة ديناميكياً
    const template = document.getElementById('post-template');
    const container = document.getElementById('posts-container');
    if (template && container) {
        fetchLatestPosts().then(posts => {
            posts.forEach(post => {
                const clone = template.content.cloneNode(true); // 33. الاستنساخ العميق
                const postTitleEl = clone.querySelector('.post-title');
                if (postTitleEl) postTitleEl.textContent = post.title;
                
                // (35) إطلاق حدث مخصص بعد الإضافة
                const cardEl = clone.querySelector('.card');
                if (cardEl) cardEl.dispatchEvent(new Event('card-added')); 
                
                container.appendChild(clone);
            });
        });
    }

    // (48) دعم السحب والإفلات (Drag and Drop) لتحميل الملفات
    const dropArea = document.getElementById('drop-area');
    dropArea?.addEventListener('dragover', (e) => e.preventDefault());
    dropArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        console.log('Files dropped:', files);
    });
    
    // 8. الاستيراد الديناميكي (Dynamic Import)
    document.getElementById('heavy-module-btn')?.addEventListener('click', () => {
        // يفترض وجود ملف analytics.js منفصل
        import('./analytics.js') 
            .then(module => {
                module.trackEvent('Button Clicked');
            })
            .catch(error => {
                console.error('فشل تحميل الوحدة:', error);
            });
    });


    // ===============================================
    // IV. تقنيات ES6+ وميزات الكود النظيف
    // ===============================================

    // 38. تفكيك الكائنات مع 6. الوصول الآمن
    const user = { profile: { name: "Ahmed", email: "a@b.com" } };
    const { profile } = user;
    const userName = profile?.name ?? "Guest"; 
    
    // 40. استخدام Set للحصول على قيم فريدة
    const allTags = ["CSS", "JS", "CSS", "HTML", "JS"];
    const uniqueTags = new Set(allTags);
    console.log('Unique Tags:', [...uniqueTags]); 

    // (50) إضافة ميزة البحث الصوتي (Speech Recognition API)
    document.getElementById('voice-search-btn')?.addEventListener('click', () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = lang; 
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = transcript;
            };
            recognition.start();
        } else {
            alert('البحث الصوتي غير مدعوم في متصفحك.');
        }
    });
});
