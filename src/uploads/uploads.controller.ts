import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Res, Query } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFilter, imageNamer } from './helpers';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly uploadsService: UploadsService
  ) {}

  @Post('item')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: imageFilter,
    storage: diskStorage({
      destination: './static/uploads',
      filename: imageNamer
    })
  }))
  async uploadItem(
    @UploadedFile() file: Express.Multer.File,
    @Body() body : { name: string }
  ) {
    if( !file ) throw new BadRequestException('Make sure the file is an image');

    const secureUrl = `${ this.configService.get('HOST_API') }/uploads/item/${ file.filename }`

    const savedData = await this.uploadsService.save(
      body.name,
      file.filename,
      secureUrl
    )

    return {
      msg: "OK",
      data: savedData
    }
    
  }

  @Get('items')
  findAll( @Query() paginationDto: PaginationDto) {
    return this.uploadsService.findAll( paginationDto );
  }

  @Get('items/:term')
  findOne(@Param('term') term: string) {
    return this.uploadsService.findOne(term);
  }

  @Get('item/:imageName')
  findOneImage(
    @Res() resp: Response,
    @Param('imageName') imageName: string
  ) {
    const path = this.uploadsService.getStaticProductImage( imageName );

    resp.sendFile( path )
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUploadDto: UpdateUploadDto) {
    return this.uploadsService.update(+id, updateUploadDto);
  }

  @Delete('items/:id')
  remove(@Param('id') id: string) {
    return this.uploadsService.remove(id);
  }
}
