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

    // 5. Form Submission Handling (Demo)
    const bookingForm = document.getElementById('bookingForm');
    const contactForm = document.getElementById('contactForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Basic demo validation/alert
            alert('Thank you for your reservation request! Our team will contact you shortly to confirm your booking.');
            bookingForm.reset();
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Your message has been sent successfully. We will get back to you as soon as possible.');
            contactForm.reset();
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
});
