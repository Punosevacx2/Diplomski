import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MilvusService } from '../../../services/services';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {
  recipe: any = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private milvusService: MilvusService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchRecipe(id);
    }
  }

  fetchRecipe(id: string): void {
    this.loading = true;
    this.milvusService.describeCollection(id).subscribe({
      next: (res) => {
        this.recipe = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Greška pri dohvatanju recepta:', err);
        this.error = 'Nije moguće učitati detalje recepta.';
        this.loading = false;
      }
    });
  }
}
