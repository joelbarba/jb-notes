import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { DataService, INotebook } from './services/data.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  appPages = [
    { title: 'All Notes', url: '/', icon: 'home' },
  ];

  constructor(
    public auth: AuthService,
    public data: DataService,
    private menuCtrl: MenuController
    ) {}


  selectNotebook(notebook?: INotebook) {
    this.data.selectNotebook(notebook?.id || '');
    this.menuCtrl.close();
  }


}
