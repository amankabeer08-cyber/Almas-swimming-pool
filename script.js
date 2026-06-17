document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Toggle icon between bars and times (close)
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // 3. Scroll Reveal Animations using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 4. Dynamic Cost Calculation
    const personsInput = document.getElementById('persons');
    const estimatedCostDiv = document.getElementById('estimatedCost');

    if (personsInput && estimatedCostDiv) {
        personsInput.addEventListener('input', () => {
            const persons = parseInt(personsInput.value) || 1;
            const cost = Math.max(1000, persons * 100);
            estimatedCostDiv.textContent = `Estimated Cost: ₹${cost}`;
        });
    }

    // 5. Form Submission Handling (API Integration)
    const bookingForm = document.getElementById('bookingForm');
    const contactForm = document.getElementById('contactForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const bookingData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                persons: document.getElementById('persons').value,
                requests: document.getElementById('requests').value
            };

            const btn = bookingForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Processing...';
            btn.disabled = true;

            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });
                
                if (response.ok) {
                    alert('Thank you for your reservation! Your booking has been saved to the database.');
                    bookingForm.reset();
                } else {
                    alert('Failed to save booking. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please make sure the server is running.');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;
            
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;

            try {
                // 1. Save to Database
                await fetch('/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                // 2. Open WhatsApp
                const whatsappNumber = '919744033133';
                const whatsappMessage = `*New Contact Inquiry*\n\n*Name:* ${name}\n*Email:* ${email}\n*Message:* ${message}`;
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappUrl, '_blank');
                
                alert('Your message has been saved to the database and you will be redirected to WhatsApp!');
                contactForm.reset();
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please make sure the server is running.');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // 6. Active Nav Link on Scroll (ScrollSpy)
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links li a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href') === `#${current}`) {
                li.classList.add('active');
            }
        });
    });

    // 7. Lightbox Gallery
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    let currentImages = [];
    let currentIndex = 0;

    if(lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imagesAttr = item.getAttribute('data-images');
                if (imagesAttr) {
                    currentImages = imagesAttr.split(',');
                    currentIndex = 0;
                    updateLightboxImage();
                    lightbox.classList.add('active');
                }
            });
        });

        closeBtn.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : currentImages.length - 1;
            updateLightboxImage();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex < currentImages.length - 1) ? currentIndex + 1 : 0;
            updateLightboxImage();
        });

        function updateLightboxImage() {
            if(currentImages.length > 0) {
                lightboxImg.src = currentImages[currentIndex];
                lightboxImg.style.animation = 'none';
                lightboxImg.offsetHeight; /* trigger reflow */
                lightboxImg.style.animation = null; 
            }
        }
    }

    // 8. Authentication UI Handling
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const initial = user.name.charAt(0).toUpperCase();
                
                // Replace login link with profile dropdown
                authContainer.innerHTML = `
                    <button class="profile-btn" id="profileBtn">
                        <div class="profile-avatar">${initial}</div>
                        <i class="fa-solid fa-chevron-down" style="color: var(--dark-blue); font-size: 0.8rem;"></i>
                    </button>
                    <div class="profile-dropdown-menu" id="profileDropdown">
                        <div class="profile-info">
                            <h5>${user.name}</h5>
                            <p>${user.email}</p>
                        </div>
                        <button class="btn-logout" id="logoutBtn"><i class="fa-solid fa-sign-out-alt"></i> Logout</button>
                    </div>
                `;

                // Toggle dropdown
                const profileBtn = document.getElementById('profileBtn');
                const profileDropdown = document.getElementById('profileDropdown');
                
                profileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    profileDropdown.classList.toggle('active');
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!authContainer.contains(e.target)) {
                        profileDropdown.classList.remove('active');
                    }
                });

                // Logout
                document.getElementById('logoutBtn').addEventListener('click', () => {
                    localStorage.removeItem('user');
                    window.location.reload();
                });

            } catch (e) {
                console.error('Error parsing user data', e);
                localStorage.removeItem('user');
            }
        }
    }
});
