// Updated Dark Mode Script with event propagation
document.addEventListener('DOMContentLoaded', () => {

    const darkModeToggle = document.getElementById('darkModeToggle');
    let isDarkMode = localStorage.getItem('darkMode') === 'enabled';

    function enableDarkMode(enable) {
        isDarkMode = enable;
        document.body.classList.toggle('dark-mode', enable);
        darkModeToggle.textContent = enable ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem('darkMode', enable ? 'enabled' : 'disabled');
        
        // Update all dynamic content
        updateThemeDependentElements();
        displayRecentTasks();
    }

    // Initialize dark mode
    enableDarkMode(isDarkMode);

    darkModeToggle.addEventListener('click', () => {
        enableDarkMode(!isDarkMode);
    });

    // Update elements that need theme-specific classes
    function updateThemeDependentElements() {
        // Update navbar theme
        const navbar = document.querySelector('.navbar');
        navbar.classList.toggle('navbar-dark', isDarkMode);
        navbar.classList.toggle('navbar-light', !isDarkMode);
    }

    // Activity Display Function
    function displayRecentTasks() {
        const activitySection = document.getElementById('activity');
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        const recentTasks = tasks.sort((a, b) => b.id - a.id).slice(0, 5);

        const activityHTML = recentTasks.map(task => `
            <div class="activity-item mb-3 p-3 border rounded">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${task.name}</h5>
                        <small class="${isDarkMode ? 'text-muted-dark' : 'text-muted'}">
                            Due: ${task.dueDate}
                        </small>
                    </div>
                    <span class="badge ${getPriorityClass(task.priority)}">
                        ${task.priority}
                    </span>
                </div>
                ${task.description ? `<p class="mt-2 mb-0">${task.description}</p>` : ''}
            </div>
        `).join('');

        activitySection.innerHTML = activityHTML || 
            `<p class="${isDarkMode ? 'text-muted-dark' : 'text-muted'}">No recent activity</p>`;
    }

    // Priority classes using theme context
    function getPriorityClass(priority) {
        switch(priority.toLowerCase()) {
            case 'high': return 'bg-danger';
            case 'medium': return isDarkMode ? 'bg-warning text-dark' : 'bg-warning';
            case 'low': return 'bg-success';
            default: return 'bg-secondary';
        }
    }
});
