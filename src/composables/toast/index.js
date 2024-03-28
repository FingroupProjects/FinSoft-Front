import 'toastify-js/src/toastify.css';
import Toastify from 'toastify-js';

let currentToast = null

export default function showToast(message, colour = 'green', duration = 2000) {
  let color;

  if (colour === 'green') {
    color = '#08D411';
  }
  if (colour === 'red') {
    color = '#F21919';
  }
  if (colour === 'warning') {
    color = '#faa500';
  }

  // Проверяем, есть ли текущий Toast, и закрываем его, если есть
  if (currentToast) {
    currentToast.hideToast();
  }

  currentToast = Toastify({
    text: message,
    duration: duration,
    newWindow: true,
    close: true,
    gravity: 'top',
    position: 'right',
    style: {
      background: color,
    },
    stopOnFocus: true,
  });

  currentToast.showToast();
};