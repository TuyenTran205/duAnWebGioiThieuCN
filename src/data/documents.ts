export type DocumentCategory = 'Đại cương' | 'Cơ sở khối ngành(IT)' | 'Cơ sở ngành(IT)' | 'Tự chọn(IT)';

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
    category: 'Cơ sở ngành(IT)',
    format: 'PDF',
    size: '4.5 MB',
    downloadUrl: '#',
    created_at: '2026-07-15T00:00:00Z'
  },
  {
    id: 'doc-2',
    title: 'Hướng dẫn C++ cơ bản',
    category: 'Cơ sở khối ngành(IT)',
    format: 'PDF',
    size: '2.8 MB',
    downloadUrl: '#',
    created_at: '2026-07-18T00:00:00Z'
  },
  {
    id: 'doc-3',
    title: 'Đồ án PHP',
    category: 'Cơ sở ngành(IT)',
    format: 'ZIP',
    size: '12.4 MB',
    downloadUrl: '#',
    created_at: '2026-07-20T00:00:00Z'
  },
  {
    id: 'doc-4',
    title: 'Xác suất thống kê cho BA',
    category: 'Cơ sở khối ngành(IT)',
    format: 'PDF',
    size: '3.2 MB',
    downloadUrl: '#',
    created_at: '2026-07-22T00:00:00Z'
  },
  {
    id: 'doc-5',
    title: 'Nhập môn Machine Learning',
    category: 'Tự chọn(IT)',
    format: 'PDF',
    size: '5.1 MB',
    downloadUrl: '#',
    created_at: '2026-07-25T00:00:00Z'
  }
];
