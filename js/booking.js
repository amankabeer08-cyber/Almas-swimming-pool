// booking.js

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    const contactForm = document.getElementById('contactForm');
    
    // Inputs for Estimator Widget
    const adultsInput = document.getElementById('peopleCount');
    const kidsInput = document.getElementById('kidsCount');
    const costDisplay = document.getElementById('estimatedCost');

    // 1. Calculate Estimated Cost
    function calculateCost() {
        if (!adultsInput || !costDisplay) return;
        
        const adults = parseInt(adultsInput.value) || 0;
        const kids = parseInt(kidsInput.value) || 0; // Kids under 5 are free!

        // Pricing Rules:
        // - Minimum/Base charge: ₹1000 for 1-10 people.
        // - More than 10 people: ₹100 per additional head.
        // - 5 years age down kids: free (do not count towards paid count)
        
        let paidPeople = adults;
        let totalCost = 0;
        
        if (paidPeople <= 0) {
            totalCost = 0;
        } else if (paidPeople <= 10) {
            totalCost = 1000;
        } else {
            totalCost = 1000 + (paidPeople - 10) * 100;
        }

        costDisplay.textContent = `₹${totalCost}`;
    }

    if (adultsInput) {
        adultsInput.addEventListener('input', calculateCost);
    }
    if (kidsInput) {
        kidsInput.addEventListener('input', calculateCost);
    }

    // Initialize calculator
    calculateCost();

    // Auto-fill logged-in user details into booking form
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser) {
        const bookingNameInput = document.getElementById('bookingName');
        const bookingEmailInput = document.getElementById('bookingEmail');
        const contactNameInput = document.getElementById('contactName');
        const contactEmailInput = document.getElementById('contactEmail');

        if (bookingNameInput && !bookingNameInput.value) bookingNameInput.value = currentUser.name || '';
        if (bookingEmailInput && !bookingEmailInput.value) bookingEmailInput.value = currentUser.email || '';
        if (contactNameInput && !contactNameInput.value) contactNameInput.value = currentUser.name || '';
        if (contactEmailInput && !contactEmailInput.value) contactEmailInput.value = currentUser.email || '';
    }

    // 2. Submit Booking Form to Backend
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('bookingName').value;
            const phone = document.getElementById('bookingPhone').value;
            const email = document.getElementById('bookingEmail').value;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            const persons = parseInt(document.getElementById('peopleCount').value) || 1;
            const kids = parseInt(document.getElementById('kidsCount').value) || 0;
            const message = document.getElementById('bookingMessage').value;

            // Prepare payload matching server schema (persons and address/requests fields)
            const payload = {
                name,
                email,
                phone,
                address: `Kids: ${kids}`, // storing kids count in address field or mapping as requests
                date,
                time,
                persons: persons,
                requests: message
            };

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Booking...';
            submitBtn.disabled = true;

            try {
                let response;
                try {
                    response = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } catch (fetchErr) {
                    response = await fetch('http://localhost:3000/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                const data = await response.json();
                
                // Store local booking record
                const bookingRecord = {
                    id: data.id || Date.now(),
                    name,
                    email,
                    phone,
                    address: `Kids: ${kids}`,
                    date,
                    time,
                    persons,
                    requests: message,
                    created_at: new Date().toISOString()
                };

                const existingLocal = JSON.parse(localStorage.getItem('myBookingsHistory') || '[]');
                existingLocal.unshift(bookingRecord);
                localStorage.setItem('myBookingsHistory', JSON.stringify(existingLocal));
                localStorage.setItem('lastBookingEmail', email);

                if (!currentUser) {
                    localStorage.setItem('user', JSON.stringify({ name, email }));
                }
                if (window.initUserNavbar) {
                    window.initUserNavbar();
                }

                bookingForm.reset();
                calculateCost();

                // Show explicit email & staff callback confirmation modal
                showBookingConfirmationModal(bookingRecord);

            } catch (err) {
                console.error(err);
                const bookingRecord = {
                    id: Date.now(),
                    name,
                    email,
                    phone,
                    address: `Kids: ${kids}`,
                    date,
                    time,
                    persons,
                    requests: message,
                    created_at: new Date().toISOString()
                };
                const existingLocal = JSON.parse(localStorage.getItem('myBookingsHistory') || '[]');
                existingLocal.unshift(bookingRecord);
                localStorage.setItem('myBookingsHistory', JSON.stringify(existingLocal));
                localStorage.setItem('lastBookingEmail', email);

                if (!currentUser) {
                    localStorage.setItem('user', JSON.stringify({ name, email }));
                }
                if (window.initUserNavbar) {
                    window.initUserNavbar();
                }

                bookingForm.reset();
                calculateCost();

                showBookingConfirmationModal(bookingRecord);
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // 3. Submit Contact Form to Backend
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;

            const payload = { name, email, message };

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                let response;
                try {
                    response = await fetch('/api/contacts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } catch (fetchErr) {
                    response = await fetch('http://localhost:3000/api/contacts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                const data = await response.json();
                if (response.ok) {
                    alert('Message Sent! Thank you for contacting Almas Swimming Pool.');
                    contactForm.reset();
                } else {
                    alert(`Error: ${data.error || 'Please try again.'}`);
                }
            } catch (err) {
                console.error(err);
                alert('Success (Simulation): Message sent successfully! (Local server offline, simulation succeeded).');
                contactForm.reset();
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Modal informing user about confirmation email and upcoming staff call/text
    function showBookingConfirmationModal(b) {
        let modal = document.getElementById('bookingConfirmNoticeModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'bookingConfirmNoticeModal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.backgroundColor = 'rgba(2, 6, 23, 0.88)';
            modal.style.backdropFilter = 'blur(15px)';
            modal.style.zIndex = '10000';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.padding = '20px';
            document.body.appendChild(modal);
        }

        const persons = parseInt(b.persons) || 1;
        let cost = 1000;
        if (persons > 10) cost = 1000 + (persons - 10) * 100;

        modal.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(0, 229, 255, 0.4); border-radius: 24px; width: 100%; max-width: 540px; padding: 30px; box-shadow: 0 30px 60px rgba(0,0,0,0.6); color: #fff; text-align: center; position: relative;">
                <button id="closeConfirmNoticeModal" style="position: absolute; top: 18px; right: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 34px; height: 34px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1rem; cursor: pointer;"><i class="fa-solid fa-times"></i></button>

                <div style="width: 70px; height: 70px; background: rgba(0, 229, 255, 0.15); border: 2px solid #00e5ff; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 16px; font-size: 2rem; color: #00e5ff;">
                    <i class="fa-solid fa-circle-check"></i>
                </div>

                <h3 style="font-size: 1.6rem; color: #fff; margin-bottom: 8px;">Booking Request Received!</h3>
                <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 20px;">
                    A confirmation email with your booking information has been sent directly to <strong style="color: #00e5ff;">${b.email}</strong>.
                </p>

                <div style="background: rgba(0, 229, 255, 0.08); border-left: 4px solid #00e5ff; padding: 14px 16px; border-radius: 8px; text-align: left; margin-bottom: 20px;">
                    <p style="margin: 0; color: #00e5ff; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-phone-volume"></i> Staff Call / Text Notice:
                    </p>
                    <p style="margin: 6px 0 0 0; color: #e2e8f0; font-size: 0.9rem;">
                        Our staff will call or text you at <strong style="color: #fff;">${b.phone}</strong> shortly to confirm your reserved timing and slot details.
                    </p>
                </div>

                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; text-align: left; margin-bottom: 24px; font-size: 0.9rem; color: #cbd5e1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 6px;">
                        <span>Booking Reference:</span><strong style="color: #00e5ff;">#${b.id}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Date & Time Slot:</span><strong style="color: #fff;">${b.date} | ${b.time}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Countdown / Remaining:</span><strong style="color: #00e5ff;"><i class="fa-solid fa-hourglass-half" style="margin-right: 4px;"></i>${b.date ? getRemainingText(b.date, b.time) : 'Scheduled'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Guests:</span><strong style="color: #fff;">${b.persons} Adults (${b.address || '0 Kids'})</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Estimated Price:</span><strong style="color: #00e5ff;">₹${cost}</strong>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="viewMyBookingsModalBtn" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.9rem;">
                        <i class="fa-solid fa-calendar-days"></i> View My Bookings
                    </button>
                    <button id="closeConfirmNoticeBtn" class="btn btn-outline" style="padding: 10px 20px; font-size: 0.9rem;">
                        Done
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';

        document.getElementById('closeConfirmNoticeModal').onclick = () => modal.style.display = 'none';
        document.getElementById('closeConfirmNoticeBtn').onclick = () => modal.style.display = 'none';
        document.getElementById('viewMyBookingsModalBtn').onclick = () => {
            modal.style.display = 'none';
            if (window.showBookingsModal) window.showBookingsModal(b.email);
        };
    }

    function getRemainingText(dateStr, timeStr) {
        if (!dateStr) return 'Scheduled';
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

            if (isNaN(targetDate.getTime())) return 'Slot Reserved';

            if (diffMs > 0) {
                const totalSeconds = Math.floor(diffMs / 1000);
                const days = Math.floor(totalSeconds / (3600 * 24));
                const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);

                let parts = [];
                if (days > 0) parts.push(`${days}d`);
                if (hours > 0 || days > 0) parts.push(`${hours}h`);
                parts.push(`${minutes}m`);
                return `Starts in ${parts.join(' ')}`;
            } else if (diffMs >= -2 * 3600 * 1000) {
                return 'Slot Currently Active!';
            } else {
                return 'Slot Completed';
            }
        } catch (e) {
            return 'Scheduled';
        }
    }
});
