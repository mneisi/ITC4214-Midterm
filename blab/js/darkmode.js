// darkmode.js
document.addEventListener('DOMContentLoaded', () => {
    // Check dark mode preference from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    }
  
    // Optionally, if a dark mode toggle exists on the page
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
      darkModeToggle.addEventListener('click', () => {
        const newMode = !document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', newMode);
        localStorage.setItem('darkMode', newMode ? 'enabled' : 'disabled');
        darkModeToggle.textContent = newMode ? 'Light Mode' : 'Dark Mode';
      });
    }
  });
  