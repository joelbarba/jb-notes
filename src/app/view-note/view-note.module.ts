import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewNotePage } from './view-note.page';

import { IonicModule } from '@ionic/angular';

import { ViewNotePageRoutingModule } from './view-note-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewNotePageRoutingModule
  ],
  declarations: [ViewNotePage]
})
export class ViewNotePageModule {}
