import fs from 'fs';
import path from 'path';

export interface CallRecord {
  buyer_identifier: string;
  seller_identifier: string;
  pns_call_recording_url: string;
  mcat_id_x: string;
  mcat_name: string;
  pns_call_record_started_at: string;
  pns_call_record_ended_at: string;
  call_duration: number;
  city_name: string;
  state_name: string;
  pns_custtype_id: string;
  pns_call_modrefname: string;
  pns_call_source_modid: string;
  seller_vintage_days: number;
  pns_call_ring_duration: number;
  Audio_URL: string;
}

export interface CategoryStats {
  categoryName: string;
  categoryId: string;
  totalCalls: number;
  totalDuration: number;
  averageDuration: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  topCities: Array<{ city: string; count: number }>;
  topStates: Array<{ state: string; count: number }>;
  callSourceBreakdown: Record<string, number>;
  customerTypeBreakdown: Record<string, number>;
  avgSellerVintage: number;
  timeDistribution: {
    morning: number;    // 6-12
    afternoon: number;  // 12-18
    evening: number;    // 18-22
    night: number;      // 22-6
  };
  sampleRecords: CallRecord[];
}

export class DatasetProcessor {
  private data: CallRecord[] = [];
  private categoryStats: Map<string, CategoryStats> = new Map();

  constructor() {
    this.loadData();
    this.processCategories();
  }

  private loadData() {
    try {
      const csvPath = path.join(process.cwd(), 'Buyer Seller Call Intelligence Data - Audio Data.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');

      // Parse CSV (simple parser for this format)
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = this.parseCSVLine(line);
        if (values.length === headers.length) {
          const record: any = {};
          headers.forEach((header, index) => {
            const value = values[index]?.trim() || '';
            record[header] = this.parseValue(header, value);
          });
          this.data.push(record as CallRecord);
        }
      }

      console.log(`Loaded ${this.data.length} call records`);
    } catch (error) {
      console.error('Error loading dataset:', error);
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  private parseValue(header: string, value: string): any {
    // Handle specific data types
    if (header === 'call_duration' || header === 'seller_vintage_days' || header === 'pns_call_ring_duration') {
      return parseInt(value) || 0;
    }
    if (header === 'mcat_id_x') {
      return value;
    }
    return value;
  }

  private processCategories() {
    const categoryGroups = new Map<string, CallRecord[]>();

    // Group by category
    this.data.forEach(record => {
      const categoryKey = `${record.mcat_name}_${record.mcat_id_x}`;
      if (!categoryGroups.has(categoryKey)) {
        categoryGroups.set(categoryKey, []);
      }
      categoryGroups.get(categoryKey)!.push(record);
    });

    // Process each category
    categoryGroups.forEach((records, categoryKey) => {
      const [categoryName, categoryId] = categoryKey.split('_');

      const stats: CategoryStats = {
        categoryName,
        categoryId,
        totalCalls: records.length,
        totalDuration: records.reduce((sum, r) => sum + r.call_duration, 0),
        averageDuration: 0,
        uniqueBuyers: new Set(records.map(r => r.buyer_identifier)).size,
        uniqueSellers: new Set(records.map(r => r.seller_identifier)).size,
        topCities: [],
        topStates: [],
        callSourceBreakdown: {},
        customerTypeBreakdown: {},
        avgSellerVintage: 0,
        timeDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 },
        sampleRecords: records.slice(0, 10) // Keep first 10 samples
      };

      stats.averageDuration = Math.round(stats.totalDuration / stats.totalCalls);

      // Process cities
      const cityCount = new Map<string, number>();
      records.forEach(r => {
        cityCount.set(r.city_name, (cityCount.get(r.city_name) || 0) + 1);
      });
      stats.topCities = Array.from(cityCount.entries())
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Process states
      const stateCount = new Map<string, number>();
      records.forEach(r => {
        stateCount.set(r.state_name, (stateCount.get(r.state_name) || 0) + 1);
      });
      stats.topStates = Array.from(stateCount.entries())
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Call source breakdown
      records.forEach(r => {
        stats.callSourceBreakdown[r.pns_call_source_modid] =
          (stats.callSourceBreakdown[r.pns_call_source_modid] || 0) + 1;
      });

      // Customer type breakdown
      records.forEach(r => {
        stats.customerTypeBreakdown[r.pns_custtype_id] =
          (stats.customerTypeBreakdown[r.pns_custtype_id] || 0) + 1;
      });

      // Average seller vintage
      stats.avgSellerVintage = Math.round(
        records.reduce((sum, r) => sum + r.seller_vintage_days, 0) / records.length
      );

      // Time distribution
      records.forEach(r => {
        const hour = parseInt(r.pns_call_record_started_at.split(':')[0]);
        if (hour >= 6 && hour < 12) stats.timeDistribution.morning++;
        else if (hour >= 12 && hour < 18) stats.timeDistribution.afternoon++;
        else if (hour >= 18 && hour < 22) stats.timeDistribution.evening++;
        else stats.timeDistribution.night++;
      });

      this.categoryStats.set(categoryKey, stats);
    });
  }

  getAllCategories(): CategoryStats[] {
    return Array.from(this.categoryStats.values())
      .sort((a, b) => b.totalCalls - a.totalCalls);
  }

  getCategoryStats(categoryName: string, categoryId: string): CategoryStats | undefined {
    return this.categoryStats.get(`${categoryName}_${categoryId}`);
  }

  getTopCategories(limit: number = 20): CategoryStats[] {
    return this.getAllCategories().slice(0, limit);
  }

  getOverallStats() {
    const allStats = this.getAllCategories();
    return {
      totalCalls: this.data.length,
      totalCategories: allStats.length,
      avgCallsPerCategory: Math.round(this.data.length / allStats.length),
      totalDuration: allStats.reduce((sum, cat) => sum + cat.totalDuration, 0),
      avgDuration: Math.round(
        allStats.reduce((sum, cat) => sum + cat.averageDuration, 0) / allStats.length
      ),
      uniqueBuyers: new Set(this.data.map(r => r.buyer_identifier)).size,
      uniqueSellers: new Set(this.data.map(r => r.seller_identifier)).size
    };
  }

  searchCategories(query: string): CategoryStats[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllCategories().filter(cat =>
      cat.categoryName.toLowerCase().includes(lowercaseQuery) ||
      cat.categoryId.includes(query)
    );
  }
}

// Singleton instance
export const datasetProcessor = new DatasetProcessor();
