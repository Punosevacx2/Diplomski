import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MilvusService } from '../../../services/services';

type Mode = 'semantic' | 'fulltext' | 'hybrid';

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
  activeMode: Mode | null = null;

  // 🔧 Bitno: ovo fali u tvojoj klasi
  query = '';

  constructor(private milvusService: MilvusService, private router: Router) {}

  openRecipeDetail(recipe: any): void {
    if (recipe?.id) {
      this.router.navigate(['/recipe', recipe.id]); // prilagodi rutu po potrebi
    }
  }

  onEnter(): void {
    this.run(this.activeMode || 'semantic');
  }

  run(mode: Mode): void {
    const text = (this.query || '').trim();
    if (!text) {
      this.error = 'Unesite tekst za pretragu.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.results = [];
    this.activeMode = mode;

    // 🔧 Sada šaljemo string, jer servis očekuje string
    const body = {"text": text};
    const req$ =
      mode === 'semantic'
        ? this.milvusService.searchSemantic(body)
        : mode === 'fulltext'
        ? this.milvusService.searchFulltext(body)
        : this.milvusService.searchHybrid(body);

    req$.subscribe({
      next: (res: any) => {
        this.results = res?.results ?? res?.data ?? res ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Došlo je do greške prilikom pretrage.';
        this.loading = false;
      }
    });
  }

  // Lep prikaz % i kad score nije u [0,1]
  scorePct(r: any): number {
    const s = Number(r?.score ?? 0);
    if (Number.isNaN(s)) return 0;
    return s <= 1 ? s * 100 : Math.min(100, (s / (s + 10)) * 100);
  }
}
