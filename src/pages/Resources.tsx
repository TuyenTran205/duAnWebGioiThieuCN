import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { documentsData as mockDocuments, type Document } from '../data/documents';

export const Resources: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const categories: string[] = ['All', 'Đại cương', 'Lập trình', 'Business Analyst', 'Machine Learning'];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          setDocuments(data as Document[]);
        } else {
          setDocuments(mockDocuments);
        }
      } catch (err: any) {
        console.error('Error fetching documents from Supabase:', err);
        setError(err.message || 'Failed to load documents from database.');
        setDocuments(mockDocuments);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = selectedCategory === 'All'
    ? documents
    : documents.filter(doc => doc.category === selectedCategory);

  return (
    <>
      <Helmet>
        <title>Kho Tài Liệu TLU | Trần Văn Tuyên</title>
      </Helmet>
      <Container className="py-5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-5"
        >
          <span className="hero-subtitle text-uppercase">Academic Share</span>
          <h2 className="display-5 fw-bold mt-2 mb-3" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Resource Hub
          </h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Sharing textbooks, project templates, research, and revision sheets for courses at TLU.
          </p>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
        >
          <Row className="justify-content-center mb-4">
            <Col md={6} lg={4}>
              <Form.Group controlId="categoryFilter">
                <Form.Label className="text-secondary small mb-2">Filter by Category</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="custom-select"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Loading documents...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="warning" className="mb-4 text-center border-0 bg-opacity-10 bg-warning text-warning">
                Running in fallback mode: {error}
              </Alert>
            )}

            {/* Document Table */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              className="table-responsive"
            >
              <Table className="custom-table" hover>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Format</th>
                    <th>Size</th>
                    <th>Date Added</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td className="fw-semibold">{doc.title}</td>
                        <td>{doc.category}</td>
                        <td>
                          <span className="badge bg-secondary text-light px-2 py-1">
                            {doc.format}
                          </span>
                        </td>
                        <td>{doc.size}</td>
                        <td>{new Date(doc.created_at).toISOString().split('T')[0]}</td>
                        <td className="text-end">
                          <Button
                            href={doc.downloadUrl || (doc as any).downloadurl || (doc as any).download_url || '#'}
                            variant="primary"
                            size="sm"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ background: 'var(--primary-gradient)', border: 'none' }}
                          >
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-secondary">
                        No documents found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </motion.div>
          </>
        )}
      </Container>
    </>
  );
};

export default Resources;
