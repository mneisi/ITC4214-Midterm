document.addEventListener("DOMContentLoaded", function () {
    fetch("/app/app.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("app-container").innerHTML = html;
            // After loading, initialize the app logic
            const script = document.createElement("script");
            script.src = "/framework/app.js";
            document.body.appendChild(script);
        })
        .catch(error => console.error("Failed to load app.html:", error));
});

// Load config.json dynamically into the head
class AppHead extends HTMLElement {
    constructor() {
        super();
        this.loadConfig();
    }

    async loadConfig() {
        try {
            const response = await fetch('/config.json');
            const config = await response.json();

            // Inject meta tags
            config.meta.forEach(meta => {
                let metaTag = document.createElement("meta");
                Object.keys(meta).forEach(key => metaTag.setAttribute(key, meta[key]));
                document.head.appendChild(metaTag);
            });

            // Inject CSS links
            config.css.forEach(cssLink => {
                let linkTag = document.createElement("link");
                linkTag.rel = "stylesheet";
                linkTag.href = cssLink;
                document.head.appendChild(linkTag);
            });

            // Inject JS scripts
            config.js.forEach(scriptSrc => {
                let scriptTag = document.createElement("script");
                scriptTag.src = scriptSrc;
                scriptTag.defer = true;
                document.head.appendChild(scriptTag);
            });

        } catch (error) {
            console.error("Failed to load config.json:", error);
        }
    }
}
customElements.define("app-head", AppHead);

// Navbar Component
class AppNavbar extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid w-75 p-1">
              <a class="navbar-brand" href="#">Navbar</a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                  <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="/pages/index.html">Home</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/pages/tasks.html">Tasks</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/pages/about.html">About</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="/pages/contact.html">Contact</a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        `;
    }
}
customElements.define("app-navbar", AppNavbar);

// Footer Component
class AppFooter extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <footer class="bg-dark text-white text-center py-3 mt-5">
                <p>&copy; 2024 Musicly. All Rights Reserved.</p>
            </footer>
        `;
    }
}
customElements.define("app-footer", AppFooter);
