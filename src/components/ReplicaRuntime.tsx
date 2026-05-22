"use client";

import { useEffect } from "react";

export function ReplicaRuntime() {
  useEffect(() => {
    const root = document.querySelector(".replica-page");
    if (!root) return;

    const activate = (element: Element) => {
      element.setAttribute("data-animation-state", "active");
      element
        .querySelectorAll("[data-animation-role='image'], [data-animation-role='block-element']")
        .forEach((child) => child.setAttribute("data-animation-state", "active"));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) activate(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.04 },
    );

    root.querySelectorAll(".transition").forEach((element) => {
      observer.observe(element);
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) activate(element);
    });

    root.querySelectorAll("img").forEach((image) => {
      image.classList.add("loaded");
      image.closest("[data-animation-role='image']")?.classList.add("loaded");
      image.addEventListener("load", () => image.classList.add("loaded"), { once: true });
    });

    root.querySelectorAll("[data-animation-role='image']").forEach((element) => {
      element.classList.add("loaded");
    });

    const menuButtons = Array.from(root.querySelectorAll<HTMLButtonElement>(".block-header__hamburger-menu"));
    const cleanups = menuButtons.map((button) => {
      const header = button.closest(".block-header-layout-mobile");
      const dropdown = header?.querySelector(".block-header-layout-mobile__dropdown");
      const handler = () => {
        dropdown?.classList.toggle("block-header-layout-mobile__dropdown--open");
        button.classList.toggle("burger--active");
        button.setAttribute("aria-expanded", dropdown?.classList.contains("block-header-layout-mobile__dropdown--open") ? "true" : "false");
      };
      button.setAttribute("aria-expanded", "false");
      button.addEventListener("click", handler);
      return () => button.removeEventListener("click", handler);
    });

    const preventFormSubmit = (event: Event) => {
      event.preventDefault();
    };
    root.querySelectorAll("form").forEach((form) => form.addEventListener("submit", preventFormSubmit));

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      root.querySelectorAll("form").forEach((form) => form.removeEventListener("submit", preventFormSubmit));
    };
  }, []);

  return null;
}
