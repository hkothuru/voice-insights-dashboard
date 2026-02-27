import { NextResponse } from 'next/server';
import { datasetProcessor } from '@/src/lib/dataset';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const category = searchParams.get('category');
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '20');

    let data;

    switch (type) {
      case 'overview':
        data = datasetProcessor.getOverallStats();
        break;

      case 'categories':
        data = datasetProcessor.getTopCategories(limit);
        break;

      case 'category':
        if (category && categoryId) {
          data = datasetProcessor.getCategoryStats(category, categoryId);
        } else {
          data = null;
        }
        break;

      case 'search':
        const query = searchParams.get('q') || '';
        data = datasetProcessor.searchCategories(query);
        break;

      default:
        data = datasetProcessor.getOverallStats();
    }

    if (!data) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Dataset API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
