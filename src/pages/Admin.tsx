import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Form, Button, Row, Col, Card, Alert, Spinner, Table, Modal } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { DocumentCategory } from '../data/documents';

export const Admin: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Login form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Profile edit state
  const [profileId, setProfileId] = useState<string | number | null>(null);
  const [bio, setBio] = useState<string>('');
  const [skillsText, setSkillsText] = useState<string>('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  // Document upload state
  const [docTitle, setDocTitle] = useState<string>('');
  const [docCategory, setDocCategory] = useState<DocumentCategory | ''>('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  const categories: DocumentCategory[] = ['Đại cương', 'Lập trình', 'Business Analyst', 'Machine Learning'];
  const projectTypes = ['Web Development', 'Mobile App', 'AI Application', 'Desktop App', 'Other'];

  // Add Project state
  const [projTitle, setProjTitle] = useState<string>('');
  const [projDesc, setProjDesc] = useState<string>('');
  const [projTechText, setProjTechText] = useState<string>('');
  const [projType, setProjType] = useState<string>('');
  const [projLink, setProjLink] = useState<string>('');
  const [projLoading, setProjLoading] = useState<boolean>(false);
  const [projError, setProjError] = useState<string | null>(null);
  const [projSuccess, setProjSuccess] = useState<string | null>(null);

  // Manage Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState<boolean>(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [docsSuccess, setDocsSuccess] = useState<string | null>(null);

  // Edit Document Modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editDocId, setEditDocId] = useState<number | string | null>(null);
  const [editDocTitle, setEditDocTitle] = useState<string>('');
  const [editDocCategory, setEditDocCategory] = useState<DocumentCategory | ''>('');
  const [editDocLoading, setEditDocLoading] = useState<boolean>(false);

  const fetchDocuments = async () => {
    setDocsLoading(true);
    try {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      setDocsError(err.message || 'Failed to fetch documents.');
    } finally {
      setDocsLoading(false);
    }
  };

  // Fetch documents when session changes
  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
  }, [session]);

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch profile when session is set
  useEffect(() => {
    if (!session) return;

    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setProfileId(data.id);
          setBio(data.bio || '');
          setSkillsText(data.skills ? data.skills.join(', ') : '');
        }
      } catch (err: any) {
        console.error('Error fetching profile for edit:', err);
        setProfileError(err.message || 'Failed to load profile details.');
      }
    };

    fetchProfileData();
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);

    const skillsArray = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      if (profileId) {
        const { error } = await supabase
          .from('profile')
          .update({ bio, skills: skillsArray })
          .eq('id', profileId);

        if (error) throw error;
      } else {
        // If profile doesn't exist, insert one
        const { error } = await supabase
          .from('profile')
          .insert({
            name: 'Tran Van Tuyen',
            university: 'Thuy Loi University (TLU)',
            roles: ['IT Student', 'Aspiring Business Analyst'],
            bio,
            skills: skillsArray
          });

        if (error) throw error;
      }
      setProfileSuccess('Profile updated successfully.');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!docFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!docCategory) {
      setUploadError('Please select a category.');
      return;
    }

    setUploadLoading(true);

    try {
      const fileExt = docFile.name.split('.').pop() || '';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Upload file to bucket
      const { error: uploadBucketError } = await supabase.storage
        .from('document_files')
        .upload(filePath, docFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadBucketError) throw uploadBucketError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('document_files')
        .getPublicUrl(filePath);

      // File metadata
      const format = fileExt.toUpperCase();
      const fileSize = docFile.size > 1024 * 1024
        ? `${(docFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(docFile.size / 1024).toFixed(1)} KB`;
      
      // Try inserting with 'downloadurl' as Postgres lowercases unquoted identifiers.
      let { error: insertError } = await supabase
        .from('documents')
        .insert({
          title: docTitle,
          category: docCategory,
          format,
          size: fileSize,
          downloadurl: publicUrl
        });
        
      // Fallback in case they explicitly named it download_url
      if (insertError && insertError.message.includes('downloadurl')) {
        const fallbackRes = await supabase
          .from('documents')
          .insert({
            title: docTitle,
            category: docCategory,
            format,
            size: fileSize,
            download_url: publicUrl
          });
        insertError = fallbackRes.error;
      }

      if (insertError) throw insertError;

      setUploadSuccess('Document uploaded and added to Resource Hub successfully.');
      setDocTitle('');
      setDocCategory('');
      setDocFile(null);
      // Reset file input in UI
      const fileInput = document.getElementById('docFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjError(null);
    setProjSuccess(null);
    setProjLoading(true);

    const techArray = projTechText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          title: projTitle,
          description: projDesc,
          technologies: techArray,
          type: projType,
          link: projLink
        });

      if (error) throw error;
      setProjSuccess('Project added successfully.');
      setProjTitle('');
      setProjDesc('');
      setProjTechText('');
      setProjType('');
      setProjLink('');
    } catch (err: any) {
      setProjError(err.message || 'Failed to add project.');
    } finally {
      setProjLoading(false);
    }
  };

  const handleDeleteDoc = async (id: string | number, fileUrl: string | undefined) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setDocsError(null);
    setDocsSuccess(null);
    try {
      if (fileUrl) {
        const urlParts = fileUrl.split('/document_files/');
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          await supabase.storage.from('document_files').remove([filePath]);
        }
      }

      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;

      setDocsSuccess('Document deleted successfully.');
      fetchDocuments(); 
    } catch (err: any) {
      setDocsError(err.message || 'Failed to delete document.');
    }
  };

  const handleEditClick = (doc: any) => {
    setEditDocId(doc.id);
    setEditDocTitle(doc.title);
    setEditDocCategory(doc.category as DocumentCategory);
    setShowEditModal(true);
  };

  const handleUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDocId) return;
    setEditDocLoading(true);
    setDocsError(null);
    setDocsSuccess(null);

    try {
      const { error } = await supabase
        .from('documents')
        .update({ title: editDocTitle, category: editDocCategory })
        .eq('id', editDocId);

      if (error) throw error;

      setDocsSuccess('Document updated successfully.');
      setShowEditModal(false);
      fetchDocuments();
    } catch (err: any) {
      setDocsError(err.message || 'Failed to update document.');
    } finally {
      setEditDocLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  // Not logged in UI
  if (!session) {
    return (
      <>
        <Helmet>
          <title>Admin Login | Portfolio-Web</title>
        </Helmet>
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="project-card p-4">
                <div className="text-center mb-4">
                  <span className="hero-subtitle text-uppercase">Restricted Access</span>
                  <h3 className="fw-bold text-light mt-2">Admin Login</h3>
                </div>

                {loginError && (
                  <Alert variant="danger" className="border-0 bg-opacity-10 bg-danger text-danger">
                    {loginError}
                  </Alert>
                )}

                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label className="text-secondary">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      placeholder="Enter admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="loginPassword">
                    <Form.Label className="text-secondary">Password</Form.Label>
                    <Form.Control
                      type="password"
                      required
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control"
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loginLoading}
                    style={{ background: 'var(--primary-gradient)', border: 'none', padding: '10px' }}
                  >
                    {loginLoading ? <Spinner size="sm" animation="border" /> : 'Log In'}
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  // Logged in UI
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Portfolio-Web</title>
      </Helmet>
      <Container className="py-5">
        <Row className="justify-content-between align-items-center mb-5">
          <Col xs="auto">
            <span className="hero-subtitle text-uppercase">Management Console</span>
            <h2 className="display-6 fw-bold mt-2" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Admin Dashboard
            </h2>
          </Col>
          <Col xs="auto">
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="project-card p-4">
              <Tabs defaultActiveKey="edit-profile" id="admin-tabs" className="custom-tabs mb-4">
                <Tab eventKey="edit-profile" title="Edit Profile">
                  {profileError && (
                    <Alert variant="danger" className="border-0 bg-opacity-10 bg-danger text-danger">
                      {profileError}
                    </Alert>
                  )}
                  {profileSuccess && (
                    <Alert variant="success" className="border-0 bg-opacity-10 bg-success text-success">
                      {profileSuccess}
                    </Alert>
                  )}

                  <Form onSubmit={handleProfileSubmit} className="mt-3">
                    <Form.Group className="mb-3" controlId="profileName">
                      <Form.Label className="text-secondary">Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value="Tran Van Tuyen"
                        disabled
                        className="bg-dark text-white border-secondary bg-opacity-50"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="profileBio">
                      <Form.Label className="text-secondary">Bio / Summary</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="form-control"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="profileSkills">
                      <Form.Label className="text-secondary">Skills (Comma-separated)</Form.Label>
                      <Form.Control
                        type="text"
                        value={skillsText}
                        onChange={(e) => setSkillsText(e.target.value)}
                        className="form-control"
                        required
                      />
                      <Form.Text className="text-muted">
                        Separate multiple skills with commas (e.g. React, Node.js, Python).
                      </Form.Text>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={profileLoading}
                      style={{ background: 'var(--primary-gradient)', border: 'none', padding: '10px' }}
                    >
                      {profileLoading ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="upload-doc" title="Upload Document">
                  {uploadError && (
                    <Alert variant="danger" className="border-0 bg-opacity-10 bg-danger text-danger">
                      {uploadError}
                    </Alert>
                  )}
                  {uploadSuccess && (
                    <Alert variant="success" className="border-0 bg-opacity-10 bg-success text-success">
                      {uploadSuccess}
                    </Alert>
                  )}

                  <Form onSubmit={handleUploadSubmit} className="mt-3">
                    <Form.Group className="mb-3" controlId="docTitle">
                      <Form.Label className="text-secondary">Document Title</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter document title"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="form-control"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="docCategory">
                      <Form.Label className="text-secondary">Category</Form.Label>
                      <Form.Select
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                        className="custom-select"
                        required
                      >
                        <option value="">Select category...</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="docFile">
                      <Form.Label className="text-secondary">Select File</Form.Label>
                      <Form.Control
                        type="file"
                        className="form-control"
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setDocFile(e.target.files[0]);
                          }
                        }}
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={uploadLoading}
                      style={{ background: 'var(--primary-gradient)', border: 'none', padding: '10px' }}
                    >
                      {uploadLoading ? <Spinner size="sm" animation="border" /> : 'Upload & Add to Hub'}
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="add-project" title="Add Project">
                  {projError && (
                    <Alert variant="danger" className="border-0 bg-opacity-10 bg-danger text-danger mt-3">
                      {projError}
                    </Alert>
                  )}
                  {projSuccess && (
                    <Alert variant="success" className="border-0 bg-opacity-10 bg-success text-success mt-3">
                      {projSuccess}
                    </Alert>
                  )}

                  <Form onSubmit={handleProjectSubmit} className="mt-3">
                    <Form.Group className="mb-3" controlId="projTitle">
                      <Form.Label className="text-secondary">Project Title</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter project title"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        className="form-control"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="projDesc">
                      <Form.Label className="text-secondary">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter project description"
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        className="form-control"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="projTech">
                      <Form.Label className="text-secondary">Technologies (Comma-separated)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="React, TypeScript, Bootstrap"
                        value={projTechText}
                        onChange={(e) => setProjTechText(e.target.value)}
                        className="form-control"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="projType">
                      <Form.Label className="text-secondary">Project Type</Form.Label>
                      <Form.Select
                        value={projType}
                        onChange={(e) => setProjType(e.target.value)}
                        className="custom-select"
                        required
                      >
                        <option value="">Select type...</option>
                        {projectTypes.map((type, idx) => (
                          <option key={idx} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="projLink">
                      <Form.Label className="text-secondary">Project Link</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://github.com/..."
                        value={projLink}
                        onChange={(e) => setProjLink(e.target.value)}
                        className="form-control"
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={projLoading}
                      style={{ background: 'var(--primary-gradient)', border: 'none', padding: '10px' }}
                    >
                      {projLoading ? <Spinner size="sm" animation="border" /> : 'Add Project'}
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="manage-docs" title="Manage Documents">
                  {docsError && (
                    <Alert variant="danger" className="border-0 bg-opacity-10 bg-danger text-danger mt-3">
                      {docsError}
                    </Alert>
                  )}
                  {docsSuccess && (
                    <Alert variant="success" className="border-0 bg-opacity-10 bg-success text-success mt-3">
                      {docsSuccess}
                    </Alert>
                  )}

                  <div className="mt-4 table-responsive">
                    {docsLoading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      <Table className="custom-table" hover>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.length > 0 ? documents.map(doc => (
                            <tr key={doc.id}>
                              <td className="text-body fw-semibold align-middle">{doc.title}</td>
                              <td className="align-middle text-body">{doc.category}</td>
                              <td className="text-end">
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(doc)}>
                                  Edit
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteDoc(doc.id, doc.downloadUrl || doc.downloadurl || doc.download_url)}>
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={3} className="text-center text-secondary py-3">No documents found.</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} contentClassName="bg-body text-body">
        <Form onSubmit={handleUpdateDoc}>
          <Modal.Header closeButton className="border-secondary border-opacity-25">
            <Modal.Title>Edit Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="text-secondary">Document Title</Form.Label>
              <Form.Control
                type="text"
                required
                value={editDocTitle}
                onChange={(e) => setEditDocTitle(e.target.value)}
                className="form-control"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-secondary">Category</Form.Label>
              <Form.Select
                required
                value={editDocCategory}
                onChange={(e) => setEditDocCategory(e.target.value as DocumentCategory)}
                className="custom-select"
              >
                <option value="">Select category...</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-secondary border-opacity-25">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={editDocLoading} style={{ background: 'var(--primary-gradient)', border: 'none' }}>
              {editDocLoading ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Admin;
