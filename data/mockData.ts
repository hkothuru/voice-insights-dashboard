export interface CallAnalysis {
  role_identification: {
    buyer: string;
    seller: string;
  };
  product: string;
  category: string;
  specifications: Record<string, string>;
  price_discussion: {
    asked_price?: string;
    offered_price?: string;
    final_price?: string;
    currency: string;
  };
  action_items: Array<{ task: string; assigned_to: string }>;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'high' | 'medium' | 'low';
}

export interface CallData {
  id: string;
  metadata: {
    buyer_id: string;
    seller_id: string;
    category_id: string;
    category_name: string;
    location: {
      city: string;
      region: string;
    };
    timestamp: string;
    duration_seconds: number;
  };
  transcript: string; // Simplified for mock
  analysis: CallAnalysis;
}

export const MOCK_CALLS: CallData[] = [
  {
    id: 'call_001',
    metadata: {
      buyer_id: 'buy_101',
      seller_id: 'sel_201',
      category_id: 'cat_construction',
      category_name: 'Construction Material',
      location: { city: 'Pune', region: 'Maharashtra' },
      timestamp: '2025-10-25T10:30:00Z',
      duration_seconds: 145,
    },
    transcript: "Buyer: Hello, I need 500 bags of UltraTech cement. Seller: We have it in stock. Rate is 380 per bag. Buyer: Can you do 370? Seller: For 500 bags, okay. Delivery tomorrow?",
    analysis: {
      role_identification: { buyer: 'Ramesh construction', seller: 'Pune Cement Traders' },
      product: 'UltraTech Cement',
      category: 'Construction Material',
      specifications: { quantity: '500 bags', type: 'OPC 53 Grade' },
      price_discussion: { asked_price: '380', offered_price: '370', final_price: '370', currency: 'INR' },
      action_items: [{ task: 'Arrange delivery', assigned_to: 'Seller' }],
      sentiment: 'positive',
      urgency: 'high',
    },
  },
  {
    id: 'call_002',
    metadata: {
      buyer_id: 'buy_102',
      seller_id: 'sel_202',
      category_id: 'cat_machinery',
      category_name: 'Industrial Machinery',
      location: { city: 'Ludhiana', region: 'Punjab' },
      timestamp: '2025-10-26T14:15:00Z',
      duration_seconds: 320,
    },
    transcript: "Buyer: I am looking for a CNC lathe machine, 6 feet bed size. Seller: We have a standard model. Heavy duty. Price starts at 4.5 Lakhs. Buyer: I need auto-feed feature. Seller: That will be the deluxe model, 5.2 Lakhs.",
    analysis: {
      role_identification: { buyer: 'Singh Auto Parts', seller: 'Ludhiana Machines' },
      product: 'CNC Lathe Machine',
      category: 'Industrial Machinery',
      specifications: { bed_size: '6 feet', type: 'Heavy Duty', feature: 'Auto-feed' },
      price_discussion: { asked_price: '5.2 Lakhs', currency: 'INR' },
      action_items: [{ task: 'Send brochure and quotation', assigned_to: 'Seller' }],
      sentiment: 'neutral',
      urgency: 'medium',
    },
  },
  {
    id: 'call_003',
    metadata: {
      buyer_id: 'buy_103',
      seller_id: 'sel_203',
      category_id: 'cat_electronics',
      category_name: 'Electronics',
      location: { city: 'Bangalore', region: 'Karnataka' },
      timestamp: '2025-10-27T09:45:00Z',
      duration_seconds: 90,
    },
    transcript: "Buyer: Do you supply PCB boards for IoT devices? Seller: Yes. Buyer: I need 1000 units, custom design. Seller: Minimum order is 5000 for custom. Buyer: That's too high for us now.",
    analysis: {
      role_identification: { buyer: 'TechStart Inc', seller: 'Bangalore Circuits' },
      product: 'PCB Boards',
      category: 'Electronics',
      specifications: { usage: 'IoT devices', quantity: '1000' },
      price_discussion: { currency: 'INR' },
      action_items: [],
      sentiment: 'negative',
      urgency: 'low',
    },
  },
  {
    id: 'call_004',
    metadata: {
      buyer_id: 'buy_104',
      seller_id: 'sel_204',
      category_id: 'cat_textiles',
      category_name: 'Textiles',
      location: { city: 'Surat', region: 'Gujarat' },
      timestamp: '2025-10-28T11:20:00Z',
      duration_seconds: 210,
    },
    transcript: "Buyer: Need Cotton Lycra fabric, GSM 180. Seller: Available in black and navy blue. 250 rs per kg. Buyer: I need red also. Seller: Red is out of stock, coming next week.",
    analysis: {
      role_identification: { buyer: 'Fashion Hub', seller: 'Surat Fab' },
      product: 'Cotton Lycra Fabric',
      category: 'Textiles',
      specifications: { gsm: '180', colors: 'Black, Navy Blue' },
      price_discussion: { asked_price: '250 per kg', currency: 'INR' },
      action_items: [{ task: 'Notify when Red is in stock', assigned_to: 'Seller' }],
      sentiment: 'neutral',
      urgency: 'medium',
    },
  },
  {
    id: 'call_005',
    metadata: {
      buyer_id: 'buy_105',
      seller_id: 'sel_205',
      category_id: 'cat_chemicals',
      category_name: 'Chemicals',
      location: { city: 'Vadodara', region: 'Gujarat' },
      timestamp: '2025-10-29T16:00:00Z',
      duration_seconds: 180,
    },
    transcript: "Buyer: Inquiry for Sulfuric Acid, 98% purity. Tanker load. Seller: Daily rate fluctuates. Today it is 12 rs per kg ex-factory. Buyer: Load today? Seller: Yes, can dispatch evening.",
    analysis: {
      role_identification: { buyer: 'Gujarat Pharma', seller: 'Chem Industries' },
      product: 'Sulfuric Acid',
      category: 'Chemicals',
      specifications: { purity: '98%', quantity: 'Tanker load' },
      price_discussion: { final_price: '12 per kg', currency: 'INR' },
      action_items: [{ task: 'Dispatch tanker', assigned_to: 'Seller' }],
      sentiment: 'positive',
      urgency: 'high',
    },
  }
];
