import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_URL } from './app.config';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AppComponent {
  message: string = '';
  desiredRole: string = '';
  reviewerRole: string = 'Hiring manager of a medium-sized company';
  textType: string = 'Cover letter';
  inputText: string = '';
  customInstructions: string = '';
  feedback: any = null;
  starRating: number | null = null;
  isLoading: boolean = false;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

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

  onSubmit() {
    this.isLoading = true;
    const formData = {
      wantedRole: this.desiredRole,
      reviewerRole: this.reviewerRole,
      textType: this.textType,
      inputText: this.inputText,
      customInstructions: this.customInstructions
    };

    this.http.post<any>(`${BACKEND_URL}/api/text-review`, formData).subscribe({
      next: (data) => {
        this.starRating = data.starRating;
        this.feedback = this.sanitizer.bypassSecurityTrustHtml(data.feedback);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error submitting feedback request:', error);
        this.feedback = 'Error fetching feedback.';
        this.isLoading = false;
      }
    });
  }
}
