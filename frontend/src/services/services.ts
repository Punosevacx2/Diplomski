import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MilvusService {

  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // 🏗️ 1. Kreiraj kolekciju
  createCollection(name: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/createCollection`, { name });
  }

  // 📥 2. Ubaci vektor
  insertVector(data: { id: number; title: string; description: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/insertVector`, data);
  }

  // 🔍 3. Semantička pretraga
  searchVectors(body: {
    text: string;
    topK?: number;
    collectionName: string;
    metricType?: string;
    indexParams?: any;
  }): Observable<any> {
    console.log(body);
    return this.http.post(`${this.baseUrl}/search`, body);
  }

  // ⚡ 4. Hibridna pretraga
  searchVectorsHybrid(body: {
    text: string;
    topK?: number;
    collectionName: string;
    metricType?: string;
    indexParams?: any;
    filter?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/searchVectorsHybrid`, body);
  }

  // 🧮 5. Query filter
  queryFilter(body: { collectionName: string; filter?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/queryFilter`, body);
  }

  // 🗑️ 6. Brisanje vektora po ID-u
  deleteVector(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteVector/${id}`);
  }

  // 🧱 7. Kreiraj indeks
  createIndex(body: {
    fieldName: string;
    indexName: string;
    collectionName: string;
    metricType?: string;
    indexType?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/createIndex`, body);
  }

  // 📋 8. Lista indeksa
  listIndexes(body: { collectionName: string; fieldName: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/listIndexes`, body);
  }

  // 🗑️ 9. Brisanje indeksa
  dropIndex(body: { collectionName: string; indexName: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/dropIndex`, body);
  }

  // 📚 10. Lista kolekcija
  listCollections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/listCollections`);
  }

  // 🔍 11. Detalji kolekcije
  describeCollection(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/describeCollection/${name}`);
  }

  // 🗑️ 12. Brisanje kolekcije
  dropCollection(name: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/dropCollection/${name}`);
  }
}
