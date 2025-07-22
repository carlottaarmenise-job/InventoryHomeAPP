// src/serviceWorkerRegistration.js
export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registrato:", registration);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    });
  }
}
