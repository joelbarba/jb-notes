import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { DataService, INote } from '../services/data.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, tap, debounceTime, Observable, Subject } from 'rxjs';

type TCheckItem = {
  checked: boolean;
  text: string;
}

@Component({
  selector: 'app-view-note',
  templateUrl: './view-note.page.html',
  styleUrls: ['./view-note.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewNotePage implements OnInit {
  private platform = inject(Platform);
  private clickSub: any;
  private noteSub: any;
  private noteDoc: any;
  
  note!: INote;
  noteChange$ = new Subject();
  note$!: Observable<INote>;
  created$!: Observable<string>;
  updated$!: Observable<string>;

  moreInfo = false; // whether the accordion with more info is expanded (true) or collapsed (false)
  listBtn = false;
  listSize: 'small' | 'mid' | 'large' = 'small';
  
  checkList: TCheckItem[] = [];

  isAlertOpen = false;
  alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => { console.log('Alert canceled'); },
    },
    {
      text: 'Yes',
      role: 'confirm',
      handler: () => { this.deleteNote(); },
    },
  ];


  constructor(
    public data: DataService, 
    private route: ActivatedRoute,
    private router: Router,
    private af: AngularFirestore,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') as string;
    console.log('Loading NOTE: ', id);

    this.noteDoc = this.af.doc<INote>('notes/' + id);
    this.note$ = this.noteDoc.valueChanges();
    this.created$ = this.note$.pipe(map((n: INote) => n?.created || 0));
    this.updated$ = this.note$.pipe(map((n: INote) => n?.updated || 0));

    this.noteSub = this.note$.subscribe((n: INote) => {
      // console.log(new Date(), 'note has been updated', n);
      if (!n) { return this.goBack(); }
      if (!this.note) { // Fist time we load the note on the page
        this.note = n;
        this.note.id = id;
        this.note.$saved = 'yes';        
        this.data.configDoc.update({ lastId: this.note.id }); // Mark this note as the last visited
        if (!this.note.mode) { this.note.mode = 'text'; }
        this.listBtn = (this.note.content[0] === '-' || this.note.content.indexOf(`\n-`) >= 0);
        if (this.note.mode === 'list') { this.turnTextToCheckList(); }

      } else { // Updating note's content while on the page
        if (this.note.$saved === 'yes') { this.note = { ...this.note, ...n }; }
      }
    });

    // Auto update the note when changing the content/title
    this.clickSub = this.noteChange$.pipe(
      tap(_ => this.note.$saved = 'saving'),
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

  goBack() {
    this.router.navigate(['/home']);
  }

  changeMode(checked: boolean) {
    // console.log('changeMode', $event.detail.checked);
    const prevContent = this.note.content;
    if (this.note.mode === 'text' && checked) {
      this.turnTextToCheckList();
      this.note.content = this.formatListToText();
      this.note.mode = 'list';
      // this.note.$saved = this.note.$saved === 'yes' ? 'no' : 'yes';
      
    } else if (this.note.mode === 'list' && !checked)  {
      this.note.content = this.formatListToText();
      this.note.mode = 'text';
      // this.note.$saved = this.note.$saved === 'yes' ? 'no' : 'yes';
    }

    if (prevContent !== this.note.content) { this.noteChange$.next(this.note); }
  }

  turnTextToCheckList() {
    const lines = this.note.content.split(`\n`);
    this.checkList = [];
    let text = lines[0];

    for (let t = 1; t < lines.length; t++) {
      const line = lines[t];
      if (line[0] !== '-') {
        text += `\n` + line;

      } else {
        this.checkList.push(this.formatCheckLineText(text));
        text = line;
      }
    }
    this.checkList.push(this.formatCheckLineText(text));

    this.listSize = 'small';
    if (this.checkList.length > 20) { this.listSize = 'mid'; }
    if (this.checkList.length > 30) { this.listSize = 'large'; }
    console.log(this.checkList);
  }

  formatCheckLineText(text: string): TCheckItem {
    if (text[0] !== '-') { return { checked: false, text }; }
    let i = 1;
    if (text[i] === ' ') { i++; } // Ignore space after '- '
    if (text.slice(i, i + 4) === '[ ] ') { return { checked: false, text: text.slice(i + 4) }; }
    if (text.slice(i, i + 4) === '[X] ') { return { checked: true,  text: text.slice(i + 4) }; }
    if (text.slice(i, i + 4) === '[x] ') { return { checked: true,  text: text.slice(i + 4) }; }
    if (text.slice(i, i + 3) === '[ ]')  { return { checked: false, text: text.slice(i + 3) }; }
    if (text.slice(i, i + 3) === '[X]')  { return { checked: true,  text: text.slice(i + 3) }; }
    if (text.slice(i, i + 3) === '[x]')  { return { checked: true,  text: text.slice(i + 3) }; }
    if (text.slice(i, i + 3) === '[] ')  { return { checked: false, text: text.slice(i + 3) }; }
    if (text.slice(i, i + 2) === '[]')   { return { checked: false, text: text.slice(i + 2) }; }

    return { checked: false, text: text.slice(i) };
  }

  formatListToText() {
    return this.checkList.map(item => `-${item.checked ? ' [X]' : ''} ${item.text}`).join(`\n`);
  }

  checkItem(item: TCheckItem, checked: boolean) {
    item.checked = checked;
    console.log(this.checkList);
    this.formatListToText();
    console.log(this.note.content);
    this.noteChange$.next(this.note);
  }


  delAlert(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }

  deleteNote() {
    this.noteDoc.delete().then(() => this.goBack());    
  }

  updateOrder($event: any) {
    let value = Number.parseInt($event.detail.value);
    this.note.order = value || 0;
    this.noteChange$.next(this.note);
  }

  updateContent($event: any) {
    // console.log($event);
    let value = $event.detail.value || '';
    if (value.length > this.note.content.length) {
      let charAt = value.length - 1; // index where the new char is inserted
      let charAt2 = this.note.content.length - 1;
      while (charAt >= 0 && value[charAt] === this.note.content[charAt2]) { charAt--; charAt2--; }

      // console.log(`NEW CHAR at value[${charAt}]= ${value[charAt]}`);
      if (value[charAt] === `\n`) {
        const line = value.slice(0, charAt).split(`\n`).at(-1);
        if (line[0] === '-') {
          value = value.slice(0, charAt + 1) + '- ' + value.slice(charAt + 1, -1);
        }
      }
    }

    this.listBtn = (value[0] === '-' || value.indexOf(`\n-`) >= 0);

    this.note.content = value;
    this.noteChange$.next(this.note);
  }

  saveNote() {
    // console.log(new Date(), 'saving note', this.note);
    if (this.note) {
      const updatedNote = {
        title  : this.note.title,
        order  : this.note.order,
        mode   : this.note.mode,
        content: this.note.content,
        updated: this.data.getCurrentTime(),
      };
      this.noteDoc.update(updatedNote);
      this.note.$saved = 'yes';
    }
  }
}
