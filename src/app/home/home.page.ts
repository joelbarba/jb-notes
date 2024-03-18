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

  ngOnInit() {
    this.data.configDoc.valueChanges().pipe(take(1)).subscribe(config => {
      console.log('THE CONFIG IS', config);
      if (config && config?.lastId !== '0') {
        this.router.navigate(['/notes/' + config.lastId]);
      }
    });
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }

  
  isIos() {
    return this.platform.is('ios')
  }
}
