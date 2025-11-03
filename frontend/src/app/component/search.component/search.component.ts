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
  loading = false;
  error: string | null = null;
  results: any[] = [];

  // Parametri koje korisnik može menjati
  params = {
    text: '',
    topK: 5,
    collectionName: 'Proba1',
    metricType: 'COSINE'
  };

  indexParamsInput = '{"nprobe": 128}'; // korisnik može uneti svoj JSON string

  constructor(private milvusService: MilvusService,private router: Router) {}

openRecipeDetail(recipe: any): void {
  if (recipe.id) {
    // navigacija ka ruti koja prikazuje recipes-component
    this.router.navigate(['/recipe', recipe.id]);
  }
}


  onSearch(): void {
    if (!this.params.text.trim()) {
      this.error = 'Unesite tekst za pretragu.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.results = [];

    let parsedIndexParams: any = {};
    try {
      parsedIndexParams = JSON.parse(this.indexParamsInput);
    } catch (e) {
      this.error = 'Neispravan JSON u Index Params polju.';
      this.loading = false;
      return;
    }

    const body = {
      ...this.params,
      indexParams: parsedIndexParams
    };

    console.log('📤 Šaljem na backend:', body);

    this.milvusService.searchVectors(body).subscribe({
      next: (res) => {
        console.log('📥 Odgovor sa backenda:', res);
        this.results = res.results || res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Greška:', err);
        this.error = 'Došlo je do greške prilikom pretrage.';
        this.loading = false;
      }
    });
  }
}