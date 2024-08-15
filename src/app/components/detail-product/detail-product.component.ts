import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';
import { ProductImage } from '../../models/product.image';
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
  product?: Product;
  productId: number = 0;
  quantity: number = 0;
  currentImageIndex: number = 0;
  progress: number = 0; // Phần trăm tiến trình
  isPressedAddToCart: boolean = false;
  viewedImagesCount: number = 0; // Bộ đếm số ảnh đã xem

  constructor(
    private productService: ProductService,
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
      this.productService.getDetailProduct(this.productId).subscribe({
        next: (apiResponse: ApiResponse) => {
          // Lấy danh sách ảnh sản phẩm và thay đổi URL
          const response = apiResponse.data;
          if (response.product_images && response.product_images.length > 0) {
            response.product_images.forEach((product_image: ProductImage) => {
              // Kiểm tra và gán URL đầy đủ cho image_url và video_url
              if (product_image.image_url && !product_image.image_url.startsWith('http')) {
                product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
              }
              if (product_image.video_url && !product_image.video_url.startsWith('http')) {
                product_image.video_url = `${environment.apiBaseUrl}/products/videos/${product_image.video_url}`;
              }
            });
          }
          this.product = response;
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
    if (this.product && this.product.product_images && this.product.product_images.length > 0) {
      index = Math.max(0, Math.min(index, this.product.product_images.length - 1));
      if (index !== this.currentImageIndex) {
        this.currentImageIndex = index;
        this.progress = 0; // Reset tiến trình khi chuyển video
      }
    }
  }

  nextImage(): void {
    if (this.product && this.product.product_images) {
      const nextIndex = (this.currentImageIndex + 1) % this.product.product_images.length;
      this.showImage(nextIndex);
    }
  }

  previousImage(): void {
    if (this.product && this.product.product_images) {
      const prevIndex = (this.currentImageIndex - 1 + this.product.product_images.length) % this.product.product_images.length;
      this.showImage(prevIndex);
    }
  }

  addToCart(): void {
    this.isPressedAddToCart = true;
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.progress);
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
    return this.product ? this.product.price * this.quantity : 0;
  }

  buyNow(): void {
    if (!this.isPressedAddToCart) {
      this.addToCart();
    }
    this.router.navigate(['/orders']);
  }
  
  startGame(): void {
    this.router.navigate([`/gamesocers/${this.productId}`]);
  }
}
