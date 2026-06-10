import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // key 0=white, 1-12 colors (Set C — Deep, extended)
  readonly colors = [
    '#FFFFFF',
    '#FF0000',
    '#FFFF00',
    '#0000FF',
    '#00FF00',
    '#058743',
    '#FF9800',
    '#95E1D3',
    '#ff48a5',
    '#634087',
    '#C785EC',
    '#bb6d3e',
    '#9F9F9F',
  ];

  cellValues: number[][];

  dragIndex: number | null = null;
  solved = false;

  constructor() {
    this.shuffleColors();
    this.cellValues = Array.from({ length: 9 }, () => [0, 0, 0, 0]);
    this.borders.forEach(([cA, tA, cB, tB], i) => {
      this.cellValues[cA][tA] = this.neibourValue[i];
      this.cellValues[cB][tB] = this.neibourValue[i];
    });
  }

  shuffleColors(): void {
    // shuffle colors[1..end], keep white at index 0
    for (let i = this.colors.length - 1; i > 1; i--) {
      const j = 1 + Math.floor(Math.random() * i);
      [this.colors[i], this.colors[j]] = [this.colors[j], this.colors[i]];
    }
  }

  onDragStart(event: DragEvent, index: number): void {
    this.dragIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', String(index));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDrop(index: number): void {
    if (this.dragIndex === null) return;
    if (this.dragIndex === index) {
      this.dragIndex = null;
      return;
    }
    const tmp = this.cellValues[this.dragIndex];
    this.cellValues[this.dragIndex] = this.cellValues[index];
    this.cellValues[index] = tmp;
    this.dragIndex = null;
    this.checkSolved();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onPointerDown(index: number, event: PointerEvent): void {
    event.preventDefault();
    if (this.dragIndex === null) {
      this.dragIndex = index;
      return;
    }

    if (this.dragIndex === index) {
      this.dragIndex = null;
      return;
    }

    this.onDrop(index);
  }

  onPointerCancel(): void {
    this.dragIndex = null;
  }

  onTriangleClick(cellIndex: number, key: number): void {
    return;
    const v = this.cellValues[cellIndex];
    // rotate 90° clockwise: left→top, top→right, right→bottom, bottom→left
    this.cellValues[cellIndex] = [v[3], v[0], v[1], v[2]];
    this.checkSolved();
  }

  // one value per shared border (coupled neighbour triangle pair), 1–12 (never 0)
  neibourValue: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // 12 shared borders: [cellA, triA, cellB, triB]
  // tri indices: 0=top,1=right,2=bottom,3=left
  private borders = [
    [0, 1, 1, 3], [1, 1, 2, 3],
    [3, 1, 4, 3], [4, 1, 5, 3],
    [6, 1, 7, 3], [7, 1, 8, 3],
    [0, 2, 3, 0], [1, 2, 4, 0],
    [2, 2, 5, 0], [3, 2, 6, 0],
    [4, 2, 7, 0], [5, 2, 8, 0],
  ];

  shuffleA(): void {
    // shuffle neibourValue, then rebuild cellValues
    for (let i = this.neibourValue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.neibourValue[i], this.neibourValue[j]] = [this.neibourValue[j], this.neibourValue[i]];
    }
    this.cellValues = Array.from({ length: 9 }, () => [0, 0, 0, 0]);
    this.borders.forEach(([cA, tA, cB, tB], i) => {
      this.cellValues[cA][tA] = this.neibourValue[i];
      this.cellValues[cB][tB] = this.neibourValue[i];
    });
    this.solved = false;
  }

  shuffle(): void {
    // shuffle the 9 cell tiles
    for (let i = this.cellValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cellValues[i], this.cellValues[j]] = [this.cellValues[j], this.cellValues[i]];
    }
    this.solved = false;
  }

  rotateAll(): void {
    // rotate every cell 90° clockwise
    this.cellValues = this.cellValues.map(v => [v[3], v[0], v[1], v[2]]);
    this.checkSolved();
  }

  border = false;
  private borderSnapshot: number[][] | null = null;

  private randomColorKey(): number {
    return 1 + Math.floor(Math.random() * (this.colors.length - 1));
  }

  setBorder(): void {
    if (!this.border) {
      this.borderSnapshot = this.cellValues.map(cell => [...cell]);
      this.cellValues = this.cellValues.map(cell =>
        cell.map(value => (value === 0 ? this.randomColorKey() : value))
      );
    } else if (this.borderSnapshot) {
      this.cellValues = this.borderSnapshot.map(cell => [...cell]);
      this.borderSnapshot = null;
    }

    this.border = !this.border;
  }

  checkSolved(): void {
    this.solved = this.borders.every(([cA, tA, cB, tB]) =>
      this.cellValues[cA][tA] === this.cellValues[cB][tB]
    );
  }
}
