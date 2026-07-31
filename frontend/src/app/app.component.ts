/**
 * app.component.ts
 * Root component that wraps the entire application.
 * Contains the router-outlet and initializes AOS animations.
 */

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `
    <!-- Global toast notifications -->
    <app-toast></app-toast>

    <!-- Sticky frosted glass navbar -->
    <app-navbar></app-navbar>

    <!-- Main content area with page transitions -->
    <main>
      <router-outlet></router-outlet>
    </main>

    <!-- Site footer -->
    <app-footer></app-footer>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 70px);
    }
  `]
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    // Initialize AOS (Animate On Scroll) library - loaded via CDN in index.html
    try {
      const AOS = (window as any)['AOS'];
      if (AOS) {
        AOS.init({
          duration: 700,
          easing: 'ease-in-out',
          once: true,
          offset: 50,
        });
      }
    } catch (e) {
      // AOS not available, animations won't run
    }
  }
}
