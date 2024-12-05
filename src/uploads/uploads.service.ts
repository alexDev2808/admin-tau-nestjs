import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class UploadsService {

  getStaticProductImage( imageName: string ) {
    const path = join( __dirname, '../../static/uploads/', imageName )

    if( !existsSync(path) ) throw new BadRequestException(`No product found with image ${ imageName }`)

    return path;
  }

  create(createUploadDto: CreateUploadDto) {
    return 'This action adds a new upload';
  }

  findAll() {
    return `This action returns all uploads`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }
}
