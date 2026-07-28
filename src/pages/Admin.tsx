import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
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
            roles: ['IT Student', 'Aspiring Business Analyst', 'Machine Learning Enthusiast'],
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
      // Insert row to documents table
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          title: docTitle,
          category: docCategory,
          format,
          size: fileSize,
          downloadUrl: publicUrl
        });

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
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Admin;
