import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilvusService } from '../../../services/services';
import { RouterModule,Router } from '@angular/router';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  loading = false;
  error: string | null = null;
  message: string | null = null;

  // Parametri za kreiranje indeksa
  createParams = {
    fieldName: '',
    indexName: '',
    collectionName: '',
    metricType: 'L2',  // default
    indexType: 'IVF_FLAT' // default
  };

  // Parametri za listanje indeksa
  listParams = {
    collectionName: '',
    fieldName: ''
  };

  // Parametri za brisanje indeksa
  dropParams = {
    collectionName: '',
    indexName: ''
  };

  indexes: any[] = [];

  constructor(private milvusService: MilvusService,private router: Router) {}

  ngOnInit(): void {}

  // 1️⃣ Kreiranje indeksa
  onCreateIndex(): void {
    this.loading = true;
    this.error = null;
    this.message = null;

    this.milvusService.createIndex(this.createParams).subscribe({
      next: (res) => {
        this.message = '✅ Index kreiran!';
        this.loading = false;
      },
      error: (err) => {
        this.error = '❌ Greška pri kreiranju indeksa';
        console.error(err);
        this.loading = false;
      }
    });
  }

  // 2️⃣ Lista indeksa
  onListIndexes(): void {
    this.loading = true;
    this.error = null;
    this.indexes = [];

    this.milvusService.listIndexes(this.listParams).subscribe({
      next: (res) => {
        console.log(res.index.index_descriptions[0].index_name);
        this.indexes = res.index.index_descriptions[0].index_name || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = '❌ Greška pri dohvatanju liste indeksa';
        console.error(err);
        this.loading = false;
      }
    });
  }

  // 3️⃣ Brisanje indeksa
  onDropIndex(): void {
    this.loading = true;
    this.error = null;
    this.message = null;

    this.milvusService.dropIndex(this.dropParams).subscribe({
      next: (res) => {
        this.message = '✅ Index obrisan!';
        this.loading = false;
        // opcionalno: refresh liste indeksa
        this.onListIndexes();
      },
      error: (err) => {
        this.error = '❌ Greška pri brisanju indeksa';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
