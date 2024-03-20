import { Component, inject } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {


  // private data = inject(DataService);  
  private platform = inject(Platform);
  constructor(public data: DataService, private router: Router) {}

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
    }).then(docRef => {
      this.router.navigate(['/notes/' + docRef.id]);
    });
  }

  
  isIos() {
    return this.platform.is('ios')
  }
}
