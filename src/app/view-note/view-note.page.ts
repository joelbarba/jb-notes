import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { DataService, INote } from '../services/data.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, tap, debounceTime, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-view-note',
  templateUrl: './view-note.page.html',
  styleUrls: ['./view-note.page.scss'],
})
export class ViewNotePage implements OnInit {
  public note!: INote;
  private platform = inject(Platform);
  private clickSub: any;
  private noteSub: any;
  private noteDoc: any;

  public noteChange$ = new Subject();
  public note$!: Observable<INote>;
  public created$!: Observable<string>;
  public updated$!: Observable<string>;


  constructor(
    public data: DataService, 
    private route: ActivatedRoute,
    private af: AngularFirestore,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') as string;
    console.log('Loading NOTE: ', id);

    this.noteDoc = this.af.doc<INote>('notes/' + id);
    this.note$ = this.noteDoc.valueChanges();
    this.created$ = this.note$.pipe(map((n: INote) => this.data.formatDate(n.created)));
    this.updated$ = this.note$.pipe(map((n: INote) => this.data.formatDate(n.updated)));

    this.noteSub = this.note$.subscribe((n: INote) => {
      console.log(new Date(), 'note has been updated', n);
      if (!this.note) { // Fist time we load the note on the page
        this.note = n;
        this.note.id = id;
        this.note.$saved = true;
        this.data.configDoc.update({ lastId: this.note.id }); // Mark this note as the last visited

      } else { // Updating note's content while on the page
        if (this.note.$saved) { this.note = { ...this.note, ...n }; }
      }
    });

    // Auto update the note when changing the content/title
    this.clickSub = this.noteChange$.pipe(
      tap(_ => this.note.$saved = false),
      debounceTime(1500),
    ).subscribe(c => this.saveNote());
  }

  ngOnDestroy() {
    this.noteSub.unsubscribe();
    this.clickSub.unsubscribe();
    this.data.configDoc.update({ lastId: '0' }); // unmark as last visited
  }

  getBackButtonText() {
    const isIos = this.platform.is('ios')
    return isIos ? 'Inbox' : '';

  }

  currentTime() {
    return { seconds: Math.round((new Date()).getTime() / 1000), nanoseconds: 0, };
  }

  updateContent(value: string) {
    // const currLast = value.charCodeAt(value.length - 1);
    // console.log(currLast);
    // if (currLast === 10) { // if line break
    //   const prevLast = this.note.content.charCodeAt(this.note.content.length - 1);
    //   if (prevLast !== 10) {
    //     console.log('SALTAAAAAA');
    //   }
    // }
    // if (prevLast !== `\n` && currLast === '\n') {
    //   const prevLast = this.note.content.charAt(-1);
    //   console.log('SALTAAAAAA');
    // } else {
    // }
    this.note.content = value;
    this.noteChange$.next(this.note);
  }

  saveNote() {
    console.log(new Date(), 'saving note', this.note);
    if (this.note) {
      const updatedNote = {
        title: this.note.title,
        content: this.note.content,
        updated: this.currentTime(),
      };
      this.noteDoc.update(updatedNote);
      this.note.$saved = true;
    }
  }
}
