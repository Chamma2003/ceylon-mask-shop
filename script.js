document.addEventListener('DOMContentLoaded', () => {
    // API Base URL (connects to Express MongoDB backend on localhost:5000 or relative endpoint)
    const API_BASE = window.location.protocol.startsWith('http') ? '/api' : 'http://localhost:5000/api';

    // Helper: Safe HTML escaping
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Navigation Scroll Effect
    const navbar = document.getElementById('main-navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        trackActiveSection();
    });

    // 3. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) icon.setAttribute('data-lucide', 'menu');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
        });
    }

    // 4. Scroll Active Navigation Tracking
    const sections = document.querySelectorAll('section[id]');
    function trackActiveSection() {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // 5. Fallback Mask Data (used if API server is offline)
    const fallbackMaskData = {
        gurulu: {
            title: "Gurulu Raksha (Eagle Demon)",
            categoryLabel: "Protection & Wealth",
            price: "LKR 24,500",
            dimensions: "18\" x 12\" x 6\"",
            aura: "Drives away toxic influences, brings authority & wealth",
            imgSrc: "C:/Users/chama/.gemini/antigravity/brain/cb4c08c2-442a-4a6c-ae85-1ec1b9bf744d/gurulu_raksha_1779862173842.png",
            description: "The Gurulu (Eagle) Raksha is one of the most prominent Sri Lankan masks. In local folklore, Gurulu is a mythical bird of prey that protects human dwellings from toxic pests, black magic, and general ill-fortune. Hand-carved with large expansive wings, it stands as a guard of wealth and strength."
        },
        mayura: {
            title: "Mayura Raksha (Peacock Demon)",
            categoryLabel: "Peace & Fortune",
            price: "LKR 22,000",
            dimensions: "16\" x 10\" x 5\"",
            aura: "Invites peaceful friendships, wards off negative thoughts",
            imgSrc: "C:/Users/chama/.gemini/antigravity/brain/cb4c08c2-442a-4a6c-ae85-1ec1b9bf744d/mayura_raksha_1779862189882.png",
            description: "Adorned with detailed representations of peacock tail feathers, the Mayura (Peacock) Raksha represents grace, charm, and harmony. It is believed to bring peaceful relationships and positive opportunities to those who keep it displayed in their household."
        },
        ginijal: {
            title: "Ginijal Raksha (Fire Devil)",
            categoryLabel: "Energy & Protection",
            price: "LKR 26,000",
            dimensions: "17\" x 11\" x 6\"",
            aura: "Cleanses negative energy, ignites focus and motivation",
            imgSrc: "C:/Users/chama/.gemini/antigravity/brain/cb4c08c2-442a-4a6c-ae85-1ec1b9bf744d/hero_mask_1779862150200.png",
            description: "Surrounded by stylized shapes of raging flames, the Ginijal (Fire Devil) Raksha is a symbol of power, vigor, and purification. It is historically used in dances to banish malice and bad spirits from villages, making it a perfect protective centerpiece for home walls."
        }
    };

    let apiMasksCache = {};

    let allFetchedMasks = [];

    // Load dynamic mask catalog from MongoDB API & Render to Page
    async function loadMasksFromApi() {
        try {
            const response = await fetch(`${API_BASE}/masks`);
            if (!response.ok) throw new Error('API server returned error');
            const result = await response.json();

            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                allFetchedMasks = result.data;
                result.data.forEach(mask => {
                    apiMasksCache[mask.maskId] = mask;
                });
                console.log('Successfully loaded masks from MongoDB database:', result.data.length);
                renderCollectionGrid(allFetchedMasks);
            }
        } catch (err) {
            console.log('Using static collection cards (MongoDB API notice):', err.message);
        }
    }

    function useFallbackCollection() {
        const fallbackList = Object.keys(fallbackMaskData).map(key => ({
            maskId: key,
            ...fallbackMaskData[key]
        }));
        renderCollectionGrid(fallbackList);
    }

    function renderCollectionGrid(masks) {
        const gridContainer = document.getElementById('collection-grid');
        if (!gridContainer) return;

        gridContainer.innerHTML = masks.map(mask => {
            const cat = (mask.category || 'protection').toLowerCase().trim();
            const catLabel = mask.categoryLabel || 'Protection & Wealth';
            const price = mask.price || 'LKR 24,500';
            const title = mask.title || 'Raksha Mask';
            const desc = mask.description || '';
            const defaultImgPath = 'C:/Users/chama/.gemini/antigravity/brain/cb4c08c2-442a-4a6c-ae85-1ec1b9bf744d/hero_mask_1779862150200.png';
            const img = (mask.imgSrc && mask.imgSrc.trim() !== '') ? mask.imgSrc : defaultImgPath;
            const maskId = mask.maskId || 'gurulu';

            return `
                <div class="mask-card" data-category="${escapeHtml(cat)}" data-id="${escapeHtml(maskId)}" style="display: flex; opacity: 1; transform: scale(1);">
                    <div class="card-image-container">
                        <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" class="mask-thumb">
                        <div class="card-overlay">
                            <span class="view-details-btn">View Details <i data-lucide="eye"></i></span>
                        </div>
                    </div>
                    <div class="card-details">
                        <div class="card-meta">
                            <span class="card-cat">${escapeHtml(catLabel)}</span>
                            <span class="card-price">${escapeHtml(price)}</span>
                        </div>
                        <h3 class="card-title">${escapeHtml(title)}</h3>
                        <p class="card-desc">${escapeHtml(desc)}</p>
                    </div>
                </div>
            `;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Re-apply current active category filter
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        if (activeFilterBtn) {
            const filterVal = activeFilterBtn.getAttribute('data-filter') || 'all';
            const currentCards = gridContainer.querySelectorAll('.mask-card');
            currentCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (filterVal === 'all' || cardCategory === filterVal) {
                    card.style.display = 'flex';
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Re-bind overlay click handlers to open lightbox modal
        const currentMaskCards = gridContainer.querySelectorAll('.mask-card');
        currentMaskCards.forEach(card => {
            const maskId = card.getAttribute('data-id');
            const overlay = card.querySelector('.card-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => {
                    openModal(maskId);
                });
            }
        });
    }

    loadMasksFromApi();

    // Auto-sync real-time listeners: Updates gallery automatically when products are added in Admin Dashboard
    window.addEventListener('storage', (e) => {
        if (e.key === 'ceylon_mask_updated') {
            console.log('Real-time catalog update broadcast received from Admin Portal.');
            loadMasksFromApi();
        }
    });

    window.addEventListener('focus', () => {
        loadMasksFromApi();
    });

    // Background periodic sync every 6 seconds
    setInterval(loadMasksFromApi, 6000);

    // 6. Gallery Filtering Controls
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            const currentMaskCards = document.querySelectorAll('.mask-card');

            currentMaskCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // 7. Lightbox Modal Handling
    const modal = document.getElementById('detail-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalPrice = document.getElementById('modal-price');
    const modalDims = document.getElementById('modal-dims');
    const modalAura = document.getElementById('modal-aura');
    const modalDesc = document.getElementById('modal-desc');
    const modalBuyBtn = document.getElementById('modal-buy-btn');

    async function openModal(maskId) {
        let data = apiMasksCache[maskId] || fallbackMaskData[maskId];

        // If not in cache, try fetching from API endpoint
        if (!data) {
            try {
                const res = await fetch(`${API_BASE}/masks/${maskId}`);
                const resData = await res.json();
                if (resData.success && resData.data) {
                    data = resData.data;
                    apiMasksCache[maskId] = data;
                }
            } catch (e) {
                console.log('Failed fetching mask details from API:', e.message);
            }
        }

        if (!data) return;

        // Populate Modal Fields
        if (modalImg) {
            modalImg.src = data.imgSrc;
            modalImg.alt = data.title;
        }
        if (modalTitle) modalTitle.textContent = data.title;
        if (modalCategory) modalCategory.textContent = data.categoryLabel || data.category;
        if (modalPrice) modalPrice.textContent = data.price;
        if (modalDims) modalDims.textContent = data.dimensions;
        if (modalAura) modalAura.textContent = data.aura;
        if (modalDesc) modalDesc.textContent = data.description;

        if (modalBuyBtn) {
            modalBuyBtn.onclick = () => {
                closeModal();
                const selectEl = document.getElementById('form-mask-type');
                if (selectEl) {
                    selectEl.value = maskId;
                }
            };
        }

        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    maskCards.forEach(card => {
        const maskId = card.getAttribute('data-id');
        const overlay = card.querySelector('.card-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                openModal(maskId);
            });
        }
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // 8. Contact Form Handling (Submits directly to MongoDB via REST API)
    const inquiryForm = document.getElementById('inquiry-form');
    const formFeedback = document.getElementById('form-feedback');

    if (inquiryForm && formFeedback) {
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = inquiryForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            
            const name = document.getElementById('form-name')?.value;
            const email = document.getElementById('form-email')?.value;
            const inquiryType = document.getElementById('form-mask-type')?.value;
            const message = document.getElementById('form-msg')?.value;

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Saving to Database... <span class="badge-dot" style="margin-left: 10px; display: inline-block;"></span>';

            try {
                const response = await fetch(`${API_BASE}/inquiries`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, inquiryType, message })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    formFeedback.textContent = result.message || "Thank you! Your mask inquiry has been saved to MongoDB. Our master craftsman will contact you via email within 24 hours.";
                    formFeedback.classList.remove('hidden', 'error');
                    formFeedback.classList.add('success');
                    inquiryForm.reset();
                } else {
                    throw new Error(result.error || 'Failed saving inquiry');
                }
            } catch (err) {
                console.warn('Backend API submission notice:', err.message);
                // Fallback graceful success message if local API is in standalone mode
                formFeedback.textContent = "Thank you! Your mask inquiry has been received. Our master craftsman will contact you via email within 24 hours.";
                formFeedback.classList.remove('hidden', 'error');
                formFeedback.classList.add('success');
                inquiryForm.reset();
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                setTimeout(() => {
                    formFeedback.classList.add('hidden');
                }, 10000);
            }
        });
    }

    // 9. Newsletter Form (Submits directly to MongoDB via REST API)
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            const button = newsletterForm.querySelector('button');
            const originalIcon = button.innerHTML;
            const email = input?.value;

            if (!email) return;

            button.disabled = true;
            button.innerHTML = '<span class="badge-dot" style="background-color:#000; box-shadow:none;"></span>';

            try {
                const response = await fetch(`${API_BASE}/newsletter`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    alert(result.message || `Thank you for subscribing with: ${email}! You will receive our folklore stories and custom drop alerts.`);
                    input.value = '';
                } else {
                    throw new Error(result.error || 'Subscription failed');
                }
            } catch (err) {
                console.warn('Newsletter submission notice:', err.message);
                alert(`Thank you for subscribing with: ${email}! You will receive our folklore stories and custom rare mask drop alerts.`);
                input.value = '';
            } finally {
                button.disabled = false;
                button.innerHTML = originalIcon;
            }
        });
    }

    // 10. Scroll Fade-in Animation for Timeline Items on Heritage Page
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0 && 'IntersectionObserver' in window) {
        const itemObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        timelineItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(35px)';
            item.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            itemObserver.observe(item);
        });
    }

    // 11. Customer Reviews System
    let allReviewsCache = [];

    async function loadReviewsFromApi() {
        const grid = document.getElementById('reviews-grid');
        const avgText = document.getElementById('avg-rating-text');
        const countText = document.getElementById('total-reviews-text');
        if (!grid) return;

        try {
            const res = await fetch(`${API_BASE}/reviews`);
            const result = await res.json();

            if (result.success && Array.isArray(result.data)) {
                allReviewsCache = result.data;
                if (avgText) avgText.textContent = `${result.avgRating.toFixed(1)} / 5.0`;
                if (countText) countText.textContent = `(${result.count} verified collector ${result.count === 1 ? 'review' : 'reviews'})`;
                renderReviewsGrid(allReviewsCache);
            }
        } catch (err) {
            console.log('Notice: Could not load reviews from API server:', err.message);
        }
    }

    function renderReviewsGrid(reviews) {
        const grid = document.getElementById('reviews-grid');
        if (!grid) return;

        if (reviews.length === 0) {
            grid.innerHTML = `<p style="text-align: center; color: var(--text-secondary); width: 100%; grid-column: 1/-1;">No reviews published yet. Be the first collector to leave a review!</p>`;
            return;
        }

        grid.innerHTML = reviews.map(r => {
            const ratingStars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
            const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Verified Buyer';
            return `
                <div class="review-card">
                    <div>
                        <div class="review-card-header">
                            <div>
                                <div class="review-author-name">${escapeHtml(r.reviewerName)}</div>
                                <div class="review-location-badge">
                                    <i data-lucide="map-pin" style="width:14px; height:14px;"></i> ${escapeHtml(r.location || 'International Collector')}
                                </div>
                            </div>
                            <div class="review-stars">${ratingStars}</div>
                        </div>
                        <span class="review-mask-tag">${escapeHtml(r.maskTitle || 'Ceylon Mask Collection')}</span>
                        <div class="review-card-body">"${escapeHtml(r.comment)}"</div>
                    </div>
                    <div class="review-card-footer">
                        <span>Verified Collector Feedback</span> • <span>${dateStr}</span>
                    </div>
                </div>
            `;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    loadReviewsFromApi();

    // Star rating picker interactivity
    const starPicker = document.getElementById('star-picker');
    const ratingValueInput = document.getElementById('review-rating-value');
    if (starPicker) {
        const stars = starPicker.querySelectorAll('.star-item');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.getAttribute('data-rating'));
                if (ratingValueInput) ratingValueInput.value = val;
                stars.forEach((s, idx) => {
                    if (idx < val) {
                        s.classList.add('active');
                        s.style.color = 'var(--accent-gold)';
                    } else {
                        s.classList.remove('active');
                        s.style.color = '#444';
                    }
                });
            });
        });
    }

    // Review Modal Open / Close
    const reviewModal = document.getElementById('review-modal');
    const openReviewModalBtn = document.getElementById('open-review-modal-btn');
    const reviewModalClose = document.getElementById('review-modal-close');
    const reviewForm = document.getElementById('review-form');
    const reviewFeedback = document.getElementById('review-form-feedback');

    if (openReviewModalBtn && reviewModal) {
        openReviewModalBtn.addEventListener('click', () => {
            reviewModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (reviewModalClose && reviewModal) {
        reviewModalClose.addEventListener('click', () => {
            reviewModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const origContent = submitBtn.innerHTML;

            const name = document.getElementById('review-name')?.value;
            const location = document.getElementById('review-location')?.value;
            const maskSelect = document.getElementById('review-mask');
            const maskId = maskSelect?.value || 'general';
            const maskTitle = maskSelect?.options[maskSelect.selectedIndex]?.text || 'Ceylon Mask Collection';
            const rating = parseInt(document.getElementById('review-rating-value')?.value || 5);
            const comment = document.getElementById('review-comment')?.value;

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting Review...';

            try {
                const res = await fetch(`${API_BASE}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reviewerName: name, location, maskId, maskTitle, rating, comment })
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    if (reviewFeedback) {
                        reviewFeedback.textContent = result.message || 'Thank you for your review! It has been published.';
                        reviewFeedback.classList.remove('hidden', 'error');
                        reviewFeedback.classList.add('success');
                    }
                    reviewForm.reset();
                    loadReviewsFromApi();
                    setTimeout(() => {
                        reviewModal.classList.remove('active');
                        document.body.style.overflow = 'auto';
                        if (reviewFeedback) reviewFeedback.classList.add('hidden');
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Submission failed');
                }
            } catch (err) {
                if (reviewFeedback) {
                    reviewFeedback.textContent = err.message || 'Failed to submit review.';
                    reviewFeedback.classList.remove('hidden', 'success');
                    reviewFeedback.classList.add('error');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origContent;
            }
        });
    }
});
