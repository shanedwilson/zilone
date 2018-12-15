import firebase from 'firebase/app';
import 'firebase/auth';

const authenticate = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  return firebase.auth().signInWithPopup(provider);
};

const logOutUser = () => {
  firebase.auth().signOut();
};

const getCurrentUid = () => firebase.auth().currentUser.uid;

export default { authenticate, logOutUser, getCurrentUid };
