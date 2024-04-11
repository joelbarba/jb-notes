import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { map, take } from 'rxjs';

export interface INote {
  id?: string;
  title: string;
  content: string;
  order: number;
  mode: 'text' | 'list';
  updated: any;
  created: any;
  $saved?: 'yes' | 'no' | 'saving';  // set to false while typing into the textarea, and true when saved to DB 
}

export interface IConfig {
  lastId: string;
  darkMode: boolean;
  jumpMode: boolean;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  notesCol = this.af.collection<INote>('notes');
  configDoc = this.af.doc<IConfig>('notes/0');
  notes$ = this.notesCol.valueChanges();
  lastId: string = '0';
  config: IConfig = { lastId: '0', darkMode: true, jumpMode: false };

  constructor(private af: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.loadNotes();
    this.configDoc.valueChanges().pipe(take(1)).subscribe(config => {
      console.log('THE CONFIG IS', config);
      this.config = config as IConfig;
      if (this.router.url === '/home' && config && config?.lastId !== '0') {
        this.router.navigate(['/notes/' + config.lastId]);
      }
      this.changeDarkMode(config?.darkMode);
    });
  }

  loadNotes() {
    this.notes$ = this.notesCol.snapshotChanges().pipe(
      map(notes => notes
        .map(n => {
          const data = n.payload.doc.data() as INote;
          return { id: n.payload.doc.id, ...data };
        })
        .filter(n => n.id !== '0')
        .sort((a, b) => {
          if (!!a.order || !!b.order) { return (a.order || 0) > (b.order || 0) ? -1 : 1; }
          return a.updated > b.updated ? -1 : 1;
        })
      )
    );
  }

  // formatDate(fDate: { seconds: number, nanoseconds: number }): string {
  //   const dp = (new Date(fDate.seconds * 1000) + '').split(' ');
  //   return `${dp[2]} ${dp[1]} ${dp[3]} - ${dp[4]}`;
  // }

  getNote(id: string) {
    return this.notes$.pipe(map(notes => notes.find(n => n.id === id)));
  }

  getCurrentTime() {
    return (new Date()).getTime(); // ms
    // return { seconds: Math.round((new Date()).getTime() / 1000), nanoseconds: 0, };
  }

  changeDarkMode(value = true) {
    console.log('changeDarkMode', value);
    this.config.darkMode = value;
    const bodyTag = document.body;
    if (value) { bodyTag.classList.add('dark'); }
    else       { bodyTag.classList.remove('dark'); }
  }

}
