import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { PlaceService } from '../../services/place.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Place } from '../../models/place.model';

@Component({
  selector: 'app-edit-place',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="edit-page">
      <div class="edit-container">
        <nav class="breadcrumb">
          <a routerLink="/">Home</a> <span>›</span>
          <a routerLink="/explore">Explore</a> <span>›</span>
          @if (place) { <a [routerLink]="['/place', place.id]">{{ place.title }}</a> <span>›</span> }
          <span>Edit</span>
        </nav>

        @if (isLoading) {
          <div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>
        } @else if (place) {
          <div class="form-card">
            <div class="form-hdr">
              <div class="hdr-left">
                <h1>✏️ Edit Place</h1>
                <p>Update the details for <strong>{{ place.title }}</strong></p>
              </div>
              <div class="status-badge-wrap">
                <span [class]="'current-status status-' + place.status">
                  {{ statusLabel(place.status || 'pending') }}
                </span>
                @if (isAdmin) {
                  <div class="admin-status-ctrl">
                    <label>Change Status</label>
                    <select [(ngModel)]="editStatus" name="editStatus">
                      <option value="pending">⏳ Pending</option>
                      <option value="approved">✅ Approved</option>
                      <option value="rejected">❌ Rejected</option>
                    </select>
                  </div>
                }
              </div>
            </div>

            <form #editForm="ngForm" (ngSubmit)="onSubmit(editForm)" novalidate>

              <!-- Title -->
              <div class="field-group">
                <label>Place Title *</label>
                <input type="text" name="title" [(ngModel)]="fd.title" required minlength="3"
                  placeholder="e.g. Hidden Waterfall at Athirappilly"
                  #titleCtrl="ngModel" [class.err]="titleCtrl.invalid && titleCtrl.touched">
                @if (titleCtrl.invalid && titleCtrl.touched) {
                  <span class="err-msg">Title is required (min 3 chars).</span>
                }
              </div>

              <!-- District + Difficulty -->
              <div class="two-col">
                <div class="field-group">
                  <label>District *</label>
                  <select name="district" [(ngModel)]="fd.district" required
                    #distCtrl="ngModel" [class.err]="distCtrl.invalid && distCtrl.touched">
                    <option value="">📍 Select District</option>
                    @for (d of districts; track d) { <option [value]="d">{{ d }}</option> }
                  </select>
                  @if (distCtrl.invalid && distCtrl.touched) {
                    <span class="err-msg">Please select a district.</span>
                  }
                </div>
                <div class="field-group">
                  <label>Difficulty Level *</label>
                  <div class="diff-toggle">
                    @for (diff of difficulties; track diff.value) {
                      <button type="button"
                        [class]="'diff-btn ' + diff.value.toLowerCase()"
                        [class.active]="fd.difficulty === diff.value"
                        (click)="fd.difficulty = diff.value">{{ diff.label }}</button>
                    }
                  </div>
                </div>
              </div>

              <!-- Category -->
              <div class="field-group">
                <label>Category *</label>
                <div class="cat-grid">
                  @for (cat of categories; track cat.name) {
                    <div class="cat-opt" [class.active]="fd.category === cat.name"
                      (click)="fd.category = cat.name">
                      <span class="cat-em">{{ cat.icon }}</span>
                      <span>{{ cat.name }}</span>
                    </div>
                  }
                </div>
                @if (!fd.category && submitted) {
                  <span class="err-msg">Please select a category.</span>
                }
              </div>

              <!-- Description -->
              <div class="field-group">
                <label>Description *</label>
                <textarea name="description" [(ngModel)]="fd.description" required rows="6"
                  placeholder="Describe this place..."
                  #descCtrl="ngModel" [class.err]="descCtrl.invalid && descCtrl.touched"></textarea>
                <div class="char-count">{{ fd.description.length }} characters</div>
                @if (descCtrl.invalid && descCtrl.touched) {
                  <span class="err-msg">Description is required.</span>
                }
              </div>

              <!-- Google Maps -->
              <div class="field-group">
                <label>Google Maps Link <span class="opt">(optional)</span></label>
                <div class="icon-input">
                  <i class="fas fa-map-marked-alt"></i>
                  <input type="url" name="google_maps_link" [(ngModel)]="fd.google_maps_link"
                    placeholder="https://maps.google.com/...">
                </div>
              </div>

              <div class="field-group">
                <label>Cover Image <span class="opt">(optional)</span></label>
                @if (currentImageUrl && !newImagePreview) {
                  <div class="current-image-wrap">
                    <img [src]="currentImageUrl" alt="Current image" class="current-img">
                    <div class="current-img-actions">
                      <span class="img-label">Current Image</span>
                      <button type="button" class="change-img-btn" (click)="fileInput.click()">
                        <i class="fas fa-camera"></i> Change Image
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="upload-zone" [class.has-img]="newImagePreview"
                    (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
                    @if (newImagePreview) {
                      <img [src]="newImagePreview" alt="Preview" class="img-preview">
                      <button type="button" class="remove-img" (click)="removeImage($event)">
                        <i class="fas fa-times"></i>
                      </button>
                    } @else {
                      <div class="upload-ph">
                        <span style="font-size:2.5rem;display:block;margin-bottom:10px">📷</span>
                        <p>Click to upload or drag image here</p>
                        <span style="font-size:0.75rem;color:#9ca3af">PNG, JPG, WebP up to 10MB</span>
                      </div>
                    }
                  </div>
                }
                <input type="file" #fileInput accept="image/*" style="display:none"
                  (change)="onFileSelected($event)">
              </div>

              <!-- Gallery Images -->
              <div class="field-group">
                <label>Gallery Images <span class="opt">(optional, up to 5)</span></label>
                <p class="gallery-hint">Showcase this place from different angles</p>

                <!-- Existing uploaded gallery images -->
                @if (existingImages.length > 0) {
                  <div class="existing-gallery">
                    @for (img of existingImages; track img.id) {
                      <div class="ex-slot">
                        <img [src]="img.image_url" [alt]="img.caption || 'Gallery'" class="slot-img">
                        <button type="button" class="slot-remove" (click)="deleteExistingImage(img.id)" [disabled]="deletingImageId === img.id" title="Remove">
                          @if (deletingImageId === img.id) { <i class="fas fa-spinner fa-spin"></i> }
                          @else { <i class="fas fa-times"></i> }
                        </button>
                        <div class="slot-saved-badge">saved</div>
                      </div>
                    }
                  </div>
                }

                <!-- New gallery slots -->
                @if (canAddMore) {
                  <div class="gallery-grid">
                    @for (slot of newGallerySlots; track slot; let i = $index) {
                      <div class="gallery-slot" [class.filled]="slot.preview" (click)="galleryInput.click(); activeSlot = i">
                        @if (slot.preview) {
                          <img [src]="slot.preview" alt="New photo" class="slot-img">
                          <button type="button" class="slot-remove" (click)="removeNewGallery($event, i)"><i class="fas fa-times"></i></button>
                          <div class="slot-num">new</div>
                        } @else {
                          <div class="slot-empty"><i class="fas fa-plus"></i><span>Add Photo</span></div>
                        }
                      </div>
                    }
                  </div>
                  <input type="file" #galleryInput accept="image/*" style="display:none" (change)="onNewGallerySelected($event)">
                  @if (newGalleryFiles.length > 0) {
                    <div class="gallery-count">📸 {{ newGalleryFiles.length }} new photo{{ newGalleryFiles.length > 1 ? 's' : '' }} will be uploaded on save</div>
                  }
                } @else {
                  <p class="gallery-full-note">✅ Maximum 5 gallery photos reached. Remove one to add more.</p>
                }
              </div>

              <!-- Actions -->
              <div class="form-actions">
                <a [routerLink]="['/place', place!.id]" class="btn-cancel">Cancel</a>
                <button type="submit" class="btn-save" [disabled]="isSubmitting">
                  @if (isSubmitting) {
                    <i class="fas fa-spinner fa-spin"></i> Saving...
                  } @else {
                    <i class="fas fa-check"></i> Save Changes
                  }
                </button>
              </div>

            </form>
          </div>
        } @else {
          <div class="loading-state">
            <h2>Place not found 😔</h2>
            <a routerLink="/explore">← Back to Explore</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .edit-page { min-height: 100vh; background: #f8f6f0; padding: 100px 0 80px; }
    .edit-container { max-width: 760px; margin: 0 auto; padding: 0 24px; }
    .breadcrumb { font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: #9ca3af; margin-bottom: 24px; }
    .breadcrumb a { color: #9ca3af; text-decoration: none; } .breadcrumb a:hover { color: #1B4332; } .breadcrumb span { margin: 0 6px; }
    .loading-state { min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; font-family: 'Poppins',sans-serif; color: #6B7280; }
    .spinner { width: 44px; height: 44px; border: 4px solid #e5e7eb; border-top-color: #1B4332; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .form-card { background: white; border-radius: 20px; padding: 48px; box-shadow: 0 8px 40px rgba(27,67,50,0.1); }
    .form-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; flex-wrap: wrap; gap: 16px; }
    .hdr-left h1 { font-family: 'Playfair Display',serif; font-size: 2rem; color: #1B4332; margin-bottom: 4px; }
    .hdr-left p { color: #6B7280; font-family: 'Poppins',sans-serif; font-size: 0.9rem; margin: 0; }
    .hdr-left strong { color: #1B4332; }
    .status-badge-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
    .current-status { display: inline-block; padding: 5px 14px; border-radius: 50px; font-size: 0.78rem; font-weight: 700; font-family: 'Poppins',sans-serif; }
    .status-pending { background: rgba(245,158,11,0.12); color: #d97706; }
    .status-approved { background: rgba(16,185,129,0.12); color: #059669; }
    .status-rejected { background: rgba(239,68,68,0.12); color: #dc2626; }
    .admin-status-ctrl label { display: block; font-size: 0.75rem; font-weight: 600; color: #6B7280; font-family: 'Poppins',sans-serif; margin-bottom: 4px; text-align: right; }
    .admin-status-ctrl select { padding: 7px 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-family: 'Poppins',sans-serif; font-size: 0.85rem; outline: none; cursor: pointer; }
    .admin-status-ctrl select:focus { border-color: #1B4332; }

    .field-group { margin-bottom: 24px; }
    .field-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; font-family: 'Poppins',sans-serif; margin-bottom: 8px; }
    .field-group input, .field-group select, .field-group textarea { width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-family: 'Poppins',sans-serif; font-size: 0.9rem; color: #374151; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
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
    .cat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
    .cat-opt { display: flex; flex-direction: column; align-items: center; padding: 14px 8px; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center; }
    .cat-opt.active { border-color: #1B4332; background: rgba(27,67,50,0.06); }
    .cat-opt span:last-child { font-size: 0.75rem; color: #6B7280; font-family: 'Poppins',sans-serif; }
    .cat-opt.active span:last-child { color: #1B4332; font-weight: 700; }
    .cat-em { font-size: 1.6rem; margin-bottom: 4px; display: block; }
    .icon-input { position: relative; }
    .icon-input i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
    .icon-input input { padding-left: 40px; }

    .current-image-wrap { border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .current-img { width: 100%; height: 220px; object-fit: cover; display: block; }
    .current-img-actions { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f9fafb; }
    .img-label { font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: #6B7280; }
    .change-img-btn { padding: 7px 16px; border: 2px solid #1B4332; border-radius: 8px; background: transparent; color: #1B4332; font-family: 'Poppins',sans-serif; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
    .change-img-btn:hover { background: #1B4332; color: white; }
    .upload-zone { border: 2px dashed rgba(27,67,50,0.35); border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.25s; background: rgba(27,67,50,0.02); position: relative; min-height: 160px; display: flex; align-items: center; justify-content: center; }
    .upload-zone:hover { border-color: #1B4332; background: rgba(27,67,50,0.05); }
    .upload-zone.has-img { padding: 0; border-style: solid; border-color: #1B4332; }
    .upload-ph p { color: #6B7280; font-family: 'Poppins',sans-serif; font-size: 0.875rem; margin-bottom: 6px; }
    .img-preview { width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; display: block; }
    .remove-img { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.6); color: white; border: none; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
    .remove-img:hover { background: rgba(0,0,0,0.85); }

    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; padding-top: 24px; border-top: 2px solid #f0f0f0; }
    .btn-cancel { padding: 12px 28px; border: 2px solid #e5e7eb; border-radius: 12px; color: #6B7280; text-decoration: none; font-family: 'Poppins',sans-serif; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; transition: all 0.2s; }
    .btn-cancel:hover { border-color: #9ca3af; background: #f9fafb; color: #374151; }
    .btn-save { padding: 12px 32px; background: linear-gradient(135deg,#1B4332,#2D6A4F); color: white; border: none; border-radius: 12px; font-family: 'Poppins',sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px; }
    .btn-save:hover:not([disabled]) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(27,67,50,0.35); }
    .btn-save[disabled] { opacity: 0.6; cursor: not-allowed; }

    .gallery-hint { font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: #9ca3af; margin: -4px 0 12px; }
    .existing-gallery { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; margin-bottom: 12px; }
    .ex-slot { position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden; border: 2px solid #10b981; }
    .slot-saved-badge { position: absolute; bottom: 4px; left: 5px; background: rgba(16,185,129,0.85); color: white; border-radius: 4px; font-size: 0.58rem; padding: 1px 5px; font-family: 'Poppins',sans-serif; font-weight: 700; text-transform: uppercase; }
    .gallery-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; }
    .gallery-slot { aspect-ratio: 1; border: 2px dashed #e5e7eb; border-radius: 10px; cursor: pointer; position: relative; overflow: hidden; transition: all 0.2s; background: #fafafa; }
    .gallery-slot:hover { border-color: #1B4332; background: rgba(27,67,50,0.03); }
    .gallery-slot.filled { border-style: solid; border-color: #1B4332; }
    .slot-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .slot-empty { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #d1d5db; }
    .slot-empty i { font-size: 1.2rem; }
    .slot-empty span { font-size: 0.65rem; font-family: 'Poppins',sans-serif; }
    .slot-remove { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,0.65); color: white; border: none; cursor: pointer; font-size: 0.65rem; display: flex; align-items: center; justify-content: center; z-index: 2; }
    .slot-remove:hover { background: rgba(220,38,38,0.85); }
    .slot-num { position: absolute; bottom: 4px; left: 6px; background: rgba(27,67,50,0.75); color: white; border-radius: 4px; font-size: 0.6rem; padding: 1px 5px; font-family: 'Poppins',sans-serif; font-weight: 700; }
    .gallery-count { margin-top: 8px; font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: #2D6A4F; font-weight: 600; }
    .gallery-full-note { font-family: 'Poppins',sans-serif; font-size: 0.8rem; color: #059669; font-weight: 600; margin-top: 8px; }
    @media (max-width: 576px) { .form-card { padding: 24px; } .two-col { grid-template-columns: 1fr; } .cat-grid { grid-template-columns: repeat(2,1fr); } .form-hdr { flex-direction: column; } .status-badge-wrap { align-items: flex-start; } .existing-gallery, .gallery-grid { grid-template-columns: repeat(3,1fr); } }
  `]
})
export class EditPlaceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private placeService = inject(PlaceService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  place: Place | null = null;
  isLoading = true;
  isSubmitting = false;
  submitted = false;
  isAdmin = false;
  currentImageUrl: string | null = null;
  newImagePreview: string | null = null;
  newImageFile: File | null = null;
  editStatus = 'pending';

  fd = { title: '', description: '', district: '', category: '', difficulty: 'Easy', google_maps_link: '' };
  districts = ['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'];
  categories = [{name:'Waterfall',icon:'🌊'},{name:'Trekking',icon:'🥾'},{name:'Viewpoint',icon:'🏔️'},{name:'Beach',icon:'🏖️'},{name:'Village',icon:'🏘️'},{name:'Forest',icon:'🌲'},{name:'River',icon:'🏞️'},{name:'Heritage',icon:'🏛️'}];
  difficulties = [{value:'Easy',label:'🟢 Easy'},{value:'Moderate',label:'🟡 Moderate'},{value:'Hard',label:'🔴 Hard'}];

  // Gallery
  existingImages: { id: number; image_url: string; caption: string }[] = [];
  newGallerySlots: { file: File | null; preview: string | null }[] = Array.from({ length: 5 }, () => ({ file: null, preview: null }));
  activeSlot = 0;
  deletingImageId: number | null = null;

  get newGalleryFiles(): File[] { return this.newGallerySlots.map(s => s.file).filter((f): f is File => f !== null); }
  get canAddMore(): boolean { return this.existingImages.length < 5; }
  get availableSlots(): number { return Math.max(0, 5 - this.existingImages.length); }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.is_staff ?? false;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadPlace(+id);
  }

  loadPlace(id: number) {
    this.placeService.getPlace(id).subscribe({
      next: (p) => {
        this.place = p;
        this.fd = {
          title: p.title,
          description: p.description,
          district: p.district,
          category: p.category,
          difficulty: p.difficulty,
          google_maps_link: p.google_maps_link || '',
        };
        this.editStatus = (p as any).status || 'pending';
        this.currentImageUrl = p.image_url || null;
        // Load existing gallery images
        this.existingImages = (p.images || []).map(img => ({ id: img.id, image_url: img.image_url || '', caption: img.caption }));
        this.refreshGallerySlots();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  refreshGallerySlots() {
    const available = Math.max(0, 5 - this.existingImages.length);
    this.newGallerySlots = Array.from({ length: available }, () => ({ file: null, preview: null }));
  }

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
    if (this.fd.google_maps_link) data.append('google_maps_link', this.fd.google_maps_link);
    if (this.newImageFile) data.append('image', this.newImageFile);
    if (this.isAdmin) data.append('status', this.editStatus);

    this.placeService.updatePlace(this.place!.id, data).subscribe({
      next: () => {
        // Upload new gallery images after saving
        this.uploadNewGallery(this.place!.id, () => {
          this.toastService.success('✅ Place updated successfully!');
          this.router.navigate(['/place', this.place!.id]);
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        const errors = err.error;
        if (typeof errors === 'object') {
          this.toastService.error(Object.values(errors).flat().join(' '));
        } else {
          this.toastService.error('Failed to update place. Please try again.');
        }
      }
    });
  }

  uploadNewGallery(placeId: number, done: () => void) {
    const files = this.newGalleryFiles;
    if (files.length === 0) { done(); return; }
    let uploaded = 0;
    files.forEach((file, idx) => {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('order', (this.existingImages.length + idx).toString());
      this.placeService.uploadImage(placeId, fd).subscribe({
        next: () => { uploaded++; if (uploaded === files.length) done(); },
        error: () => { uploaded++; if (uploaded === files.length) done(); }
      });
    });
  }

  deleteExistingImage(imageId: number) {
    if (!this.place) return;
    this.deletingImageId = imageId;
    this.placeService.deleteImage(this.place.id, imageId).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(img => img.id !== imageId);
        this.refreshGallerySlots();
        this.deletingImageId = null;
        this.toastService.success('Image removed.');
      },
      error: () => {
        this.deletingImageId = null;
        this.toastService.error('Failed to remove image.');
      }
    });
  }

  onNewGallerySelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const slot = this.newGallerySlots[this.activeSlot];
    if (!slot) return;
    slot.file = file;
    const reader = new FileReader();
    reader.onload = (e) => { slot.preview = e.target?.result as string; };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeNewGallery(event: Event, index: number) {
    event.stopPropagation();
    this.newGallerySlots[index] = { file: null, preview: null };
  }

  statusLabel(s: string): string {
    return { pending: '⏳ Pending Review', approved: '✅ Approved', rejected: '❌ Rejected' }[s] || s;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.setImageFile(input.files[0]);
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.setImageFile(file);
  }

  private setImageFile(file: File) {
    this.newImageFile = file;
    this.currentImageUrl = null;
    const reader = new FileReader();
    reader.onload = (e) => { this.newImagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.newImageFile = null;
    this.newImagePreview = null;
  }
}
