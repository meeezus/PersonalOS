// PersonalOS - Main JavaScript

// Set current date
const dateOpts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', dateOpts);

// Navigation
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const page = item.dataset.page;
        document.getElementById('pageTitle').textContent =
            page.charAt(0).toUpperCase() + page.slice(1);

        loadPage(page);
    });
});

// Chat toggle
const chatBtn = document.getElementById('chatBtn');
const chatOverlay = document.getElementById('chatOverlay');

chatBtn.addEventListener('click', () => {
    chatOverlay.classList.add('active');
});

// Fix: Escape key to close chat AND stop propagation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatOverlay.classList.contains('active')) {
        e.preventDefault();
        e.stopPropagation();
        chatOverlay.classList.remove('active');
    }
});

// Load dashboard data from API
async function loadDashboardData() {
    try {
        const response = await fetch('http://localhost:3002/api/dashboard');
        return await response.json();
    } catch (error) {
        console.error('Dashboard API error:', error);
        return null;
    }
}

// Main page router
async function loadPage(page) {
    const content = document.getElementById('contentArea');
    const data = await loadDashboardData();

    switch(page) {
        case 'home':
            content.innerHTML = renderHomePage(data);
            break;
        case 'reminders':
            content.innerHTML = renderRemindersPage(data);
            break;
        case 'projects':
            content.innerHTML = renderProjectsPage(data);
            break;
        case 'calendar':
            content.innerHTML = renderCalendarPage(data);
            break;
        case 'relationships':
            content.innerHTML = renderRelationshipsPage(data);
            break;
        case 'meetings':
            content.innerHTML = renderMeetingsPage(data);
            break;
        case 'knowledge':
            content.innerHTML = renderKnowledgePage(data);
            break;
        case 'sparkfile':
            content.innerHTML = renderSparkfilePage(data);
            break;
        default:
            content.innerHTML = renderEmptyState(page);
    }
}

// ===== HOME PAGE =====
async function renderHomePage(data) {
    const priority = data?.priority || 'Check Unified_Week1_Plan.md for today';
    const week1 = data?.week1 || { completed: 0, total: 90 };
    const percentage = Math.round((week1.completed / week1.total) * 100);

    // Load AI-generated briefing
    let briefing = "Loading daily briefing...";
    try {
        const briefingResponse = await fetch('http://localhost:3002/api/briefing');
        const briefingData = await briefingResponse.json();
        briefing = briefingData.briefing || briefing;
    } catch (error) {
        console.error('Error loading briefing:', error);
        briefing = "DUAL MISSION: Launch Musha Shugyo content system (Dec 30-Jan 5) + Execute 90 DecoponATX emails (Jan 6-10).";
    }

    // Load today's tasks from Unified plan
    let todaysTasks = [];
    try {
        const taskResponse = await fetch('http://localhost:3002/api/tasks/today');
        const taskData = await taskResponse.json();
        todaysTasks = taskData.tasks || [];
    } catch (error) {
        console.error('Error loading tasks:', error);
    }

    // Group tasks by time block
    const morningBlock = todaysTasks.filter(t =>
        t.time && (t.time.includes('7:00') || t.time.includes('7:30') || t.time.includes('8:00'))
    );

    const noonBlock = todaysTasks.filter(t =>
        t.time && t.time.includes('12:00')
    );

    const eveningBlock = todaysTasks.filter(t =>
        t.time && t.time.includes('8:00-8:15pm')
    );

    const endOfDayChecklist = todaysTasks.filter(t =>
        !t.time || t.title.toLowerCase().includes('checklist')
    );

    return `
        <!-- Overview -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">📋 Overview</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                    ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>
            <div style="padding: 1rem; color: var(--text-secondary); line-height: 1.6;">
                ${briefing}
            </div>
        </div>

        <!-- Focus & Recommendations -->
        <div class="card" style="margin-top: 1.5rem;">
            <div class="card-header">
                <div class="card-title">🎯 Focus & Recommendations</div>
            </div>
            <div style="padding: 0.5rem 0;">
                <div style="padding: 0.75rem 1rem; border-left: 3px solid var(--accent-green); background: rgba(16, 185, 129, 0.05); margin: 0.5rem 1rem;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">Top Priorities</div>
                </div>
                ${todaysTasks.slice(0, 3).map(task => `
                    <div class="list-item">
                        <div class="item-checkbox"></div>
                        <div class="item-content">
                            <div class="item-title">${task.title}</div>
                            <div class="item-meta">${task.time || 'Today'} • <span class="card-badge badge-green" style="padding: 0.125rem 0.5rem; font-size: 0.65rem;">Due Today</span></div>
                        </div>
                    </div>
                `).join('')}

                <div style="padding: 0.75rem 1rem; border-left: 3px solid var(--accent-blue); background: rgba(59, 130, 246, 0.05); margin: 1rem 1rem 0.5rem;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">Recommendations</div>
                </div>
                <div class="list-item">
                    <div class="item-checkbox"></div>
                    <div class="item-content">
                        <div class="item-title">Review Week 1 unified plan progress</div>
                        <div class="item-meta">Today • <span class="card-badge badge-blue" style="padding: 0.125rem 0.5rem; font-size: 0.65rem;">Review</span></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Today's Schedule -->
        <div class="section-header" style="margin-top: 2rem;">Today's Schedule</div>

        ${morningBlock.length > 0 ? `
        <div class="card">
            <div class="card-header">
                <div class="card-title">7:00-8:30am - MUSHA SHUGYO MORNING BLOCK</div>
                <div class="card-badge badge-purple">Morning</div>
            </div>
            <div class="item-list">
                ${morningBlock.map(task => `
                    <div class="list-item">
                        <div class="item-checkbox"></div>
                        <div class="item-content">
                            <div class="item-title">${task.title}</div>
                            <div class="item-meta">${task.time || ''}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${noonBlock.length > 0 ? `
        <div class="card">
            <div class="card-header">
                <div class="card-title">12:00-1:00pm - BJJ TRAINING</div>
                <div class="card-badge badge-green">Six Blades</div>
            </div>
            <div class="item-list">
                ${noonBlock.map(task => `
                    <div class="list-item">
                        <div class="item-checkbox"></div>
                        <div class="item-content">
                            <div class="item-title">${task.title}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${eveningBlock.length > 0 ? `
        <div class="card">
            <div class="card-header">
                <div class="card-title">8:00-8:15pm - EVENING WRAP</div>
                <div class="card-badge badge-teal">Evening</div>
            </div>
            <div class="item-list">
                ${eveningBlock.map(task => `
                    <div class="list-item">
                        <div class="item-checkbox"></div>
                        <div class="item-content">
                            <div class="item-title">${task.title}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${endOfDayChecklist.length > 0 ? `
        <div class="card">
            <div class="card-header">
                <div class="card-title">END OF DAY CHECKLIST</div>
            </div>
            <div class="item-list">
                ${endOfDayChecklist.map(task => `
                    <div class="list-item">
                        <div class="item-checkbox"></div>
                        <div class="item-content">
                            <div class="item-title">${task.title}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Goal Alignment -->
        <div class="section-header" style="margin-top: 2rem;">Goal Alignment</div>

        <div class="card">
            <div style="padding: 1rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
                Today's agenda shows only two focus time blocks: 40% for Quarterly Movement using the shortcut strategy
                opportunistically - Dan, Matt, and Will Reynolds represent both partnerships and relationship value simultaneously.
            </div>

            <div style="padding: 0 1rem 1rem;">
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600;">Launch Musha Shugyo</span>
                        <span style="color: var(--accent-green); font-weight: 600;">65% • ▲ 243%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill green" style="width: 65%"></div>
                    </div>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600;">Execute DecoponATX Week 1</span>
                        <span style="color: var(--accent-blue); font-weight: 600;">35% • ▼ -25%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="background: linear-gradient(90deg, var(--accent-blue), var(--accent-teal)); width: 35%"></div>
                    </div>
                </div>

                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600;">Strengthen existing relationships</span>
                        <span style="color: var(--accent-orange); font-weight: 600;">20% • ▼ -25%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="background: linear-gradient(90deg, var(--accent-orange), var(--accent-red)); width: 20%"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== REMINDERS PAGE =====
function renderRemindersPage(data) {
    return `
        <div class="section-header">Overdue</div>
        <div class="empty-state">
            <div class="empty-state-icon">✓</div>
            <div>No overdue reminders</div>
        </div>

        <div class="section-header">Today</div>
        <div class="item-list">
            <div class="list-item">
                <div class="item-checkbox"></div>
                <div class="item-content">
                    <div class="item-title">Follow up on Week 1 email responses</div>
                    <div class="item-meta">Today • 5:00 PM</div>
                </div>
            </div>
        </div>

        <div class="section-header">Next 3 Days</div>
        <div class="item-list">
            <div class="list-item">
                <div class="item-checkbox"></div>
                <div class="item-content">
                    <div class="item-title">Review Musha Shugyo cohort plan</div>
                    <div class="item-meta">Tomorrow • 10:00 AM</div>
                </div>
            </div>
        </div>

        <div class="section-header">Anytime</div>
        <div class="item-list">
            <div class="list-item">
                <div class="item-checkbox"></div>
                <div class="item-content">
                    <div class="item-title">Update Health Coaching website</div>
                    <div class="item-meta">No due date</div>
                </div>
            </div>
        </div>
    `;
}

// ===== PROJECTS PAGE =====
function renderProjectsPage(data) {
    return `
        <!-- Section Tabs -->
        <div class="section-tabs">
            <div class="tab" onclick="showProjectTab('life')">Life</div>
            <div class="tab active" onclick="showProjectTab('projects')">Projects</div>
            <div class="tab" onclick="showProjectTab('now')">Now</div>
        </div>

        <div id="projectTabContent">
            ${renderProjectsTab(data)}
        </div>
    `;
}

function renderProjectsTab(data) {
    const week1 = data?.week1 || { completed: 0, total: 90 };
    const percentage = Math.round((week1.completed / week1.total) * 100);

    return `
        <div class="section-header">Active Focus</div>

        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">
                        <span class="project-health health-good"></span>
                        DecoponATX - Week 1 Email Challenge
                    </div>
                    <div class="card-subtitle">
                        <span class="business-tag">DecoponATX</span>
                        Due Jan 3, 2025
                    </div>
                </div>
                <div class="card-badge">${percentage}%</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
            <div class="task-peek">
                <div class="item-list">
                    <div class="list-item">
                        <div class="item-checkbox"></div>
                        <div class="item-content">
                            <div class="item-title">Send 15-20 emails today</div>
                            <div class="item-meta">Due today • 8:00 AM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">
                        <span class="project-health health-warning"></span>
                        Musha Shugyo - Next Cohort
                    </div>
                    <div class="card-subtitle">
                        <span class="business-tag">Musha Shugyo</span>
                        Ongoing
                    </div>
                </div>
                <div class="card-badge badge-purple">10%</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill purple" style="width: 10%"></div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">
                        <span class="project-health health-good"></span>
                        Health Coaching - Client Programs
                    </div>
                    <div class="card-subtitle">
                        <span class="business-tag">Health Coaching</span>
                        Ongoing
                    </div>
                </div>
                <div class="card-badge badge-green">25%</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill green" style="width: 25%"></div>
                </div>
            </div>
        </div>
    `;
}

// ===== OTHER PAGES (Coming Soon) =====
function renderCalendarPage(data) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <div>Calendar integration coming soon</div>
        </div>
    `;
}

function renderRelationshipsPage(data) {
    return `
        <div class="section-header">All Relationships</div>
        <div class="empty-state">
            <div class="empty-state-icon">💼</div>
            <div>Relationship tracking coming soon</div>
            <div style="margin-top: 1rem; font-size: 0.875rem;">
                Your People files will appear here
            </div>
        </div>
    `;
}

function renderMeetingsPage(data) {
    return `
        <div class="section-header">Upcoming Meetings</div>
        <div class="empty-state">
            <div class="empty-state-icon">📞</div>
            <div>Meeting prep and notes coming soon</div>
        </div>
    `;
}

function renderKnowledgePage(data) {
    return `
        <div class="section-header">Knowledge Base</div>
        <div class="empty-state">
            <div class="empty-state-icon">📚</div>
            <div>Second brain coming soon</div>
            <div style="margin-top: 1rem; font-size: 0.875rem;">
                Drop links, articles, and notes here
            </div>
        </div>
    `;
}

function renderSparkfilePage(data) {
    return `
        <div class="section-header">Your Sparks</div>
        <div class="empty-state">
            <div class="empty-state-icon">✨</div>
            <div>Sparkfile coming soon</div>
            <div style="margin-top: 1rem; font-size: 0.875rem;">
                Capture half-baked ideas and watch patterns emerge
            </div>
        </div>
    `;
}

function renderEmptyState(page) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">🚧</div>
            <div>${page.charAt(0).toUpperCase() + page.slice(1)} coming soon...</div>
        </div>
    `;
}

// Project tabs switcher
window.showProjectTab = function(tab) {
    // Update tab styling
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    // Load tab content
    const content = document.getElementById('projectTabContent');

    if (tab === 'life') {
        content.innerHTML = `
            <div class="section-header">Spaces</div>
            <div class="three-col-grid">
                <div class="card">
                    <div class="card-title">DecoponATX</div>
                    <div class="card-subtitle" style="margin-top: 0.5rem;">Austin networking events</div>
                </div>
                <div class="card">
                    <div class="card-title">Musha Shugyo</div>
                    <div class="card-subtitle" style="margin-top: 0.5rem;">BJJ training programs</div>
                </div>
                <div class="card">
                    <div class="card-title">Health Coaching</div>
                    <div class="card-subtitle" style="margin-top: 0.5rem;">Client programs & content</div>
                </div>
            </div>
        `;
    } else if (tab === 'now') {
        content.innerHTML = `
            <div class="section-header">What to do next</div>
            <div class="item-list">
                <div class="list-item">
                    <div class="item-checkbox"></div>
                    <div class="item-content">
                        <div class="item-title">DecoponATX: Send 15-20 cold emails</div>
                        <div class="item-meta">Due today • Quick Win</div>
                    </div>
                </div>
                <div class="list-item">
                    <div class="item-checkbox"></div>
                    <div class="item-content">
                        <div class="item-title">Musha Shugyo: Draft cohort schedule</div>
                        <div class="item-meta">No due date • Deep Work</div>
                    </div>
                </div>
                <div class="list-item">
                    <div class="item-checkbox"></div>
                    <div class="item-content">
                        <div class="item-title">Health Coaching: Update website copy</div>
                        <div class="item-meta">No due date • Creative</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        loadDashboardData().then(data => {
            content.innerHTML = renderProjectsTab(data);
        });
    }
};

// Initial load
loadPage('home');
