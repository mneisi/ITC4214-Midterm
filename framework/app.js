$(document).ready(function () {
    function loadPage(page) {
        $("#content").fadeOut(200, function () {
            $("#content").load(`/app/pages/${page}.html`, function (response, status) {
                if (status === "error") {
                    $("#content").html("<h2>404 - Page Not Found</h2>");
                }
                $(this).fadeIn(200);
            });
        });

        $(".nav-link").removeClass("active");
        $(`.nav-link[data-page='${page}']`).addClass("active");

        window.history.pushState({ page: page }, "", `#${page}`);
    }

    let initialPage = window.location.hash.substring(1) || "home";
    loadPage(initialPage);

    $(".nav-link").click(function (event) {
        event.preventDefault();
        let page = $(this).data("page");
        loadPage(page);
    });

    window.onpopstate = function (event) {
        if (event.state) {
            loadPage(event.state.page);
        }
    };
});
