import { EventService } from '../services/event.service';
import { Component, OnInit } from '@angular/core';
import { PhotoDto } from '../dto/photo.dto';
@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css']
})
export class PhotoComponent implements OnInit {

  ngOnInit(): void {

  }

  selectedImage: File | undefined;
  base64Image: string | undefined;

  constructor(private eventService: EventService) { }

  onFileSelected(event: any) {
    this.selectedImage = event.target.files[0];
    this.encodeImage();

  }

  encodeImage() {
    const reader = new FileReader();
    reader.onload = () => {
      this.base64Image = reader.result as string;
    };
    reader.readAsDataURL(this.selectedImage as File);
  }

  uploadImage() {
    const eventId = 1;
    console.log(this.base64Image);
    const dto: PhotoDto = {
      photo: this.base64Image!,
      description: 'okay',
    };

    this.eventService.uploadImage(eventId, dto).subscribe((data: any) => {
      console.log(data);
    });
  }


}