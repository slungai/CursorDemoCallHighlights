// Storage key for localStorage
const STORAGE_KEY = 'callHighlights_transcripts';
const THEME_KEY = 'callHighlights_theme';

// View mode state
let groupByCompany = true;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const dateInput = document.getElementById('transcriptDate');
    if (dateInput) {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        dateInput.value = dateString;
    }
    
    // Initialize theme
    initializeTheme();
    
    // Load existing data
    loadAndRender();
    
    // Form submission
    const form = document.getElementById('transcriptForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    // Toggle view button
    const toggleViewBtn = document.getElementById('toggleView');
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', () => {
            groupByCompany = !groupByCompany;
            toggleViewBtn.textContent = groupByCompany ? 'Show All' : 'Group by Company';
            loadAndRender();
        });
    }
    
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const dateInput = document.getElementById('transcriptDate');
    const companyInput = document.getElementById('companyName');
    const textInput = document.getElementById('transcriptText');
    
    const date = dateInput.value;
    const company = companyInput.value.trim();
    const transcript = textInput.value.trim();
    
    if (!transcript) {
        alert('Please enter a transcript');
        return;
    }
    
    if (!company) {
        alert('Please enter a company name');
        return;
    }
    
    // Save transcript
    saveTranscript(date, company, transcript);
    
    // Clear form
    textInput.value = '';
    companyInput.value = '';
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
    
    // Reload and render
    loadAndRender();
}

// Save transcript to localStorage
function saveTranscript(date, company, transcript) {
    const transcripts = getTranscripts();
    const newCall = {
        id: Date.now(),
        date: date,
        company: company || 'Unknown',
        transcript: transcript
    };
    transcripts.unshift(newCall); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transcripts));
}

// Get all transcripts from localStorage
function getTranscripts() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Delete transcript
function deleteTranscript(id) {
    const transcripts = getTranscripts();
    const filtered = transcripts.filter(call => call.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    loadAndRender();
}

// Calculate insights
function calculateInsights(transcripts) {
    if (transcripts.length === 0) {
        return {
            totalCalls: 0,
            totalWords: 0,
            avgWords: 0,
            mostActiveDay: '-'
        };
    }
    
    // Total words
    const totalWords = transcripts.reduce((sum, call) => {
        return sum + call.transcript.split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    
    // Average words
    const avgWords = Math.round(totalWords / transcripts.length);
    
    // Most active day of week
    const dayCounts = {};
    transcripts.forEach(call => {
        const date = new Date(call.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });
    
    const mostActiveDay = Object.keys(dayCounts).reduce((a, b) => 
        dayCounts[a] > dayCounts[b] ? a : b
    );
    
    return {
        totalCalls: transcripts.length,
        totalWords: totalWords,
        avgWords: avgWords,
        mostActiveDay: mostActiveDay
    };
}

// Render insights
function renderInsights(transcripts) {
    const insights = calculateInsights(transcripts);
    
    const totalCallsEl = document.getElementById('totalCalls');
    const totalWordsEl = document.getElementById('totalWords');
    const avgWordsEl = document.getElementById('avgWords');
    const mostActiveDayEl = document.getElementById('mostActiveDay');
    
    if (totalCallsEl) totalCallsEl.textContent = insights.totalCalls;
    if (totalWordsEl) totalWordsEl.textContent = insights.totalWords.toLocaleString();
    if (avgWordsEl) avgWordsEl.textContent = insights.avgWords.toLocaleString();
    if (mostActiveDayEl) mostActiveDayEl.textContent = insights.mostActiveDay;
}

// Render call history
function renderCallHistory(transcripts) {
    const historyContainer = document.getElementById('callHistory');
    
    if (transcripts.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state">No calls saved yet. Add your first transcript above!</div>';
        return;
    }
    
    if (groupByCompany) {
        renderGroupedByCompany(transcripts, historyContainer);
    } else {
        renderFlatList(transcripts, historyContainer);
    }
}

// Render calls grouped by company
function renderGroupedByCompany(transcripts, container) {
    // Group calls by company
    const grouped = {};
    transcripts.forEach(call => {
        const company = call.company || 'Unknown';
        if (!grouped[company]) {
            grouped[company] = [];
        }
        grouped[company].push(call);
    });
    
    // Sort companies alphabetically
    const companies = Object.keys(grouped).sort();
    
    // Render each company group
    container.innerHTML = companies.map(company => {
        const calls = grouped[company];
        const callCount = calls.length;
        const totalWords = calls.reduce((sum, call) => {
            return sum + call.transcript.split(/\s+/).filter(word => word.length > 0).length;
        }, 0);
        
        const callsHtml = calls.map(call => renderSingleCall(call)).join('');
        
        return `
            <div class="company-group">
                <div class="company-header" data-company="${escapeHtml(company)}">
                    <div class="company-info">
                        <h3 class="company-name">${escapeHtml(company)}</h3>
                        <span class="company-meta">${callCount} call${callCount !== 1 ? 's' : ''} • ${totalWords.toLocaleString()} words</span>
                    </div>
                    <div class="company-toggle">▼</div>
                </div>
                <div class="company-calls">
                    ${callsHtml}
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers for company headers
    container.querySelectorAll('.company-header').forEach(header => {
        header.addEventListener('click', function() {
            const companyGroup = this.closest('.company-group');
            companyGroup.classList.toggle('collapsed');
            const toggle = this.querySelector('.company-toggle');
            toggle.textContent = companyGroup.classList.contains('collapsed') ? '▶' : '▼';
        });
    });
    
    // Add click handlers for individual calls
    container.querySelectorAll('.call-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-delete')) {
                return;
            }
            this.classList.toggle('expanded');
        });
    });
}

// Render flat list (original view)
function renderFlatList(transcripts, container) {
    container.innerHTML = transcripts.map(call => renderSingleCall(call)).join('');
    
    // Add click handlers to expand/collapse
    container.querySelectorAll('.call-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't toggle if clicking delete button
            if (e.target.classList.contains('btn-delete')) {
                return;
            }
            this.classList.toggle('expanded');
        });
    });
}

// Render a single call item
function renderSingleCall(call) {
    const date = new Date(call.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    const wordCount = call.transcript.split(/\s+/).filter(word => word.length > 0).length;
    const preview = call.transcript.substring(0, 50) + (call.transcript.length > 50 ? '...' : '');
    const company = call.company || 'Unknown';
    
    return `
        <div class="call-item" data-id="${call.id}">
            <div class="call-header">
                <div class="call-info">
                    <div class="call-date">${formattedDate}</div>
                    ${!groupByCompany ? `<div class="call-company">${escapeHtml(company)}</div>` : ''}
                    <div class="call-preview">${preview}</div>
                    <div class="call-meta">${wordCount.toLocaleString()} words</div>
                </div>
                <div class="call-actions">
                    <button class="btn-delete" onclick="deleteTranscript(${call.id})">Delete</button>
                </div>
            </div>
            <div class="call-content">
                <div class="call-content-text">${escapeHtml(call.transcript)}</div>
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load data and render everything
function loadAndRender() {
    const transcripts = getTranscripts();
    renderInsights(transcripts);
    renderCallHistory(transcripts);
}

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Make deleteTranscript available globally for onclick handlers
window.deleteTranscript = deleteTranscript;

