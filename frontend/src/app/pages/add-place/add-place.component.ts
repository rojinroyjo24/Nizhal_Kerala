import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { PlaceService } from '../../services/place.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-place',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="add-page">
      <div class="add-container">
        <nav class="breadcrumb"><a routerLink="/">Home</a> <span>›</span> <a routerLink="/explore">Explore</a> <span>›</span> <span>Add Place</span></nav>
        <div class="form-card">
          <div class="form-hdr">
            <h1>📍 Share a Hidden Gem</h1>
            <p>Help fellow explorers discover Kerala's secrets</p>
          </div>
          <div class="pending-info-box">
            <span class="pi-icon">🛡️</span>
            <div>
              <strong>Admin Verification Required</strong>
              <p>Your submission will be reviewed by our admin team before appearing publicly. You can track the status in your Profile page.</p>
            </div>
          </div>
          <form #placeForm="ngForm" (ngSubmit)="onSubmit(placeForm)" novalidate>
            <div class="field-group">
              <label>Place Title *</label>
              <input type="text" name="title" [(ngModel)]="fd.title" required minlength="3" placeholder="e.g. Hidden Waterfall at Athirappilly" #titleCtrl="ngModel" [class.err]="titleCtrl.invalid && titleCtrl.touched">
              @if (titleCtrl.invalid && titleCtrl.touched) { <span class="err-msg">Title is required (min 3 chars).</span> }
            </div>
            <div class="two-col">
              <div class="field-group">
                <label>District *</label>
                <select name="district" [(ngModel)]="fd.district" required #distCtrl="ngModel" [class.err]="distCtrl.invalid && distCtrl.touched">
                  <option value="">📍 Select District</option>
                  @for (d of districts; track d) { <option [value]="d">{{ d }}</option> }
                </select>
                @if (distCtrl.invalid && distCtrl.touched) { <span class="err-msg">Please select a district.</span> }
              </div>
              <div class="field-group">
                <label>Difficulty Level *</label>
                <div class="diff-toggle">
                  @for (diff of difficulties; track diff.value) {
                    <button type="button" [class]="'diff-btn ' + diff.value.toLowerCase()" [class.active]="fd.difficulty === diff.value" (click)="fd.difficulty = diff.value">{{ diff.label }}</button>
                  }
                </div>
              </div>
            </div>
            <div class="field-group">
              <label>Category *</label>
              <div class="cat-grid">
                @for (cat of categories; track cat.name) {
                  <div class="cat-opt" [class.active]="fd.category === cat.name" (click)="fd.category = cat.name">
                    <span class="cat-em">{{ cat.icon }}</span><span>{{ cat.name }}</span>
                  </div>
                }
              </div>
              @if (!fd.category && submitted) { <span class="err-msg">Please select a category.</span> }
            </div>
            <div class="field-group">
              <label>Description *</label>
              <textarea name="description" [(ngModel)]="fd.description" required rows="5" placeholder="Describe this place — what makes it special? How to get there? Best time to visit?" #descCtrl="ngModel" [class.err]="descCtrl.invalid && descCtrl.touched"></textarea>
              <div class="char-count">{{ fd.description.length }} characters</div>
              @if (descCtrl.invalid && descCtrl.touched) { <span class="err-msg">Description is required.</span> }
            </div>
            <div class="field-group">
              <label>Best Season to Visit <span class="opt">(optional)</span></label>
              <div class="season-grid">
                @for (s of seasons; track s.value) {
                  <div class="season-opt" [class.active]="fd.best_season === s.value" (click)="fd.best_season = fd.best_season === s.value ? '' : s.value">
                    <span class="season-em">{{ s.icon }}</span><span>{{ s.label }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="field-group">
              <label>Google Maps Link <span class="opt">(optional)</span></label>
              <div class="icon-input"><i class="fas fa-map-marked-alt"></i><input type="url" name="google_maps_link" [(ngModel)]="fd.google_maps_link" placeholder="https://maps.google.com/..."></div>
            </div>
            <div class="field-group">
              <label>Cover Image <span class="opt">(optional)</span></label>
              <div class="upload-zone" [class.has-img]="imagePreview" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
                @if (imagePreview) {
                  <img [src]="imagePreview" alt="Preview" class="img-preview">
                  <button type="button" class="remove-img" (click)="removeImage($event)"><i class="fas fa-times"></i></button>
                } @else {
                  <div class="upload-ph"><span style="font-size:2.5rem;display:block;margin-bottom:10px">📷</span><p>Click to upload or drag here</p><span style="font-size:0.75rem;color:#9ca3af">PNG, JPG, WebP up to 10MB</span></div>
                }
              </div>
              <input type="file" #fileInput accept="image/*" style="display:none" (change)="onFileSelected($event)">
            </div>

            <!-- Gallery Images -->
            <div class="field-group">
              <label>Gallery Images <span class="opt">(optional, up to 5)</span></label>
              <p class="gallery-hint">Add more photos to showcase this place from different angles</p>
              <div class="gallery-grid">
                @for (slot of gallerySlots; track slot; let i = $index) {
                  <div class="gallery-slot" [class.filled]="slot.preview" (click)="galleryInput.click(); activeSlot = i">
                    @if (slot.preview) {
                      <img [src]="slot.preview" alt="Gallery image {{ i+1 }}" class="slot-img">
                      <button type="button" class="slot-remove" (click)="removeGalleryImage($event, i)"><i class="fas fa-times"></i></button>
                      <div class="slot-num">{{ i + 1 }}</div>
                    } @else {
                      <div class="slot-empty">
                        <i class="fas fa-plus"></i>
                        <span>Photo {{ i + 1 }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
              <input type="file" #galleryInput accept="image/*" style="display:none" (change)="onGalleryFileSelected($event)">
              @if (galleryFiles.length > 0) {
                <div class="gallery-count">📸 {{ galleryFiles.length }} photo{{ galleryFiles.length > 1 ? 's' : '' }} selected</div>
              }
            </div>
            <button type="submit" class="submit-btn" [disabled]="isSubmitting">
              @if (isSubmitting) { <span><i class="fas fa-spinner fa-spin"></i> Submitting...</span> } @else { <span>Submit Hidden Gem 🌿</span> }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .add-page { min-height: 100vh; background: #f8f6f0; padding: 100px 0 80px; }
    .add-container { max-width: 720px; margin: 0 auto; padding: 0 24px; }
    .breadcrumb { font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: #9ca3af; margin-bottom: 24px; }
    .breadcrumb a { color: #9ca3af; text-decoration: none; } .breadcrumb a:hover { color: #1B4332; } .breadcrumb span { margin: 0 6px; }
    .form-card { background: white; border-radius: 20px; padding: 48px; box-shadow: 0 8px 40px rgba(27,67,50,0.1); }
    .form-hdr { margin-bottom: 36px; }
    .form-hdr h1 { font-family: 'Playfair Display',serif; font-size: 2rem; color: #1B4332; margin-bottom: 8px; }
    .form-hdr p { color: #6B7280; font-family: 'Poppins',sans-serif; font-size: 0.95rem; margin: 0; }
    .field-group { margin-bottom: 24px; }
    .field-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; font-family: 'Poppins',sans-serif; margin-bottom: 8px; }
    .field-group input, .field-group select, .field-group textarea { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 0.9rem; color: #374151; outline: none; transition: border-color 0.2s; }
    .field-group input:focus, .field-group select:focus, .field-group textarea:focus { border-color: #2D6A4F; box-shadow: 0 0 0 4px rgba(27,67,50,0.08); }
    .field-group input.err, .field-group select.err, .field-group textarea.err { border-color: #ef4444; }
    .field-group textarea { resize: vertical; }
    .opt { color: #9ca3af; font-weight: 400; font-size: 0.8rem; }
    .err-msg { display: block; color: #dc2626; font-size: 0.78rem; font-family: 'Poppins',sans-serif; margin-top: 4px; }
    .char-count { text-align: right; font-size: 0.75rem; color: #9ca3af; font-family: 'Poppins',sans-serif; margin-top: 4px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .diff-toggle { display: flex; gap: 8px; }
    .diff-btn { flex: 1; padding: 10px 8px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; font-family: 'Poppins',sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .diff-btn.easy.active { background: rgba(16,185,129,0.1); border-color: #10b981; color: #059669; }
    .diff-btn.moderate.active { background: rgba(245,158,11,0.1); border-color: #f59e0b; color: #d97706; }
    .diff-btn.hard.active { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #dc2626; }
    .diff-btn:hover:not(.active) { border-color: #9ca3af; background: #f9fafb; }
    .cat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
    .cat-opt { display: flex; flex-direction: column; align-items: center; padding: 16px 8px; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center; }
    .cat-opt.active { border-color: #1B4332; background: rgba(27,67,50,0.06); }
    .cat-opt.active span:last-child { color: #1B4332; font-weight: 700; }
    .cat-opt:hover:not(.active) { border-color: #9ca3af; background: #f9fafb; }
    .cat-em { font-size: 1.8rem; margin-bottom: 6px; display: block; }
    .cat-opt span:last-child { font-size: 0.75rem; color: #6B7280; font-family: 'Poppins',sans-serif; font-weight: 500; }
    .icon-input { position: relative; }
    .icon-input i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.9rem; }
    .icon-input input { padding-left: 40px; }
    .upload-zone { border: 2px dashed rgba(27,67,50,0.35); border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.25s; background: rgba(27,67,50,0.02); position: relative; min-height: 160px; display: flex; align-items: center; justify-content: center; }
    .upload-zone:hover { border-color: #1B4332; background: rgba(27,67,50,0.05); }
    .upload-zone.has-img { padding: 0; border-style: solid; border-color: #1B4332; }
    .upload-ph p { color: #6B7280; font-family: 'Poppins',sans-serif; font-size: 0.875rem; margin-bottom: 6px; }
    .img-preview { width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; display: block; }
    .remove-img { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.6); color: white; border: none; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .remove-img:hover { background: rgba(0,0,0,0.8); }
    .submit-btn { width: 100%; padding: 16px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border: none; border-radius: 12px; font-family: 'Poppins',sans-serif; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s; margin-top: 8px; }
    .submit-btn:hover:not([disabled]) { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(27,67,50,0.35); }
    .submit-btn[disabled] { opacity: 0.6; cursor: not-allowed; }
    .pending-info-box { display: flex; gap: 14px; align-items: flex-start; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.35); border-radius: 12px; padding: 16px 18px; margin-bottom: 28px; }
    .pi-icon { font-size: 1.5rem; flex-shrink: 0; margin-top: 2px; }
    .pending-info-box strong { display: block; font-family: 'Poppins',sans-serif; font-size: 0.875rem; font-weight: 700; color: #d97706; margin-bottom: 4px; }
    .pending-info-box p { font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: #6B7280; margin: 0; line-height: 1.5; }
    .season-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
    .season-opt { display: flex; flex-direction: column; align-items: center; padding: 16px 8px; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center; }
    .season-opt.active { border-color: #1B4332; background: rgba(27,67,50,0.06); }
    .season-opt:hover:not(.active) { border-color: #9ca3af; background: #f9fafb; }
    .season-em { font-size: 1.8rem; margin-bottom: 6px; display: block; }
    .season-opt span:last-child { font-size: 0.72rem; color: #6B7280; font-family: 'Poppins',sans-serif; font-weight: 500; }
    .season-opt.active span:last-child { color: #1B4332; font-weight: 700; }
    /* Gallery */
    .gallery-hint { font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: #9ca3af; margin: -4px 0 12px; }
    .gallery-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; }
    .gallery-slot { aspect-ratio: 1; border: 2px dashed #e5e7eb; border-radius: 10px; cursor: pointer; position: relative; overflow: hidden; transition: all 0.2s; background: #fafafa; }
    .gallery-slot:hover { border-color: #1B4332; background: rgba(27,67,50,0.03); }
    .gallery-slot.filled { border-style: solid; border-color: #1B4332; }
    .slot-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .slot-empty { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #d1d5db; }
    .slot-empty i { font-size: 1.2rem; }
    .slot-empty span { font-size: 0.65rem; font-family: 'Poppins',sans-serif; }
    .slot-remove { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,0.65); color: white; border: none; cursor: pointer; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; z-index: 2; }
    .slot-num { position: absolute; bottom: 4px; left: 6px; background: rgba(27,67,50,0.75); color: white; border-radius: 4px; font-size: 0.6rem; padding: 1px 5px; font-family: 'Poppins',sans-serif; font-weight: 700; }
    .gallery-count { margin-top: 8px; font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: #2D6A4F; font-weight: 600; }
    @media (max-width: 576px) { .form-card { padding: 24px; } .two-col { grid-template-columns: 1fr; } .cat-grid { grid-template-columns: repeat(2,1fr); } .season-grid { grid-template-columns: repeat(2,1fr); } .gallery-grid { grid-template-columns: repeat(3,1fr); } }
  `]
})
export class AddPlaceComponent {
  private placeService = inject(PlaceService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isSubmitting = false;
  submitted = false;
  imageFile: File | null = null;
  imagePreview: string | null = null;

  // Gallery images — up to 5 slots
  gallerySlots: { file: File | null; preview: string | null }[] = Array.from({ length: 5 }, () => ({ file: null, preview: null }));
  activeSlot = 0;
  get galleryFiles(): File[] { return this.gallerySlots.map(s => s.file).filter((f): f is File => f !== null); }

  fd = { title: '', description: '', district: '', category: '', difficulty: 'Easy', best_season: '', google_maps_link: '' };
  seasons = [{value:'Monsoon',label:'Monsoon',icon:'🌧️'},{value:'Winter',label:'Winter',icon:'❄️'},{value:'Summer',label:'Summer',icon:'☀️'},{value:'Year Round',label:'Year Round',icon:'📅'}];
  districts = ['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'];
  categories = [{name:'Waterfall',icon:'🌊'},{name:'Trekking',icon:'🥾'},{name:'Viewpoint',icon:'🏔️'},{name:'Beach',icon:'🏖️'},{name:'Village',icon:'🏘️'},{name:'Forest',icon:'🌲'},{name:'River',icon:'🏞️'},{name:'Heritage',icon:'🏛️'}];
  difficulties = [{value:'Easy',label:'🟢 Easy'},{value:'Moderate',label:'🟡 Moderate'},{value:'Hard',label:'🔴 Hard'}];

  onSubmit(form: NgForm) {
    this.submitted = true;
    if (form.invalid || !this.fd.category) return;
    this.isSubmitting = true;
    const data = new FormData();
    data.append('title', this.fd.title);
    data.append('description', this.fd.description);
    data.append('district', this.fd.district);
    data.append('category', this.fd.category);
    data.append('difficulty', this.fd.difficulty);
    if (this.fd.best_season) data.append('best_season', this.fd.best_season);
    if (this.fd.google_maps_link) data.append('google_maps_link', this.fd.google_maps_link);
    if (this.imageFile) data.append('image', this.imageFile);
    this.placeService.createPlace(data).subscribe({
      next: (p) => {
        this.uploadGalleryImages(p.id, () => {
          this.toastService.success('✅ Submitted! Awaiting admin approval before going public.');
          this.router.navigate(['/profile']);
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        const errors = err.error;
        if (typeof errors === 'object') { this.toastService.error(Object.values(errors).flat().join(' ')); }
        else { this.toastService.error('Failed to submit. Please try again.'); }
      }
    });
  }

  uploadGalleryImages(placeId: number, done: () => void) {
    const files = this.galleryFiles;
    if (files.length === 0) { done(); return; }
    let uploaded = 0;
    files.forEach((file, idx) => {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('order', idx.toString());
      this.placeService.uploadImage(placeId, fd).subscribe({
        next: () => { uploaded++; if (uploaded === files.length) done(); },
        error: () => { uploaded++; if (uploaded === files.length) done(); }
      });
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.setImageFile(input.files[0]);
  }

  onGalleryFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // Find the active slot or first empty slot
    const slot = this.gallerySlots[this.activeSlot];
    if (!slot) return;
    slot.file = file;
    const reader = new FileReader();
    reader.onload = (e) => { slot.preview = e.target?.result as string; };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeGalleryImage(event: Event, index: number) {
    event.stopPropagation();
    this.gallerySlots[index] = { file: null, preview: null };
  }

  onDragOver(event: DragEvent) { event.preventDefault(); (event.currentTarget as HTMLElement).classList.add('dragover'); }
  onDrop(event: DragEvent) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.setImageFile(file);
  }

  private setImageFile(file: File) {
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.imagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event) { event.stopPropagation(); this.imageFile = null; this.imagePreview = null; }
}
