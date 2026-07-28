export type DocumentCategory = 'Đại cương' | 'Lập trình' | 'Business Analyst' | 'Machine Learning';

export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  format: string;
  size: string;
  downloadUrl: string;
  created_at: string;
}

export const documentsData: Document[] = [
  {
    id: 'doc-1',
    title: 'Tài liệu OOP Java',
    category: 'Lập trình',
    format: 'PDF',
    size: '4.5 MB',
    downloadUrl: '#',
    created_at: '2026-07-15T00:00:00Z'
  },
  {
    id: 'doc-2',
    title: 'Hướng dẫn C++ cơ bản',
    category: 'Lập trình',
    format: 'PDF',
    size: '2.8 MB',
    downloadUrl: '#',
    created_at: '2026-07-18T00:00:00Z'
  },
  {
    id: 'doc-3',
    title: 'Đồ án PHP',
    category: 'Lập trình',
    format: 'ZIP',
    size: '12.4 MB',
    downloadUrl: '#',
    created_at: '2026-07-20T00:00:00Z'
  },
  {
    id: 'doc-4',
    title: 'Xác suất thống kê cho BA',
    category: 'Business Analyst',
    format: 'PDF',
    size: '3.2 MB',
    downloadUrl: '#',
    created_at: '2026-07-22T00:00:00Z'
  },
  {
    id: 'doc-5',
    title: 'Nhập môn Machine Learning',
    category: 'Machine Learning',
    format: 'PDF',
    size: '5.1 MB',
    downloadUrl: '#',
    created_at: '2026-07-25T00:00:00Z'
  }
];
