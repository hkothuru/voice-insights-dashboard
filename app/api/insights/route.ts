import { NextResponse } from 'next/server';
import { insightsEngine } from '@/src/lib/insights';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'platform';

    let insights;

    switch (type) {
      case 'platform':
        insights = insightsEngine.generatePlatformInsights();
        break;
      case 'category':
        insights = insightsEngine.generateCategoryInsights();
        break;
      case 'specs':
        insights = insightsEngine.generateSpecIntelligence();
        break;
      case 'listings':
        insights = insightsEngine.generateListingEnhancements();
        break;
      case 'intent':
        insights = insightsEngine.generateLeadIntentInsights();
        break;
      case 'objections':
        insights = insightsEngine.generateObjectionInsights();
        break;
      case 'language':
        insights = insightsEngine.generateLanguageInsights();
        break;
      case 'responsiveness':
        insights = insightsEngine.generateResponsivenessInsights();
        break;
      case 'demand':
        insights = insightsEngine.generateDemandGapInsights();
        break;
      default:
        insights = insightsEngine.generatePlatformInsights();
    }

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error('Insights generation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
