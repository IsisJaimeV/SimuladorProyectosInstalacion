import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  user: any;
  constructor() { }

  ngOnInit(): void {
    var userStorage = localStorage.getItem("user");
    this.user = userStorage;
  }

}
