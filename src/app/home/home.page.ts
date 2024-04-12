import { Component, inject } from '@angular/core';
import { MenuController, RefresherCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { DataService, INote, INotebook } from '../services/data.service';
import { take, map, combineLatest } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  list$ = combineLatest([this.data.notes$, this.data.selNotebookId$])
    .pipe(map(([notes, notebookId]) => {
      return notes.filter(note => (note.notebookId === notebookId) || !notebookId);
  }));

  private platform = inject(Platform);
  constructor(
    public data: DataService, private router: Router,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {}

  formatDate(seconds: number) {
    return new Date(seconds * 1000);
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }

  newNote() {
    this.data.notesCol.add({
      title: 'New Note',
      content: '',
      order: 0,
      mode: 'text',
      updated: this.data.getCurrentTime(),
      created: this.data.getCurrentTime(),
      notebookId: 'principal',
    }).then(docRef => {
      this.router.navigate(['/notes/' + docRef.id]);
    });
  }

  changeDarkMode() {
    const value = !this.data.config.darkMode;
    this.data.changeDarkMode(value);
    this.data.configDoc.update({ darkMode: value });
  }


  openMenu() {
    this.menuCtrl.open();
  }
  
  isIos() {
    return this.platform.is('ios')
  }
}
