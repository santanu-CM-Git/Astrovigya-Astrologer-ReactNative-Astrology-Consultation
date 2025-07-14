import * as firebase from "firebase/app"

const firebaseConfig = {
    apiKey: "AIzaSyC-vCkuuBqnsZcSwSXvMDMyHM88-NssTCQ",
    authDomain: 'astrovigyaastrologer-dd55a.firebaseapp.com',
    databaseURL: "https://astrovigyaastrologer-dd55a-default-rtdb.firebaseio.com/",
    projectId: 'astrovigyaastrologer-dd55a',
    storageBucket: 'astrovigyaastrologer-dd55a.appspot.com',
    messagingSenderId: '705575053072',
    appId: '1:705575053072:android:03482b18254c411a7b2795',
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;
