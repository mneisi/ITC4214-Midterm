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

class AppHead extends HTMLElement {
    constructor() {
        super();
        document.head.innerHTML += `
            <!-- Meta Tags -->
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Musicly</title>
            
                <!-- CSS -->
                <link rel="stylesheet" href="/styles/style.css">

                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
                    rel="stylesheet" 
                    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" 
                    crossorigin="anonymous">
                <!-- JavaScript -->
                <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
                        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
                        crossorigin="anonymous"></script>'
                        
                <script src="/scripts/components.js" defer></script>
                <script src="/scripts/script.js" defer></script>

        `;
    }
}

customElements.define("app-head", AppHead);

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