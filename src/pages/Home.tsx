import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { userProfile as mockProfile, type Profile } from '../data/profile';

export const Home: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('profile')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          setProfile(data as Profile);
        } else {
          setProfile(mockProfile);
        }
      } catch (err: any) {
        console.error('Error fetching profile from Supabase:', err);
        setError(err.message || 'Failed to load profile from database.');
        setProfile(mockProfile);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      <Helmet>
        <title>Tran Van Tuyen | Portfolio</title>
      </Helmet>
      <Container className="py-5">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Loading profile...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="warning" className="mb-4 text-center border-0 bg-opacity-10 bg-warning text-warning">
                Running in fallback mode: {error}
              </Alert>
            )}

            {profile && (
              <>
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="py-4 py-lg-5"
                >
                  <Row className="justify-content-center text-center">
                    <Col lg={8} md={10}>
                      <div className="mb-4">
                        <span className="hero-subtitle text-uppercase">Welcome to My Space</span>
                      </div>
                      <h1 className="hero-title mb-4">{profile.name}</h1>
                      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                        {profile.roles && profile.roles.map((role, idx) => {
                          const badgeColors = ['badge-blue', 'badge-purple', 'badge-pink', 'badge-orange', 'badge-green'];
                          const colorClass = badgeColors[idx % badgeColors.length];
                          return (
                            <Badge
                              key={idx}
                              bg="transparent"
                              className={`badge-pastel ${colorClass} px-3 py-2`}
                              style={{ fontSize: '0.85rem' }}
                            >
                              {role}
                            </Badge>
                          );
                        })}
                      </div>
                      <p className="lead text-secondary mb-5" style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>
                        {profile.bio}
                      </p>
                      <p className="text-secondary mb-0">
                        Currently studying at <strong>{profile.university}</strong>.
                      </p>
                    </Col>
                  </Row>
                </motion.div>

                <hr className="my-2 border-secondary" style={{ opacity: 0.08 }} />

                {/* Skills Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  className="py-4 py-lg-5"
                >
                  <Row className="justify-content-center">
                    <Col lg={8} md={10}>
                      <h3 className="text-center mb-4" style={{ fontWeight: 600 }}>
                        Technical Expertise
                      </h3>
                      <div className="d-flex flex-wrap justify-content-center gap-3">
                        {profile.skills && profile.skills.map((skill, idx) => {
                          const badgeColors = ['badge-blue', 'badge-green', 'badge-purple', 'badge-orange', 'badge-pink', 'badge-red', 'badge-gray'];
                          const colorClass = badgeColors[idx % badgeColors.length];
                          return (
                            <Badge key={idx} bg="transparent" className={`skill-badge badge-pastel ${colorClass} px-3 py-2`}>
                              {skill}
                            </Badge>
                          );
                        })}
                      </div>
                    </Col>
                  </Row>
                </motion.div>

                <hr className="my-2 border-secondary" style={{ opacity: 0.08 }} />

                {/* Contact Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                  className="py-4 py-lg-5"
                >
                  <Row className="justify-content-center">
                    <Col lg={8} md={10} className="text-center">
                      <h3 className="mb-4" style={{ fontWeight: 600 }}>
                        Contact Information
                      </h3>
                      <div className="d-flex flex-column align-items-center gap-2">
                        <div className="text-body" style={{ fontSize: '1.1rem' }}>
                          <span className="text-secondary me-2">Phone:</span> 
                          0376354782
                        </div>
                        <div className="text-body" style={{ fontSize: '1.1rem' }}>
                          <span className="text-secondary me-2">Email:</span> 
                          tranvantuyen2110.work@gmail.com
                        </div>
                      </div>
                    </Col>
                  </Row>
                </motion.div>
              </>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Home;
