import { Routes } from '@angular/router';
import { HomeComponent } from './component/home.component/home.component';
import { SearchComponent } from './component/search.component/search.component';
import { RecipeDetailComponent } from './component/recipe-detail.component/recipe-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
];