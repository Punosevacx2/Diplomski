import { Routes } from '@angular/router';
import { RecipeListComponent } from './components/recipe-list/recipe-list';
import { RecipeDetail } from './components/recipe-detail/recipe-detail';
import { RecipeForm } from './components/recipe-form/recipe-form';

export const routes: Routes = [
  { path: '', component: RecipeListComponent },
  { path: 'recipes/:id', component: RecipeDetail },
  { path: 'create', component: RecipeForm },
];

