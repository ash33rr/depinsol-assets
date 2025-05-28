document.addEventListener("DOMContentLoaded", () => {
  const openButtons = document.querySelectorAll("[data-modal-target]");
  const closeButtons = document.querySelectorAll("[data-modal-close]");

  const toggleBodyScroll = () => {
    const isAnyModalOpen = document.querySelector(".modal[aria-hidden='false']");
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "";
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.querySelector(button.getAttribute("data-modal-target"));
      if (modal) {
        modal.setAttribute("aria-hidden", "false");
        toggleBodyScroll();
      }
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".modal");
      if (modal) {
        modal.setAttribute("aria-hidden", "true");
        toggleBodyScroll();
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal[aria-hidden='false']").forEach((modal) => {
        modal.setAttribute("aria-hidden", "true");
      });
      toggleBodyScroll();
    }
  });
});
