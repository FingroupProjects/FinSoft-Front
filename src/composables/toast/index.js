import 'toastify-js/src/toastify.css';
import Toastify from 'toastify-js';

export default function showToast(message, colour) {
  let color 
  if(colour === 'green'){
    color = '#08D411'
  }
  if(colour === 'red') {
    color = '#F21919'
  }
  if(colour === 'warning') {
    color = '#F9F91F'
  }
    Toastify({
      text: message,
      duration: 2000, 
      newWindow: true,
      close: true,
      gravity: 'top',
      position: 'right',
      style: {
        background: color,
      },
      stopOnFocus: true, 
    }).showToast();
  };