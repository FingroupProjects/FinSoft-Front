// // Give the service worker access to Firebase Messaging.
// // Note that you can only use Firebase Messaging here. Other Firebase libraries
// // are not available in the service worker.
// importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
//
// // Initialize the Firebase app in the service worker by passing in
// // your app's Firebase config object.
// // https://firebase.google.com/docs/web/setup#config-object
// firebase.initializeApp({
//     apiKey: "AIzaSyB0s5dLzQZhwq6PlCO7aJHEx__UqW-9nzg",
//     authDomain: "finsoft-ba979.firebaseapp.com",
//     projectId: "finsoft-ba979",
//     storageBucket: "finsoft-ba979.appspot.com",
//     messagingSenderId: "754506329372",
//     appId: "1:754506329372:web:cecf11931afc35ff959ed9",
//     measurementId: "G-WWY76F9JBN"
// });
//
// // self.addEventListener("push", (event) => {
// //     const notif = event.data.json().notification;
// //
// //     event.waitUntil(self.registration.showNotification(notif.title, {
// //         body: notif.body,
// //         icon: 'Icon.png', /* or "icon.png" */
// //         data: {
// //             url: notif.click_action
// //         }
// //     }))
// // })
//
// // self.addEventListener("notificationclick",(event) => {
// //     event.waitUntil(clients.openWindow(event.notification.data.url))
// // })
//
// // Retrieve an instance of Firebase Messaging so that it can handle background
// // messages.
// const messaging = firebase.messaging();
//
// messaging.onBackgroundMessage((payload) => {
//     console.log(
//         '[firebase-messaging-sw.js] Received background message ',
//         payload
//     );
//     // Customize notification here
//     const notificationTitle = payload.notification.title;
//     const notificationOptions = {
//         body: payload.notification.body,
//         icon: '/Icon.png'
//     };
//
//     self.registration.showNotification(notificationTitle, notificationOptions);
// });