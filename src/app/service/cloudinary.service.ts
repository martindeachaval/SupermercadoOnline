import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  original_filename: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private cloudName = environment.cloudinary.cloudName; ///Toma las configuraciones del environment
  private uploadPreset = environment.cloudinary.uploadPreset; ///
  private folder = environment.cloudinary.folder; ///

  private uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`; ///Aca armo la url con el cloudname

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<CloudinaryUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', this.uploadPreset); ///Con esto se acepta la subida
    form.append('folder', this.folder); ///Define la carpeta

    return this.http.post<CloudinaryUploadResponse>(this.uploadUrl, form);
  }
}
