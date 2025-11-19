import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { MainHeaderComponent } from './shared/organisms/main-header/main-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, MainHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  constructor(private router: Router) {}

  isAuthRoute(): boolean {
    const url = this.router.url;
    return url.startsWith('/auth') || url.startsWith('/register');
  }
}
