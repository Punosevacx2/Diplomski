import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilvusService } from '../../../services/services';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  query = '';
  results: any[] = [];
  loading = false;
  error: string | null = null;
  collectionName = 'Proba1'; 

  constructor(private milvusService: MilvusService, private router: Router) {}

  onSemanticSearch(): void {
    if (!this.query.trim()) return;
    console.log(this.query);
    this.loading = true;
    this.error = null;
    this.results = [];
    const data1 = {
  text: this.query,
  topK:  5,
  collectionName: this.collectionName,
  metricType: "COSINE",
  indexParams:   { nprobe: 128 }
};
console.log(data1);
    this.milvusService.searchVectors(data1).subscribe({
      next: (res) => {
        this.results = res.results || res.data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Greška u semantičkoj pretrazi:', err);
        this.error = 'Greška pri semantičkoj pretrazi.';
        this.loading = false;
      }
    });
  }

  onHybridSearch(): void {
    if (!this.query.trim()) return;

    this.loading = true;
    this.error = null;
    this.results = [];

    this.milvusService.searchVectorsHybrid({
      text: this.query,
      collectionName: this.collectionName,
      filter: 'id > 0'
    }).subscribe({
      next: (res) => {
        this.results = res.results || res.data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Greška u hibridnoj pretrazi:', err);
        this.error = 'Greška pri hibridnoj pretrazi.';
        this.loading = false;
      }
    });
  }

  openRecipeDetail(recipe: any): void {
    console.log(recipe.id);
    if (recipe.id) {
      this.router.navigate(['/recipe/', recipe.id]);
    }
  }
}
