const DEMO_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Storage for recent entries
let recentEntries = [];
let currentUser = null;

// Login functionality
document.getElementById('loginForm').addEventListener('submit', function(e) {
    console.log("Login form submitted");
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginAlert = document.getElementById('loginAlert');
    
    // Simple validation (in production, validation & auth must be server-side)
    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
        currentUser = username;
        document.getElementById('userDisplay').textContent = username;
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'block';
        loginAlert.style.display = 'none';
    } else {
        // Generic error message — NO credentials shown here anymore
        loginAlert.textContent = 'Invalid username or password. Please try again.';
        loginAlert.style.display = 'block';
        loginAlert.className = 'alert alert-error';
    }
});

// Logout functionality
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('adminContainer').style.display = 'none';
        document.getElementById('loginForm').reset();
    }
}

// Entry form submission
document.getElementById('entryForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Show Bootstrap modal instead of confirm()
    const modal = new bootstrap.Modal(document.getElementById('submitConfirmModal'));
    modal.show();
});

// Handle the confirm button click in the modal
document.getElementById('confirmSubmitBtn').addEventListener('click', async function() {
    // Hide the modal first
    const modal = bootstrap.Modal.getInstance(document.getElementById('submitConfirmModal'));
    modal.hide();
    
    // Now execute your existing form submission logic
    const saveBtn = document.getElementById('saveBtn');
    const spinner = document.getElementById('loadingSpinner');
    const formAlert = document.getElementById('formAlert');

    // Collect form data
    const formData = {
        ID: Date.now().toString(),
        Type: document.getElementById('entryTitle').value.trim(),
        Category: document.getElementById('category').value,
        Description: document.getElementById('description').value.trim(),
        Sanctions: null,
        Page: document.getElementById('referencePage').value.trim() || null
    };

    // Validate
    if (!formData.Type || !formData.Category || !formData.Description) {
        showAlert('Please fill in all required fields.', 'error');
        return;
    }

    saveBtn.disabled = true;
    spinner.style.display = 'block';
    formAlert.style.display = 'none';

    try {
        const response = await fetch('/addDatabaseBot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to add entry');
        }

        recentEntries.unshift({
            ...formData,
            timestamp: new Date().toISOString()
        });
        if (recentEntries.length > 5) recentEntries = recentEntries.slice(0, 5);

        updateRecentEntries();
        clearFormSilently();
        showAlert('Entry saved successfully!', 'success');

    } catch (err) {
        console.error('Save error:', err);
        showAlert(`Error: ${err.message}`, 'error');
    } finally {
        saveBtn.disabled = false;
        spinner.style.display = 'none';
    }
});

// Clear form with confirmation
function clearForm() {
    if (document.getElementById('entryTitle').value || 
        document.getElementById('description').value || 
        document.getElementById('referencePage').value) {
        
        // Show Bootstrap modal instead of confirm()
        const modal = new bootstrap.Modal(document.getElementById('clearFormModal'));
        modal.show();
        return;
    }
    
    // If form is empty, clear silently
    clearFormSilently();
}

// Handle the confirm clear button click in the modal
document.getElementById('confirmClearBtn').addEventListener('click', function() {
    // Hide the modal first
    const modal = bootstrap.Modal.getInstance(document.getElementById('clearFormModal'));
    modal.hide();
    
    // Clear the form
    clearFormSilently();
});

// Clear form without any confirmation (for after successful saves)
function clearFormSilently() {
    document.getElementById('entryForm').reset();
    document.getElementById('charCounter').textContent = '0 / 2000 characters';
    document.getElementById('charCounter').classList.remove('warning');
    document.getElementById('formAlert').style.display = 'none';
}

// Show alert
function showAlert(message, type) {
    const formAlert = document.getElementById('formAlert');
    formAlert.textContent = message;
    formAlert.className = `alert alert-${type}`;
    formAlert.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            formAlert.style.display = 'none';
        }, 5000);
    }
}

// Update recent entries
function updateRecentEntries() {
    const container = document.getElementById('recentEntries');
    
    if (recentEntries.length === 0) {
        container.innerHTML = '<p style="color: var(--gray); font-size: 14px;">No recent entries to display.</p>';
        return;
    }
    
    container.innerHTML = recentEntries.map(entry => `
        <div class="entry-item">
            <div class="entry-title">${entry.type}</div>
            <div class="entry-meta">
                Category: ${entry.category} | 
                Added: ${new Date(entry.timestamp).toLocaleString()} |
                ${entry.page ? `Page: ${entry.page}` : 'No reference page'}
            </div>
        </div>
    `).join('');
}

// Character counter
document.getElementById('description').addEventListener('input', function() {
    const length = this.value.length;
    const counter = document.getElementById('charCounter');
    counter.textContent = `${length} / 2000 characters`;
    
    if (length > 1800) {
        counter.classList.add('warning');
    } else {
        counter.classList.remove('warning');
    }
});

// Prevent form resubmission
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Autofocus username
window.addEventListener('load', function() {
    document.getElementById('username').focus();
});

// Handle Enter key
document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});

/** -FOR ADDING INFORMATION SECTION- */