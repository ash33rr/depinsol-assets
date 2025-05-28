function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const icon = document.getElementById("menu-icon");

  const isVisible = menu.classList.toggle("is-visible");

  if (isVisible) {
    icon.classList.remove("bi-list");
    icon.classList.add("bi-x-lg");
  } else {
    icon.classList.remove("bi-x-lg");
    icon.classList.add("bi-list");
  }
}
