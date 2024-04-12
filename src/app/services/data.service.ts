import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, map, take } from 'rxjs';

export interface INote {
  id?: string;
  title: string;
  content: string;
  order: number;
  mode: 'text' | 'list';
  updated: any;
  created: any;
  notebookId?: string;
  $saved?: 'yes' | 'no' | 'saving';  // set to false while typing into the textarea, and true when saved to DB 
}

export interface INotebook {
  id?: string;
  name: string;
  order: string;
}

export interface IConfig {
  lastId: string;
  darkMode: boolean;
  jumpMode: boolean;
  notebookId: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  notesCol = this.af.collection<INote>('notes');
  notes$ = this.notesCol.valueChanges();
  
  notebooksCol = this.af.collection<INotebook>('notebooks');
  notebooks$ = this.notebooksCol.valueChanges();

  configDoc = this.af.doc<IConfig>('notes/0');
  lastId = '0';
  selNotebookId$ = new BehaviorSubject('');
  config: IConfig = { lastId: '0', darkMode: true, jumpMode: false, notebookId: '' };

  constructor(private af: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.loadNotes();
    this.loadNotebooks();
    this.configDoc.valueChanges().pipe(take(1)).subscribe(config => {
      console.log('THE CONFIG IS', config);
      this.config = config as IConfig;
      if (this.router.url === '/home' && config && config?.lastId !== '0') {
        this.router.navigate(['/notes/' + config.lastId]);
      }
      this.changeDarkMode(config?.darkMode);
      this.selNotebookId$.next(config?.notebookId || '');
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

  loadNotebooks() {
    this.notebooks$ = this.notebooksCol.snapshotChanges().pipe(
      map(notes => notes
        .map(n => {
          const data = n.payload.doc.data() as INotebook;
          return { id: n.payload.doc.id, ...data };
        })
        .sort((a, b) => ((a.order || 0) > (b.order || 0) ? 1 : -1))
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

  selectNotebook(notebookId: string) {
    this.selNotebookId$.next(notebookId);
    this.config.notebookId = notebookId;
    this.configDoc.update({ notebookId });
  }

}
