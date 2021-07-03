import firebase from 'firebase';

require('@firebase/firestore')
var firebaseConfig = {
  apiKey: "AIzaSyBUwbxu1sjShq0EzFf3aMIVNL1tomjdHaA",
  authDomain: "barter-system-2c9c0.firebaseapp.com",
  projectId: "barter-system-2c9c0",
  storageBucket: "barter-system-2c9c0.appspot.com",
  messagingSenderId: "12984749007",
  appId: "1:12984749007:web:049080a03ef13f2c6b20ba"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()