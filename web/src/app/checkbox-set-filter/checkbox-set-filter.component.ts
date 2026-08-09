import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';

@Component({
  selector: 'app-checkbox-set-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkbox-set-filter.component.html',
  styleUrls: ['./checkbox-set-filter.component.sass']
})
export class CheckboxSetFilterComponent implements IFilterAngularComp {

  private params!: IFilterParams;
  values: string[] = [];
  selected = new Set<string>();
  search = '';

  agInit(params: IFilterParams): void {
    this.params = params;
    this.refreshValues();
    this.selected = new Set(this.values);
  }

  private refreshValues(): void {
    const set = new Set<string>();
    this.params.api.forEachNode(node => {
      if (!node.data) return;
      const val = this.params.getValue(node);
      set.add(this.formatValue(val));
    });
    this.values = Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private formatValue(val: any): string {
    if (typeof val === 'boolean') return val ? 'Actif' : 'Inactif';
    if (val == null || val === '') return '(vide)';
    return String(val);
  }

  get filteredValues(): string[] {
    if (!this.search.trim()) return this.values;
    const q = this.search.toLowerCase();
    return this.values.filter(v => v.toLowerCase().includes(q));
  }

  toggle(value: string): void {
    if (this.selected.has(value)) {
      this.selected.delete(value);
    } else {
      this.selected.add(value);
    }
    this.params.filterChangedCallback();
  }

  isChecked(value: string): boolean {
    return this.selected.has(value);
  }

  selectAll(): void {
    this.values.forEach(v => this.selected.add(v));
    this.params.filterChangedCallback();
  }

  clearAll(): void {
    this.selected.clear();
    this.params.filterChangedCallback();
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    const val = this.formatValue(this.params.getValue(params.node));
    return this.selected.has(val);
  }

  isFilterActive(): boolean {
    return this.selected.size !== this.values.length;
  }

  getModel(): any {
    if (!this.isFilterActive()) return null;
    return { values: Array.from(this.selected) };
  }

  setModel(model: any): void {
    if (model) {
      this.selected = new Set(model.values);
    } else {
      this.refreshValues();
      this.selected = new Set(this.values);
    }
  }
}