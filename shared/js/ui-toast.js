/**
 * COSYplatform - Toast Notification Utility
 * Exposes window.CosyUI.toast(message, type) for unobtrusive status notifications.
 */
(function (global) {
  'use strict';

  global.CosyUI = global.CosyUI || {};

  global.CosyUI.toast = function (message, type) {
    if (!message) return;

    let container = document.getElementById('cosy-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cosy-toast-container';
      container.className = 'cosy-toast-container';
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = 'cosy-toast' + (type ? ' cosy-toast-' + type : '');
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    toastEl.textContent = message;

    container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.add('cosy-toast-fade-out');
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    }, 3000);
  };
})(typeof window !== 'undefined' ? window : global);
