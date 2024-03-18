import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, filter } from 'rxjs';

export interface INote {
  id?: string;
  title: string;
  content: string;
  updated: any;
  created: any;
  lastAccess: any;
  $saved?: boolean;
}

export interface IConfig {
  lastId: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  notesCol = this.af.collection<INote>('notes');
  configDoc = this.af.doc<IConfig>('notes/0');
  notes$ = this.notesCol.valueChanges();

  constructor(private af: AngularFirestore) {
    this.loadNotes();
  }

  loadNotes() {
    this.notes$ = this.notesCol.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as INote;
        return { id: a.payload.doc.id, ...data };
      }).filter(n => n.id !== '0'))
    );
  }

  formatDate(fDate: { seconds: number, nanoseconds: number }): string {
    const dp = (new Date(fDate.seconds * 1000) + '').split(' ');
    return `${dp[2]} ${dp[1]} ${dp[3]} - ${dp[4]}`;
  }

  getNote(id: string) {
    return this.notes$.pipe(map(notes => notes.find(n => n.id === id)));
  }

}
