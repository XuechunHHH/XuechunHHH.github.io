import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'search';
  links = [
    { title: 'Search', fragment: 'search' },
    { title: 'Favorites', fragment: 'favorites' }
  ];

  constructor(public route: ActivatedRoute) {}
}
