import 'toastify-js/src/toastify.css';
import Toastify from 'toastify-js';

export default function showToast(message) {
    Toastify({
      text: message,
      duration: 2000, 
      newWindow: true,
      close: true,
      gravity: 'top',
      position: 'right',
      style: {
        background: '#78b55f',
      },
      stopOnFocus: true, 
    }).showToast();
  };