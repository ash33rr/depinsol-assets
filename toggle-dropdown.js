document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll("[data-dropdown-toggle]");

  toggles.forEach((toggle) => {
    const targetId = toggle.getAttribute("data-dropdown-toggle");
    const menu = document.getElementById(targetId);

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      menu.classList.toggle("is-visible");
    });

    document.addEventListener("click", (e) => {
      if (
        !toggle.closest("[data-dropdown]")?.contains(e.target) &&
        window.innerWidth >= 1024
      ) {
        menu.classList.remove("is-visible");
      }
    });
  });
});
