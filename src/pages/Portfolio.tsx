import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { projectsData as mockProjects, type Project } from '../data/projects';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
};

export const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .order('id', { ascending: true });

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          setProjects(data as Project[]);
        } else {
          setProjects(mockProjects);
        }
      } catch (err: any) {
        console.error('Error fetching projects from Supabase:', err);
        setError(err.message || 'Failed to load projects from database.');
        setProjects(mockProjects);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <>
      <Helmet>
        <title>Portfolio | Tran Van Tuyen</title>
      </Helmet>
      <Container className="py-5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-5"
        >
          <span className="hero-subtitle text-uppercase">My Work</span>
          <h2 className="display-5 fw-bold mt-2 mb-3" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Featured Projects
          </h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            A showcase of selected academic, team, and personal software engineering projects.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Loading projects...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="warning" className="mb-4 text-center border-0 bg-opacity-10 bg-warning text-warning">
                Running in fallback mode: {error}
              </Alert>
            )}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
            >
              <Row className="g-4">
                {projects.map((project) => (
                  <Col lg={4} md={6} key={project.id}>
                    <motion.div variants={cardVariants} className="h-100">
                      <Card className="project-card d-flex flex-column h-100">
                        <Card.Body className="d-flex flex-column p-4">
                          <div className="mb-3">
                            <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2.5 py-1.5" style={{ fontSize: '0.75rem' }}>
                              {project.type}
                            </Badge>
                          </div>
                          <Card.Title className="mb-3">{project.title}</Card.Title>
                          <Card.Text className="flex-grow-1 text-secondary mb-4" style={{ fontSize: '0.95rem' }}>
                            {project.description}
                          </Card.Text>
                          <div className="mt-auto">
                            <div className="d-flex flex-wrap gap-1.5 mb-3">
                              {project.technologies && project.technologies.map((tech, idx) => (
                                <Badge key={idx} bg="secondary" className="bg-opacity-25 text-body" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                            <Card.Link
                              href={project.link}
                              className="btn btn-outline-primary btn-sm w-100 border-secondary text-secondary"
                              style={{ transition: 'all 0.2s' }}
                            >
                              View Details
                            </Card.Link>
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          </>
        )}
      </Container>
    </>
  );
};

export default Portfolio;
