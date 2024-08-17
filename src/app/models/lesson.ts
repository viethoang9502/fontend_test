import { LessonImage } from "./lesson.image";
export interface Lesson {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  description: string;
  category_id: number;
  url: string;
  lesson_images: LessonImage[];
}

  
    