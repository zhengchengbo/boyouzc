// ========================================
// 博友政策官网 - 主脚本
// ========================================

document.addEventListener('DOMContentLoaded', function() {

    // --- 手机菜单切换 ---
    const toggleBtn = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');
    if (toggleBtn && navList) {
        toggleBtn.addEventListener('click', function() {
            navList.classList.toggle('active');
        });
        // 点击菜单项后关闭
        navList.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navList.classList.remove('active');
            });
        });
    }

    // --- 数据滚动动画（首页数字渐变） ---
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        let animated = false;
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    statNumbers.forEach(function(el) {
                        const target = parseInt(el.getAttribute('data-target'));
                        animateNumber(el, target);
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        observer.observe(statNumbers[0]);
    }

    function animateNumber(el, target) {
        const duration = 1500;
        const start = performance.now();
        function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const current = Math.floor(progress * target);
            el.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + '+';
            }
        }
        requestAnimationFrame(update);
    }

    // --- 表单提交提示 ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // 注意：如果用 Web3Forms，它会自动跳转
            // 这里可以做额外验证
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            if (!name || !phone) {
                e.preventDefault();
                alert('请填写姓名和联系电话');
                return;
            }
            // 简单手机号格式校验
            if (!/^1\d{10}$/.test(phone)) {
                e.preventDefault();
                alert('请输入正确的手机号码');
                return;
            }
        });
    }

    // --- 页面滚动导航高亮 ---
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        window.addEventListener('scroll', function() {
            let current = '';
            sections.forEach(function(section) {
                const top = section.offsetTop - 100;
                if (window.scrollY >= top) {
                    current = section.getAttribute('id');
                }
            });
            document.querySelectorAll('.nav-list a').forEach(function(link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }

});
