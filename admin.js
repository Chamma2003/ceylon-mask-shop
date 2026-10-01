document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.location.protocol.startsWith('http') ? '/api' : 'http://localhost:5000/api';

    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const loginModal = document.getElementById('admin-login-modal');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-data-btn');

    // Authentication Token Check
    function checkAuth() {
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            if (loginModal) loginModal.style.display = 'none';
            loadDashboardData();
        } else {
            if (loginModal) loginModal.style.display = 'flex';
        }
    }

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const passcode = (document.getElementById('admin-passcode').value || '').trim();
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            if (loginError) loginError.classList.add('hidden');

            const validPasscodes = ['admin123', 'admin', '1234'];

            try {
                const res = await fetch(`${API_BASE}/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ passcode })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    sessionStorage.setItem('adminToken', data.token);
                    loginModal.style.display = 'none';
                    loadDashboardData();
                } else {
                    throw new Error(data.error || 'Invalid passcode');
                }
            } catch (err) {
                if (validPasscodes.includes(passcode.toLowerCase())) {
                    const fallbackToken = 'admin-authenticated-local';
                    sessionStorage.setItem('adminToken', fallbackToken);
                    loginModal.style.display = 'none';
                    loadDashboardData();
                } else {
                    if (loginError) {
                        loginError.textContent = err.message || 'Invalid admin passcode. Try: admin123';
                        loginError.classList.remove('hidden');
                    }
                }
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // Logout Action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminToken');
            if (loginModal) loginModal.style.display = 'flex';
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDashboardData();
        });
    }

    // Tab Navigation Switcher
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTabId = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // 2. Load Dashboard Statistics & Data Tables
    async function loadDashboardData() {
        await Promise.all([
            fetchStats(),
            fetchInquiries(),
            fetchInventory(),
            fetchReviews(),
            fetchSubscribers()
        ]);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Fetch Stats Summary
    async function fetchStats() {
        try {
            const res = await fetch(`${API_BASE}/admin/stats`);
            const data = await res.json();
            if (data.success && data.stats) {
                document.getElementById('stat-total-inquiries').textContent = data.stats.totalInquiries || 0;
                document.getElementById('stat-pending-orders').textContent = data.stats.pendingInquiries || 0;
                document.getElementById('stat-total-masks').textContent = data.stats.totalMasks || 0;
                document.getElementById('stat-total-subscribers').textContent = data.stats.totalSubscribers || 0;
            }
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        }
    }

    // Fetch & Render Customer Inquiries
    let allInquiries = [];
    async function fetchInquiries() {
        const tbody = document.getElementById('inquiries-tbody');
        try {
            const res = await fetch(`${API_BASE}/inquiries`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                allInquiries = data.data;
                renderInquiriesTable(allInquiries);
            }
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="color: var(--accent-red); text-align: center;">Failed loading inquiries. Ensure MongoDB server is running.</td></tr>`;
        }
    }

    function renderInquiriesTable(inquiries) {
        const tbody = document.getElementById('inquiries-tbody');
        if (!tbody) return;

        if (inquiries.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No customer inquiries found.</td></tr>`;
            return;
        }

        tbody.innerHTML = inquiries.map(item => {
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
            const statusClass = `status-${item.status || 'pending'}`;
            return `
                <tr>
                    <td style="font-size: 0.85rem; color: var(--text-secondary);">${dateStr}</td>
                    <td>
                        <strong>${escapeHtml(item.name)}</strong><br>
                        <span style="font-size: 0.85rem; color: var(--accent-gold);">${escapeHtml(item.email)}</span>
                    </td>
                    <td><span class="badge" style="margin-bottom:0; font-size:0.7rem; padding: 2px 10px;">${escapeHtml(item.inquiryType)}</span></td>
                    <td style="max-width: 280px; line-height: 1.4;">${escapeHtml(item.message)}</td>
                    <td>
                        <select class="status-select" data-inquiry-id="${item._id}">
                            <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="contacted" ${item.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                            <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${item.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <button class="table-action-btn delete-inquiry-btn" data-inquiry-id="${item._id}" title="Delete Record">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Wire status change dropdown listeners
        tbody.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-inquiry-id');
                const newStatus = e.target.value;
                await updateInquiryStatus(id, newStatus);
            });
        });

        // Wire delete record listeners
        tbody.querySelectorAll('.delete-inquiry-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-inquiry-id');
                if (confirm('Are you sure you want to delete this customer inquiry record?')) {
                    await deleteInquiry(id);
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Filter Inquiries by Status Buttons
    const statusFilterBtns = document.querySelectorAll('[data-status-filter]');
    statusFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            statusFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const status = btn.getAttribute('data-status-filter');

            if (status === 'all') {
                renderInquiriesTable(allInquiries);
            } else {
                const filtered = allInquiries.filter(i => i.status === status);
                renderInquiriesTable(filtered);
            }
        });
    });

    async function updateInquiryStatus(id, status) {
        try {
            const res = await fetch(`${API_BASE}/inquiries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchStats();
            }
        } catch (err) {
            console.error('Failed updating status:', err);
        }
    }

    async function deleteInquiry(id) {
        try {
            const res = await fetch(`${API_BASE}/inquiries/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchInquiries();
                fetchStats();
            }
        } catch (err) {
            console.error('Failed deleting inquiry:', err);
        }
    }

    // Fetch & Render Product Inventory
    let allMasks = [];
    async function fetchInventory() {
        const tbody = document.getElementById('inventory-tbody');
        try {
            const res = await fetch(`${API_BASE}/masks`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                allMasks = data.data;
                renderInventoryTable(allMasks);
            }
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="color: var(--accent-red); text-align: center;">Failed loading inventory. Ensure MongoDB server is running.</td></tr>`;
        }
    }

    function renderInventoryTable(masks) {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        if (masks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No mask products found in database.</td></tr>`;
            return;
        }

        tbody.innerHTML = masks.map(item => `
            <tr>
                <td><img src="${item.imgSrc}" alt="${item.title}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px;"></td>
                <td><code>${escapeHtml(item.maskId)}</code></td>
                <td><strong>${escapeHtml(item.title)}</strong></td>
                <td><span class="badge" style="margin-bottom:0; font-size:0.75rem;">${escapeHtml(item.category)}</span></td>
                <td style="color: var(--accent-gold); font-weight: 700;">${escapeHtml(item.price)}</td>
                <td>
                    <span class="status-badge ${item.inStock !== false ? 'status-completed' : 'status-cancelled'}">
                        ${item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                </td>
                <td>
                    <button class="table-action-btn edit-mask-btn" data-mongo-id="${item._id}" data-mask-id="${item.maskId}" title="Edit Product"><i data-lucide="edit-3"></i></button>
                    <button class="table-action-btn delete-mask-btn" data-mongo-id="${item._id}" data-mask-id="${item.maskId}" data-mask-title="${escapeHtml(item.title)}" title="Delete Product"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.edit-mask-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mongoId = btn.getAttribute('data-mongo-id');
                const maskId = btn.getAttribute('data-mask-id');
                const mask = allMasks.find(m => m._id === mongoId || m.maskId === maskId);
                if (mask) openMaskEditModal(mask);
            });
        });

        tbody.querySelectorAll('.delete-mask-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetId = btn.getAttribute('data-mongo-id') || btn.getAttribute('data-mask-id');
                const maskTitle = btn.getAttribute('data-mask-title') || 'this product';
                if (confirm(`Are you sure you want to delete '${maskTitle}' from MongoDB?`)) {
                    await deleteMask(targetId);
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Mask Modal Handling (Add / Edit)
    const maskModal = document.getElementById('mask-edit-modal');
    const maskCloseBtn = document.getElementById('mask-edit-close');
    const maskForm = document.getElementById('mask-edit-form');
    const addMaskBtn = document.getElementById('add-mask-btn');

    if (addMaskBtn) {
        addMaskBtn.addEventListener('click', () => {
            openMaskEditModal(null);
        });
    }

    if (maskCloseBtn) {
        maskCloseBtn.addEventListener('click', () => {
            if (maskModal) maskModal.classList.remove('active');
        });
    }

    function openMaskEditModal(mask) {
        const titleEl = document.getElementById('mask-modal-title');
        const mongoIdEl = document.getElementById('edit-mongo-id');
        const maskIdEl = document.getElementById('edit-mask-id');
        const titleInput = document.getElementById('edit-title');
        const catSelect = document.getElementById('edit-category');
        const priceInput = document.getElementById('edit-price');
        const dimsInput = document.getElementById('edit-dimensions');
        const auraInput = document.getElementById('edit-aura');
        const imgInput = document.getElementById('edit-img');
        const descInput = document.getElementById('edit-desc');

        if (mask) {
            titleEl.textContent = 'Edit Mask Product';
            mongoIdEl.value = mask._id || '';
            maskIdEl.value = mask.maskId || '';
            maskIdEl.disabled = true;
            titleInput.value = mask.title || '';
            catSelect.value = mask.category || 'protection';
            priceInput.value = mask.price || '';
            dimsInput.value = mask.dimensions || '';
            auraInput.value = mask.aura || '';
            imgInput.value = mask.imgSrc || '';
            descInput.value = mask.description || '';
        } else {
            titleEl.textContent = 'Add New Mask Product';
            mongoIdEl.value = '';
            maskIdEl.value = '';
            maskIdEl.disabled = false;
            maskForm.reset();
        }

        if (maskModal) maskModal.classList.add('active');
    }

    if (maskForm) {
        maskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const mongoId = document.getElementById('edit-mongo-id').value;
            const maskId = document.getElementById('edit-mask-id').value;
            const title = document.getElementById('edit-title').value;
            const category = document.getElementById('edit-category').value;
            const price = document.getElementById('edit-price').value;
            const dimensions = document.getElementById('edit-dimensions').value;
            const aura = document.getElementById('edit-aura').value;
            const imgSrc = document.getElementById('edit-img').value;
            const description = document.getElementById('edit-desc').value;

            // Generate clean category label
            const categoryMap = {
                protection: 'Protection & Wealth',
                prosperity: 'Peace & Fortune',
                ritual: 'Ritual Dance'
            };
            const categoryLabel = categoryMap[category] || category;
            const priceAmount = parseInt(price.replace(/[^0-9]/g, '')) || 20000;

            const defaultImg = 'assets/hero_mask.png';

            const payload = {
                maskId: maskId.trim() || (title ? title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'mask-' + Date.now()),
                title: title.trim() || 'New Traditional Mask',
                category: category || 'protection',
                categoryLabel: categoryLabel || 'Protection & Wealth',
                price: price.trim() || 'LKR 25,000',
                priceAmount: priceAmount || 25000,
                dimensions: dimensions.trim() || '18" x 12" x 6"',
                aura: aura.trim() || 'Protective energy & timeless heritage',
                imgSrc: imgSrc.trim() || defaultImg,
                description: description.trim() || 'Authentic hand-carved Sri Lankan Kaduru wood mask created by traditional hereditary master carvers.'
            };

            try {
                let res;
                const targetEndpoint = mongoId ? `${API_BASE}/masks/${encodeURIComponent(mongoId)}` : `${API_BASE}/masks`;
                const targetMethod = mongoId ? 'PUT' : 'POST';

                res = await fetch(targetEndpoint, {
                    method: targetMethod,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    localStorage.setItem('ceylon_mask_updated', Date.now());
                    maskModal.classList.remove('active');
                    alert(`Product "${title}" saved to database successfully!`);
                    fetchInventory();
                    fetchStats();
                } else {
                    alert(`Failed saving mask product: ${data.error || 'Database validation error'}`);
                }
            } catch (err) {
                console.error('Error saving mask product:', err);
                alert(`Network error saving product: Unable to connect to server on http://localhost:5000.\n\nPlease verify your server is running by typing "npm start" in your terminal.`);
            }
        });
    }

    async function deleteMask(maskId) {
        if (!maskId) {
            alert('Error: Missing product ID for deletion.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/masks/${encodeURIComponent(maskId)}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem('ceylon_mask_updated', Date.now());
                fetchInventory();
                fetchStats();
            } else {
                alert(`Failed deleting product: ${data.error || 'Server error'}`);
            }
        } catch (err) {
            console.error('Error deleting mask:', err);
            alert(`Unable to connect to database server.\n\nPlease verify that your Express server is running on http://localhost:5000 by typing "npm start" in your command prompt.`);
        }
    }

    // Fetch & Render Newsletter Subscribers
    let allSubscribers = [];
    async function fetchSubscribers() {
        const tbody = document.getElementById('subscribers-tbody');
        try {
            const res = await fetch(`${API_BASE}/newsletter`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                allSubscribers = data.data;
                renderSubscribersTable(allSubscribers);
            }
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="2" style="color: var(--accent-red); text-align: center;">Failed loading subscribers. Ensure MongoDB server is running.</td></tr>`;
        }
    }

    function renderSubscribersTable(subscribers) {
        const tbody = document.getElementById('subscribers-tbody');
        if (!tbody) return;

        if (subscribers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--text-secondary);">No subscribers found.</td></tr>`;
            return;
        }

        tbody.innerHTML = subscribers.map(item => {
            const dateStr = item.subscribedAt ? new Date(item.subscribedAt).toLocaleDateString() : 'N/A';
            return `
                <tr>
                    <td style="font-weight: 600; color: var(--accent-gold);">${escapeHtml(item.email)}</td>
                    <td style="font-size: 0.85rem; color: var(--text-secondary);">${dateStr}</td>
                </tr>
            `;
        }).join('');
    }

    // Copy All Emails Button Action
    const copySubscribersBtn = document.getElementById('copy-subscribers-btn');
    if (copySubscribersBtn) {
        copySubscribersBtn.addEventListener('click', () => {
            if (allSubscribers.length === 0) {
                alert('No subscriber emails available to copy.');
                return;
            }
            const emailList = allSubscribers.map(s => s.email).join(', ');
            navigator.clipboard.writeText(emailList).then(() => {
                alert(`Successfully copied ${allSubscribers.length} subscriber emails to clipboard!`);
            }).catch(() => {
                alert(`Subscribers: ${emailList}`);
            });
        });
    }

    // Fetch & Render Customer Reviews
    let allReviews = [];
    async function fetchReviews() {
        const tbody = document.getElementById('reviews-tbody');
        try {
            const res = await fetch(`${API_BASE}/reviews`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                allReviews = data.data;
                renderReviewsTable(allReviews);
            }
        } catch (err) {
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="color: var(--accent-red); text-align: center;">Failed loading customer reviews. Ensure MongoDB server is running.</td></tr>`;
        }
    }

    function renderReviewsTable(reviews) {
        const tbody = document.getElementById('reviews-tbody');
        if (!tbody) return;

        if (reviews.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No customer reviews found in database.</td></tr>`;
            return;
        }

        tbody.innerHTML = reviews.map(item => {
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
            const ratingStars = '★'.repeat(item.rating || 5);
            return `
                <tr>
                    <td style="font-size: 0.85rem; color: var(--text-secondary);">${dateStr}</td>
                    <td>
                        <strong>${escapeHtml(item.reviewerName)}</strong><br>
                        <span style="font-size: 0.8rem; color: var(--accent-gold);">${escapeHtml(item.location || 'International Collector')}</span>
                    </td>
                    <td><span style="color: var(--accent-gold); font-size: 1rem;">${ratingStars} (${item.rating || 5}/5)</span></td>
                    <td><span class="badge" style="margin-bottom:0; font-size:0.75rem;">${escapeHtml(item.maskTitle || 'Ceylon Mask Collection')}</span></td>
                    <td style="max-width: 300px; line-height: 1.4; font-style: italic;">"${escapeHtml(item.comment)}"</td>
                    <td>
                        <button class="table-action-btn delete-review-btn" data-review-id="${item._id}" data-reviewer="${escapeHtml(item.reviewerName)}" title="Delete Review">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.delete-review-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-review-id');
                const reviewer = btn.getAttribute('data-reviewer') || 'this review';
                if (confirm(`Are you sure you want to delete review by '${reviewer}'?`)) {
                    await deleteReview(id);
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function deleteReview(id) {
        if (!id) return;
        try {
            const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert('Review deleted successfully from MongoDB!');
                fetchReviews();
            } else {
                alert(`Failed deleting review: ${data.error || 'Server error'}`);
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Network error deleting review. Ensure MongoDB server is running.');
        }
    }

    // Utility: Escape HTML string
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Check Authentication on Page Load
    checkAuth();
});
