import { Component } from '@angular/core';

@Component({
  selector: 'app-works',
  standalone: true,
  template: `
    <div class="page">
      <h2 class="oa-font-display">Obras</h2>
      <p class="oa-text-secondary">CRUD de obras, compositores y géneros — próximamente.</p>
    </div>
  `,
  styles: `.page h2 { font-size: 2rem; margin-bottom: 0.5rem; }`,
})
export class WorksComponent {}

@Component({
  selector: 'app-interpretations',
  standalone: true,
  template: `
    <div class="page">
      <h2 class="oa-font-display">Interpretaciones</h2>
      <p class="oa-text-secondary">Gestión reciente / histórica con validación de artistas — próximamente.</p>
    </div>
  `,
  styles: `.page h2 { font-size: 2rem; margin-bottom: 0.5rem; }`,
})
export class InterpretationsComponent {}

@Component({
  selector: 'app-artists',
  standalone: true,
  template: `
    <div class="page">
      <h2 class="oa-font-display">Artistas</h2>
      <p class="oa-text-secondary">Listado y edición de intérpretes — próximamente.</p>
    </div>
  `,
  styles: `.page h2 { font-size: 2rem; margin-bottom: 0.5rem; }`,
})
export class ArtistsComponent {}

@Component({
  selector: 'app-directors',
  standalone: true,
  template: `
    <div class="page">
      <h2 class="oa-font-display">Directores</h2>
      <p class="oa-text-secondary">Listado y edición de directores — próximamente.</p>
    </div>
  `,
  styles: `.page h2 { font-size: 2rem; margin-bottom: 0.5rem; }`,
})
export class DirectorsComponent {}
