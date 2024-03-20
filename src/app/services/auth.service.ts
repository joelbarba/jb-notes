import { Injectable, inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { map, take } from 'rxjs';

import { Auth, User, user } from '@angular/fire/auth';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { userAuth } from 'secrets';


@Injectable({ providedIn: 'root' })
export class AuthService {
  isReady = false;

  constructor(
    private af: AngularFirestore, 
    private router: Router, 
    private route: ActivatedRoute) {

      // this.user$.subscribe((aUser: User | null) => {
      //     //handle user state changes here. Note, that user will be null if there is no currently logged in user.
      //   console.log(aUser);
      // });

      console.log('signing in');
      const auth = getAuth();
      signInWithEmailAndPassword(auth, userAuth.user, userAuth.pass).then(data => {
        if (!data.user.emailVerified) { // User not activated
          // userCredential.user.sendEmailVerification(settings).then(() => { ...
          
        } else { // Login successful --> this.router.navigate(['home']);
        }
        console.log('User logged in', data.user.email);
        this.isReady = true;
      });
      

  }

}
