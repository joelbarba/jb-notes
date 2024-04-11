const secrets = require('./secrets.js');
const initializeApp = require('firebase/app').initializeApp;
const firestore = require('firebase/firestore/lite');
const auth = require('firebase/auth');
const fs = require('fs');

const app = initializeApp(secrets.firebaseConfig);
const db = firestore.getFirestore(app);

(async function() {
  console.log('Start at: ', new Date());
  console.log('');

  await auth.signInWithEmailAndPassword(auth.getAuth(), secrets.userAuth.user, secrets.userAuth.pass);
  // console.log('Admin logged in');

  const notesCollection = firestore.collection(db, 'notes');
  const notesSnapshot = await firestore.getDocs(notesCollection);
  const notes = notesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  // console.log(notes);

  // if (!fs.existsSync('./data')) { fs.mkdirSync('./data'); }

  notes.filter(n => n.id !== '0').forEach(note => {
    const fileName = `${note.title}.txt`;
    console.log(` - Writing ${fileName}...`);
    if (note.content) { fs.writeFileSync(fileName, note.content); }
  });

  console.log('');
  console.log('End at: ', new Date());

}());