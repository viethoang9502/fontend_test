import { Component, Inject, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { Lesson } from '../../../models/lesson';
import { LessonService } from '../../../services/lesson.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse } from '../../../responses/api.response';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-lesson-admin',
  templateUrl: './lesson.admin.component.html',
  styleUrls: [
    './lesson.admin.component.scss',        
  ],
  standalone: true,
  imports: [   
    CommonModule,
    FormsModule,
  ]
})
export class LessonAdminComponent implements OnInit {
    selectedCategoryId: number  = 0; // Giá trị category được chọn
    lessons: Lesson[] = [];        
    currentPage: number = 0;
    itemsPerPage: number = 12;
    pages: number[] = [];
    totalPages:number = 0;
    visiblePages: number[] = [];
    keyword:string = "";
    localStorage?:Storage;

    private LessonService = inject(LessonService);
    private router = inject(Router);
    private location = inject(Location);

    constructor(
      @Inject(DOCUMENT) private document: Document
    ) {
      this.localStorage = document.defaultView?.localStorage;
    }
    ngOnInit() {
      this.currentPage = Number(this.localStorage?.getItem('currentProductAdminPage')) || 0; 
      this.getLessons(this.keyword, 
        this.selectedCategoryId, 
        this.currentPage, this.itemsPerPage);      
    }    
    searchLessons() {
      this.currentPage = 0;
      this.itemsPerPage = 12;
      //Mediocre Iron Wallet
      debugger
      this.getLessons(this.keyword.trim(), this.selectedCategoryId, this.currentPage, this.itemsPerPage);
    }
    getLessons(keyword: string, selectedCategoryId: number, page: number, limit: number) {
      debugger
      this.LessonService.getLessons(keyword, selectedCategoryId, page, limit).subscribe({
        next: (apiResponse: ApiResponse) => {
          debugger
          const lessons = apiResponse?.data as Lesson[]          
          lessons.forEach((product: Lesson) => {                      
            if (product) {
              product.url = `${environment.apiBaseUrl}/Lessons/images/${product.thumbnail}`;
            }          
          });
          this.lessons = lessons;
          this.totalPages = apiResponse?.data.totalPages;
          this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
        },
        complete: () => {
          debugger;
        },
        error: (error: HttpErrorResponse) => {
          debugger;
          console.error(error?.error?.message ?? '');
        }
      });    
    }
    onPageChange(page: number) {
      debugger;
      this.currentPage = page < 0 ? 0 : page;
      this.localStorage?.setItem('currentProductAdminPage', String(this.currentPage));     
      this.getLessons(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
    }
  
    generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
      const maxVisiblePages = 5;
      const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    
      let startPage = Math.max(currentPage - halfVisiblePages, 1);
      let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
    
      return new Array(endPage - startPage + 1).fill(0)
        .map((_, index) => startPage + index);
    }
    
    // Hàm xử lý sự kiện khi thêm mới sản phẩm
    insertProduct() {
      debugger
      // Điều hướng đến trang detail-product với productId là tham số
      this.router.navigate(['/admin/Lessons/insert']);
    } 

    // Hàm xử lý sự kiện khi sản phẩm được bấm vào
    updateProduct(productId: number) {
      debugger
      // Điều hướng đến trang detail-product với productId là tham số
      this.router.navigate(['/admin/Lessons/update', productId]);
    }  
    deleteProduct(lesson: Lesson) {      
      const confirmation = window
      .confirm('Are you sure you want to delete this product?');
      if (confirmation) {
        debugger
        this.LessonService.deleteProduct(lesson.id).subscribe({
          next: (apiResponse: ApiResponse) => {
            debugger 
            console.error('Xóa thành công')
            location.reload();          
          },
          complete: () => {
            debugger;          
          },
          error: (error: HttpErrorResponse) => {
            debugger;
            console.error(error?.error?.message ?? '');
          }
        });  
      }      
    }      
}