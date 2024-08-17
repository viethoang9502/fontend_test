  import { Component, OnInit } from '@angular/core';
  import { Router, ActivatedRoute } from '@angular/router';
  import { Lesson } from '../../models/lesson';
  import { LessonService } from '../../services/lesson.service';
  import { CartService } from '../../services/cart.service';
  import { environment } from '../../../environments/environment';
  import { LessonImage } from '../../models/lesson.image';
  import { HeaderComponent } from '../header/header.component';
  import { FooterComponent } from '../footer/footer.component';
  import { CommonModule } from '@angular/common';
  import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
  import { ApiResponse } from '../../responses/api.response';
  import { HttpErrorResponse } from '@angular/common/http';

  @Component({
    selector: 'app-detail-product',
    templateUrl: './detail-product.component.html',
    styleUrls: ['./detail-product.component.scss'],
    standalone: true,
    imports: [
      FooterComponent,
      HeaderComponent,
      CommonModule,
      NgbModule
    ]
  })

  export class DetailProductComponent implements OnInit {
    lesson?: Lesson;
    productId: number = 0;
    quantity: number = 0;
    currentImageIndex: number = 0;
    progress: number = 0; // Phần trăm tiến trình
    isPressedAddToCart: boolean = false;
    viewedImagesCount: number = 0; // Bộ đếm số ảnh đã xem

    constructor(
      private lessonService: LessonService,
      private cartService: CartService,
      private activatedRoute: ActivatedRoute,
      private router: Router,
    ) { }

    ngOnInit() {
      // Lấy productId từ URL      
      const idParam = this.activatedRoute.snapshot.paramMap.get('id');
      if (idParam !== null) {
        this.productId = +idParam;
      }
      if (!isNaN(this.productId)) {
        this.lessonService.getDetailProduct(this.productId).subscribe({
          next: (apiResponse: ApiResponse) => {
            // Lấy danh sách ảnh sản phẩm và thay đổi URL
            const response = apiResponse.data;
            if (response.lesson_images && response.lesson_images.length > 0) {
              response.lesson_images.forEach((lesson_image: LessonImage) => {
                // Kiểm tra và gán URL đầy đủ cho image_url và video_url
                if (lesson_image.image_url && !lesson_image.image_url.startsWith('http')) {
                  lesson_image.image_url = `${environment.apiBaseUrl}/lessons/images/${lesson_image.image_url}`;
                }
                if (lesson_image.video_url && !lesson_image.video_url.startsWith('http')) {
                  lesson_image.video_url = `${environment.apiBaseUrl}/lessons/videos/${lesson_image.video_url}`;
                }
              });
            }
            this.lesson = response;
            // Bắt đầu với ảnh đầu tiên
            this.showImage(0);
            // Đặt số lượng ảnh đã xem là 1 khi bắt đầu
            this.viewedImagesCount = 1;
          },
          error: (error: HttpErrorResponse) => {
            console.error(error?.error?.message ?? '');
          }
        });
      } else {
        console.error('Invalid productId:', idParam);
      }
    }

    showImage(index: number): void {
      if (this.lesson && this.lesson.lesson_images && this.lesson.lesson_images.length > 0) {
        index = Math.max(0, Math.min(index, this.lesson.lesson_images.length - 1));
        if (index !== this.currentImageIndex) {
          this.currentImageIndex = index;
          this.progress = 0; // Reset tiến trình khi chuyển video
        }
      }
    }

    nextImage(): void {
      if (this.lesson && this.lesson.lesson_images) {
        const nextIndex = (this.currentImageIndex + 1) % this.lesson.lesson_images.length;
        this.showImage(nextIndex);
      }
    }

    previousImage(): void {
      if (this.lesson && this.lesson.lesson_images) {
        const prevIndex = (this.currentImageIndex - 1 + this.lesson.lesson_images.length) % this.lesson.lesson_images.length;
        this.showImage(prevIndex);
      }
    }

    addToCart(): void {
      this.isPressedAddToCart = true;
      if (this.lesson) {
        this.cartService.addToCart(this.lesson.id, this.progress);
      } else {
        console.error('Không thể thêm sản phẩm vào giỏ hàng vì product là null.');
      }
    }

    onTimeUpdate(event: Event): void {
      const videoElement = event.target as HTMLVideoElement;
      if (videoElement && videoElement.duration > 0) {
        this.progress = (videoElement.currentTime / videoElement.duration) * 100;
      }
    }

    increaseQuantity(): void {
      this.quantity++;
    }

    decreaseQuantity(): void {
      if (this.quantity > 1) {
        this.quantity--;
      }
    }

    getTotalPrice(): number {
      return this.lesson ? this.lesson.price * this.quantity : 0;
    }

    buyNow(): void {
      if (!this.isPressedAddToCart) {
        this.addToCart();
      }
      this.router.navigate(['/progresses']);
    }
    
    startGame(): void {
      this.router.navigate([`/gamesocers/${this.productId}`]);
    }
  }
