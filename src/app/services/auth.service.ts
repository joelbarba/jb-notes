import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { map, take } from 'rxjs';

import { Auth, User, onAuthStateChanged, user } from '@angular/fire/auth';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { userAuth } from 'secrets';


@Injectable({ providedIn: 'root' })
export class AuthService {
  isReady = false;
  promise!: Promise<void>;

  constructor(
    private af: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    // private auth: Auth,
  ) {
    const auth = getAuth();
    this.promise = new Promise((resolve => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('Auth Session Detected. You are:', user.displayName);
          this.isReady = true;
          resolve();
  
        } else { // User is signed out
          console.log('No Auth Session');
          this.login();
        }
      });
    })) 

  }

  login() {
    console.log('Signing in');
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, userAuth.user, userAuth.pass).then(data => {
      console.log('User logged in', data.user.email);

      if (!data.user.emailVerified) { // User not activated
        // userCredential.user.sendEmailVerification(settings).then(() => { ...

      } else { // Login successful --> this.router.navigate(['home']);
      }

    });
  }

}
