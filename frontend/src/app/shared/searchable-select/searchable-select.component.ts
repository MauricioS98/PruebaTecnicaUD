import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface SearchableSelectOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  templateUrl: './searchable-select.component.html',
  styleUrl: './searchable-select.component.scss',
})
export class SearchableSelectComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly options = input.required<SearchableSelectOption[]>();
  readonly value = input<number | null>(null);
  readonly placeholder = input('Seleccionar...');
  readonly allowClear = input(false);
  readonly clearLabel = input('Sin selección');

  readonly valueChange = output<number | null>();

  readonly open = signal(false);
  readonly query = signal('');

  readonly filteredOptions = computed(() => {
    const term = this.query().trim().toLowerCase();
    const list = this.options();
    if (!term) return list;
    return list.filter((option) => option.label.toLowerCase().includes(term));
  });

  readonly displayText = computed(() => {
    if (this.open()) return this.query();
    return this.labelFor(this.value());
  });

  onFocus(): void {
    this.open.set(true);
    this.query.set(this.labelFor(this.value()));
  }

  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.query.set(next);
    this.open.set(true);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  select(value: number | null): void {
    this.valueChange.emit(value);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  private close(): void {
    this.open.set(false);
    this.query.set('');
  }

  private labelFor(value: number | null | undefined): string {
    if (value == null || value === 0) return '';
    return this.options().find((option) => option.value === value)?.label ?? '';
  }
}
