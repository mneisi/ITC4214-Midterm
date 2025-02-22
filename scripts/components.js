// Helper function to load the the templates from the component files
async function loadTemplate(url, templateId) {
    const res = await fetch(url);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const template = doc.getElementById(templateId);
    return template ? template.innerHTML : '';
  }


// Custom Element for Footer
class AppNavbar extends HTMLElement {
    async connectedCallback() {
        const navbarContent = await loadTemplate('/pages/components/navbar-component.html', 'navbar-component');
        this.innerHTML = navbarContent;
    }
}
customElements.define('app-navbar', AppNavbar);
  

// Custom Element for Footer
class AppFooter extends HTMLElement {
    async connectedCallback() {
        const footerContent = await loadTemplate('/pages/components/footer-component.html', 'footer-component');
        this.innerHTML = footerContent;
    }
}
customElements.define('app-footer', AppFooter);