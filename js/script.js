// script.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Permanent Dark Mode Setup
    document.body.classList.add('dark-mode');

    // 2. Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Mobile Navigation Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (menuIcon) {
                menuIcon.classList.toggle('fa-bars');
                menuIcon.classList.toggle('fa-times');
            }
        });
    }

    // 4. Highlight Active Navigation Item Based on URL
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 5. Scroll Reveal Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // 6. Water Ripple Click Effect for Hero and interactive containers
    const rippleSections = document.querySelectorAll('.hero, .glass-card, .btn');
    rippleSections.forEach(section => {
        section.addEventListener('click', (e) => {
            // Only trigger for the immediate target if it's a button or card, to avoid nesting ripple issues
            if (e.target !== section && (section.classList.contains('btn') || section.classList.contains('glass-card'))) {
                return;
            }
            
            // Create ripple container if not present
            let wrapper = section.querySelector('.ripple-wrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'ripple-wrapper';
                section.appendChild(wrapper);
            }

            const rect = section.getBoundingClientRect();
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            
            // Calculate mouse coordinates relative to the element
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Set random size or standard max size
            const size = Math.max(rect.width, rect.height) * 0.4;
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.marginLeft = `${-size/2}px`;
            ripple.style.marginTop = `${-size/2}px`;

            wrapper.appendChild(ripple);

            // Clean up
            setTimeout(() => {
                ripple.remove();
            }, 2000);
        });
    });

    // 7. Dynamic Background Water Bubbles Generator
    function createBubbles() {
        const container = document.createElement('div');
        container.className = 'global-bubbles';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.zIndex = '-1';
        container.style.pointerEvents = 'none';
        container.style.overflow = 'hidden';
        document.body.appendChild(container);

        const bubbleCount = 15;
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'global-bubble';
            bubble.style.position = 'absolute';
            bubble.style.bottom = '-100px';
            bubble.style.borderRadius = '50%';
            bubble.style.background = 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.01))';
            bubble.style.boxShadow = 'inset 0 0 8px rgba(255, 255, 255, 0.15), 0 0 12px rgba(0, 229, 255, 0.1)';
            
            const size = Math.random() * 60 + 20; // 20px - 80px
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 100}vw`;
            
            const duration = Math.random() * 10 + 10; // 10s - 20s
            const delay = Math.random() * 8; // 0s - 8s
            
            bubble.style.animation = `floatBubble ${duration}s ${delay}s infinite ease-in`;
            container.appendChild(bubble);
        }
    }
    // 8. Logged-in User Session & Header Navigation Update
    function initUserNavbar() {
        const navActions = document.querySelector('.nav-actions');
        let user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!navActions) return;

        // Clean up existing dynamic user elements if re-initializing
        const existingDropdown = navActions.querySelector('.user-navbar-menu');
        if (existingDropdown) existingDropdown.remove();

        if (!user) return;

        // Replace login button with user profile actions
        const loginBtn = navActions.querySelector('a[href="user_login.html"]');
        if (loginBtn) {
            loginBtn.remove();
        }

        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-navbar-menu';
        userDropdown.style.display = 'flex';
        userDropdown.style.alignItems = 'center';
        userDropdown.style.gap = '10px';

        userDropdown.innerHTML = `
            <button id="myBookingsBtn" class="btn btn-outline" style="padding: 6px 14px; font-size: 0.85rem; border-color: var(--accent-color); color: var(--accent-color); position: relative; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-calendar-days"></i> My Bookings
                <span id="bookingCountBadge" style="display: none; background: #00e5ff; color: #020617; font-size: 0.75rem; font-weight: 800; border-radius: 50%; padding: 2px 7px;">0</span>
            </button>
            <span style="font-size: 0.9rem; font-weight: 600; color: #00e5ff; display: flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-user-circle" style="font-size: 1.1rem;"></i> ${user.name || 'Member'}
            </span>
            <button id="userLogoutBtn" class="btn" title="Logout" style="padding: 6px 12px; font-size: 0.8rem; background: rgba(255,65,108,0.2); border: 1px solid rgba(255,65,108,0.4); color: #ff4b2b; cursor: pointer; border-radius: 8px;">
                <i class="fa-solid fa-right-from-bracket"></i>
            </button>
        `;

        navActions.insertBefore(userDropdown, navActions.firstChild);

        // Fetch and display active booking count badge
        if (user.email) {
            const fetchBadgeCount = async () => {
                try {
                    let res;
                    try {
                        res = await fetch(`/api/user/bookings?email=${encodeURIComponent(user.email)}`);
                    } catch(e) {
                        res = await fetch(`http://localhost:3000/api/user/bookings?email=${encodeURIComponent(user.email)}`);
                    }
                    if (res.ok) {
                        const bookings = await res.json();
                        const badge = document.getElementById('bookingCountBadge');
                        if (badge && Array.isArray(bookings) && bookings.length > 0) {
                            badge.textContent = bookings.length;
                            badge.style.display = 'inline-block';
                        }
                    }
                } catch(e) {
                    console.warn('Could not fetch booking badge count');
                }
            };
            fetchBadgeCount();
        }

        // Handle Logout
        document.getElementById('userLogoutBtn').addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.reload();
        });

        // Handle My Bookings Modal
        document.getElementById('myBookingsBtn').addEventListener('click', async () => {
            showBookingsModal(user.email);
        });
    }

    async function showBookingsModal(email) {
        if (!email) {
            const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
            email = currentUser ? currentUser.email : localStorage.getItem('lastBookingEmail');
        }

        let modal = document.getElementById('userBookingsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'userBookingsModal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.backgroundColor = 'rgba(2, 6, 23, 0.88)';
            modal.style.backdropFilter = 'blur(15px)';
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.padding = '20px';

            modal.innerHTML = `
                <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 24px; width: 100%; max-width: 680px; padding: 30px; box-shadow: 0 30px 60px rgba(0,0,0,0.6); color: #fff; max-height: 85vh; overflow-y: auto; position: relative;">
                    <button id="closeBookingsModal" style="position: absolute; top: 22px; right: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.1rem; cursor: pointer; transition: 0.2s;"><i class="fa-solid fa-times"></i></button>
                    <h3 style="margin-bottom: 8px; color: #00e5ff; font-size: 1.6rem; display: flex; align-items: center; gap: 12px;">
                        <i class="fa-solid fa-water-ladder"></i> My Pool Rental Bookings
                    </h3>
                    <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 24px;">View your reserved swimming slots, schedule, and booking confirmation details.</p>
                    <div id="bookingsListContainer">
                        <p style="text-align: center; color: #94a3b8; padding: 30px;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.5rem; margin-bottom: 10px; color: #00e5ff;"></i><br>Loading your bookings...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('closeBookingsModal').onclick = () => {
                modal.style.display = 'none';
            };
            modal.onclick = (e) => {
                if (e.target === modal) modal.style.display = 'none';
            };
        } else {
            modal.style.display = 'flex';
        }

        const container = document.getElementById('bookingsListContainer');
        container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 30px;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.5rem; margin-bottom: 10px; color: #00e5ff;"></i><br>Loading your bookings...</p>';

        try {
            let bookings = [];
            try {
                let res;
                if (email) {
                    res = await fetch(`/api/user/bookings?email=${encodeURIComponent(email)}`);
                } else {
                    res = await fetch(`/api/user/bookings`);
                }
                if (res.ok) {
                    bookings = await res.json();
                }
            } catch(e) {
                console.warn('Backend fetch failed, using local history fallback');
            }

            // Combine with local history for absolute reliability
            const localHistory = JSON.parse(localStorage.getItem('myBookingsHistory') || '[]');
            if (Array.isArray(localHistory) && localHistory.length > 0) {
                const existingIds = new Set(bookings.map(b => String(b.id)));
                localHistory.forEach(lb => {
                    if (!existingIds.has(String(lb.id))) {
                        bookings.unshift(lb);
                    }
                });
            }

            if (!Array.isArray(bookings) || bookings.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 35px 20px; color: #94a3b8; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">
                        <i class="fa-solid fa-calendar-xmark" style="font-size: 3rem; margin-bottom: 16px; color: rgba(0, 229, 255, 0.4);"></i>
                        <h4 style="color: #fff; font-size: 1.2rem; margin-bottom: 8px;">No Active Bookings Found</h4>
                        <p style="font-size: 0.9rem; max-width: 400px; margin: 0 auto 20px;">You haven't placed any swimming pool rental reservations yet ${email ? `under <strong>${email}</strong>` : ''}.</p>
                        <a href="contact.html#booking-section" onclick="document.getElementById('userBookingsModal').style.display='none'" class="btn btn-primary" style="padding: 10px 22px; font-size: 0.95rem;">Book A Swimming Slot Now</a>
                    </div>
                `;
                return;
            }

            let html = '<div style="display: flex; flex-direction: column; gap: 18px;">';
            bookings.forEach(b => {
                const persons = parseInt(b.persons) || 1;
                let cost = 1000;
                if (persons > 10) cost = 1000 + (persons - 10) * 100;

                const formattedDate = b.created_at ? new Date(b.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                const remaining = getRemainingTimeText(b.date, b.time);

                html += `
                    <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); border: 1px solid rgba(0, 229, 255, 0.2); border-radius: 16px; padding: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); transition: 0.3s;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                            <div>
                                <span style="font-weight: 800; color: #00e5ff; font-size: 1.1rem; letter-spacing: 0.5px;">Booking #${b.id}</span>
                                ${formattedDate ? `<span style="font-size: 0.75rem; color: #94a3b8; margin-left: 10px;">Booked on ${formattedDate}</span>` : ''}
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 0.8rem; background: ${remaining.bgGradient || 'rgba(0,229,255,0.15)'}; border: 1px solid ${remaining.borderColor || 'rgba(0,229,255,0.3)'}; color: ${remaining.badgeColor}; padding: 4px 14px; border-radius: 20px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid ${remaining.icon}" style="font-size: 0.8rem;"></i> ${remaining.text}
                                </span>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-size: 0.95rem; color: #e2e8f0; margin-bottom: 14px;">
                            <div style="background: rgba(0,0,0,0.2); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.04);">
                                <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"><i class="fa-regular fa-calendar" style="color: #00e5ff;"></i> Booking Date</div>
                                <strong style="color: #fff; font-size: 1.05rem;">${b.date || 'Scheduled'}</strong>
                            </div>
                            <div style="background: rgba(0,0,0,0.2); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.04);">
                                <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"><i class="fa-regular fa-clock" style="color: #00e5ff;"></i> Time Slot</div>
                                <strong style="color: #fff; font-size: 1.05rem;">${b.time || 'Flexible'}</strong>
                            </div>
                            <div style="background: rgba(0,0,0,0.2); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.04);">
                                <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"><i class="fa-solid fa-users" style="color: #00e5ff;"></i> Head Count</div>
                                <strong style="color: #fff;">${b.persons} Adults (${b.address || '0 Kids'})</strong>
                            </div>
                            <div style="background: rgba(0,0,0,0.2); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.04);">
                                <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"><i class="fa-solid fa-indian-rupee-sign" style="color: #00e5ff;"></i> Est. Total Price</div>
                                <strong style="color: #00e5ff; font-size: 1.1rem;">₹${cost}</strong>
                            </div>
                        </div>

                        <div style="font-size: 0.88rem; color: #94a3b8; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px;">
                            <div><i class="fa-solid fa-user" style="color: #00e5ff;"></i> Reserved by: <span style="color: #fff;">${b.name || 'Member'}</span> (${b.phone || 'N/A'})</div>
                            ${b.requests ? `<div style="width: 100%; margin-top: 4px; font-style: italic; color: #cbd5e1;"><i class="fa-solid fa-comment-dots" style="color: #00e5ff;"></i> Note: "${b.requests}"</div>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

        } catch (err) {
            container.innerHTML = `<p style="color: #ff4b2b; text-align: center; padding: 20px;">Unable to fetch bookings right now. Please ensure the server is running.</p>`;
        }
    }

    // Helper to calculate remaining time for a booked slot
    function getRemainingTimeText(dateStr, timeStr) {
        if (!dateStr) return { text: 'Scheduled', badgeColor: '#00e5ff', icon: 'fa-clock' };

        try {
            let startTime = '09:00';
            if (timeStr) {
                const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
                if (match) {
                    let hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    const ampm = match[3];
                    if (ampm) {
                        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                    }
                    startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                }
            }

            const targetDate = new Date(`${dateStr}T${startTime}:00`);
            const now = new Date();
            const diffMs = targetDate - now;

            if (isNaN(targetDate.getTime())) {
                return { text: 'Slot Reserved', badgeColor: '#00e5ff', icon: 'fa-calendar-check' };
            }

            if (diffMs > 0) {
                const totalSeconds = Math.floor(diffMs / 1000);
                const days = Math.floor(totalSeconds / (3600 * 24));
                const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);

                let parts = [];
                if (days > 0) parts.push(`${days}d`);
                if (hours > 0 || days > 0) parts.push(`${hours}h`);
                parts.push(`${minutes}m`);

                return {
                    text: `Starts in ${parts.join(' ')}`,
                    badgeColor: '#00e5ff',
                    bgGradient: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(0, 119, 255, 0.25))',
                    borderColor: 'rgba(0, 229, 255, 0.4)',
                    icon: 'fa-hourglass-half'
                };
            } else if (diffMs >= -2 * 3600 * 1000) {
                return {
                    text: 'Slot Currently Active!',
                    badgeColor: '#10b981',
                    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.25))',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    icon: 'fa-water'
                };
            } else {
                return {
                    text: 'Slot Completed',
                    badgeColor: '#94a3b8',
                    bgGradient: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    icon: 'fa-circle-check'
                };
            }
        } catch (e) {
            return { text: 'Scheduled', badgeColor: '#00e5ff', icon: 'fa-clock' };
        }
    }

    // Expose globally so other scripts (like booking.js) can interact seamlessly
    window.showBookingsModal = showBookingsModal;
    window.initUserNavbar = initUserNavbar;

    initUserNavbar();
});
