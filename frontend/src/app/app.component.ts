import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL } from './app.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements OnInit {
  message: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchMessage();
  }

  fetchMessage() {
    this.http.get<{ message: string }>(`${BACKEND_URL}/api/hello`).subscribe({
      next: (data) => {
        this.message = data.message;
      },
      error: (error) => {
        console.error('Error fetching message:', error);
        this.message = 'Error fetching message.';
      }
    });
  }
}
