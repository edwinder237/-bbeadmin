import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const oldImageUrl = formData.get('oldImageUrl') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (3MB max)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 3MB limit' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP)' },
        { status: 400 }
      );
    }

    // Delete old image if it exists and is a Vercel Blob URL
    if (oldImageUrl && oldImageUrl.includes('vercel-storage.com')) {
      try {
        await del(oldImageUrl, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      } catch (deleteError) {
        console.warn('Failed to delete old image:', deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Only delete if it's a Vercel Blob URL
    if (!imageUrl.includes('vercel-storage.com')) {
      return NextResponse.json(
        { error: 'Can only delete Vercel Blob images' },
        { status: 400 }
      );
    }

    await del(imageUrl, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}