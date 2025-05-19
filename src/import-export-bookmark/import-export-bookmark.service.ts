import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ImportExportBookmarkService {
  constructor(private prisma: PrismaService) {}

  async exportBookmarkData(id: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId: id,
      },
    });
    console.log(bookmarks, 'hello');
    let html = `<DL><p>\n`;
    bookmarks.forEach((b) => {
      html += `    <DT><A HREF="${b.link}" ADD_DATE="${Math.floor(b.createdAt.getTime() / 1000)}">${b.title}</A>\n`;
    });
    html += `</DL><p>`;

    return html;
  }

  async importBookmark(userId: number, file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File Not Uploaded', HttpStatus.BAD_REQUEST);
    }

    let bookmarks: { link: string; title: string }[] = [];

    try {
      if (file.mimetype === 'application/json') {
        bookmarks = JSON.parse(file.buffer.toString());
      } else if (file.mimetype === 'text/html') {
        bookmarks = this.parseHtmlBookmarks(file.buffer.toString());
      } else {
        throw new HttpException(
          'Unsupported File Format',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException('Invalid File Type', HttpStatus.BAD_REQUEST);
    }

    const saved = await this.prisma.bookmark.createMany({
      data: bookmarks.map((b) => ({
        link: b.link,
        title: b.title,
        userId: userId,
      })),
    });

    return saved.count;
  }

  private parseHtmlBookmarks(html: string): { link: string; title: string }[] {
    const bookmarks: { link: string; title: string }[] = [];
    const regex = /<A HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      bookmarks.push({
        link: match[1],
        title: match[2],
      });
    }

    return bookmarks;
  }
}
