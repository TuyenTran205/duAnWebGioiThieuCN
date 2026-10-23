import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { soundEngine } from '../lib/soundEngine';

// 3D Simplex noise algorithm (Ian McEwan, Stefan Gustavson)
const simplexNoise3D = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseSpeed;
uniform float uNoiseFrequency;
uniform float uNoiseAmplitude;
uniform float uShockwave;
uniform float uScrollProgress;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;
varying vec3 vEyeVector;

${simplexNoise3D}

void main() {
  vNormal = normalize(normalMatrix * normal);

  vec3 pos = position;
  float mouseDist = distance(uv, uMouse * 0.5 + 0.5);
  float mouseInfluence = smoothstep(0.85, 0.0, mouseDist) * uMouseSpeed * 1.65;

  // Radial shockwave ripple when user clicks
  float waveRing = sin(length(pos.xy - uMouse * 1.2) * 10.0 - uTime * 9.0) * uShockwave * 0.28;

  // Hyperwave high-amplitude Simplex Noise configuration
  float noise = snoise(pos * uNoiseFrequency + vec3(uTime * 0.36));
  float noiseDetail = snoise(pos * (uNoiseFrequency * 2.15) - vec3(uTime * 0.52)) * 0.48;
  float totalNoise = (noise + noiseDetail) * (uNoiseAmplitude + mouseInfluence) + waveRing;

  vec3 newPosition = pos + normal * totalNoise;

  vNoise = totalNoise;
  vPosition = newPosition;

  vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
  vEyeVector = normalize(cameraPosition - worldPosition.xyz);

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uFresnelPower;
uniform vec3 uLightCore;
uniform vec3 uLightGlow;
uniform vec3 uLightHighlight;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;
varying vec3 vEyeVector;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 eye = normalize(vEyeVector);

  // Fresnel rim calculation
  float fresnel = pow(1.0 - max(dot(eye, normal), 0.0), uFresnelPower);

  // Dual studio lighting
  vec3 lightDir1 = normalize(vec3(1.4, 1.8, 2.2));
  float diff1 = max(dot(normal, lightDir1), 0.0);

  vec3 reflectDir = reflect(-lightDir1, normal);
  float spec = pow(max(dot(eye, reflectDir), 0.0), 36.0);

  // Light Mode porcelain + cobalt royal blue wireframe mesh shading
  vec3 lightColor = mix(uLightCore, uLightGlow, smoothstep(-0.38, 0.42, vNoise));
  lightColor = mix(lightColor, uLightHighlight, fresnel * 0.92);
  lightColor += vec3(1.0) * (diff1 * 0.22 + spec * 0.95);
  
  // Cobalt rim definition for high contrast on light alabaster background
  lightColor = mix(lightColor, vec3(0.10, 0.18, 0.98), pow(fresnel, 1.8) * 0.6);

  gl_FragColor = vec4(lightColor, 0.96);
}
`;

export const OrganicSphereCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const shockwaveRef = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      44,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4.35);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Studio lights for floating 3D Lusion-style connectors
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.6);
    dirLight1.position.set(4, 5, 5);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x1a2ffb, 1.8);
    dirLight2.position.set(-4, -3, 3);
    scene.add(dirLight2);

    // --- CENTRAL HYPERWAVE WIREFRAME 3D SPHERE ---
    // Hyperwave preset configuration: frequency = 0.68, amplitude = 0.52, fresnel = 2.1, wireframe = ALWAYS TRUE
    const geometry = new THREE.IcosahedronGeometry(1.35, 48);

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseSpeed: { value: 0 },
      uNoiseFrequency: { value: 0.68 },
      uNoiseAmplitude: { value: 0.52 },
      uFresnelPower: { value: 2.1 },
      uShockwave: { value: 0 },
      uScrollProgress: { value: 0 },
      uLightCore: { value: new THREE.Color('#d8e0f8') },
      uLightGlow: { value: new THREE.Color('#1a2ffb') },
      uLightHighlight: { value: new THREE.Color('#ffffff') }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      wireframe: true, // MESH ALWAYS ON
      transparent: true
    });
    materialRef.current = material;

    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);

    // --- FLOATING 3D CONNECTORS (Cobalt Blue Torus Nodes) ---
    const connectorsGroup = new THREE.Group();
    scene.add(connectorsGroup);

    const connectorMat = new THREE.MeshStandardMaterial({
      color: '#1a2ffb',
      metalness: 0.35,
      roughness: 0.18,
      wireframe: true // Consistent wireframe aesthetic
    });

    const torusGeo = new THREE.TorusGeometry(0.12, 0.045, 12, 24);
    const satellites: {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      phase: number;
      rotSpeed: THREE.Vector3;
    }[] = [];

    const satPositions = [
      new THREE.Vector3(-2.1, 1.05, -0.4),
      new THREE.Vector3(2.15, 0.9, -0.2),
      new THREE.Vector3(-1.85, -1.1, 0.3),
      new THREE.Vector3(1.95, -1.0, 0.2),
      new THREE.Vector3(0.15, 1.65, -0.6),
      new THREE.Vector3(-0.3, -1.62, -0.5)
    ];

    satPositions.forEach((pos, idx) => {
      const mesh = new THREE.Mesh(torusGeo, connectorMat);
      mesh.position.copy(pos);
      mesh.rotation.set(idx * 0.7, idx * 1.1, 0);
      connectorsGroup.add(mesh);
      satellites.push({
        mesh,
        basePos: pos.clone(),
        phase: idx * 1.35,
        rotSpeed: new THREE.Vector3(0.6 + idx * 0.1, 0.8 - idx * 0.08, 0.4)
      });
    });

    // --- AMBIENT PARTICLE FIELD ---
    const particleCount = 420;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.75 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x1a2ffb,
      size: 0.024,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // --- MOUSE, SCROLL & DRAG TRACKING ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, lastX: 0, lastY: 0, speed: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        mouse.targetX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.targetY = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // --- ANIMATION LOOP (1X SPEED) ---
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime() * 1.0; // 1X SPEED

      // Smooth mouse inertia
      mouse.x += (mouse.targetX - mouse.x) * 0.055;
      mouse.y += (mouse.targetY - mouse.y) * 0.055;

      const dx = mouse.x - mouse.lastX;
      const dy = mouse.y - mouse.lastY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy) * 13;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      // Decay click shockwave smoothly
      shockwaveRef.current = THREE.MathUtils.lerp(shockwaveRef.current, 0, 0.05);

      uniforms.uTime.value = elapsed;
      uniforms.uMouse.value.set(mouse.x, mouse.y);
      uniforms.uMouseSpeed.value = THREE.MathUtils.lerp(uniforms.uMouseSpeed.value, mouse.speed, 0.12);
      uniforms.uShockwave.value = shockwaveRef.current;

      // Scroll-reactive rotation & subtle camera parallax
      const scrollY = window.scrollY || 0;
      const scrollRatio = Math.min(scrollY / 900, 1.5);
      uniforms.uScrollProgress.value = scrollRatio;

      sphereMesh.rotation.y = elapsed * 0.14 + mouse.x * 0.38 + scrollRatio * 0.65;
      sphereMesh.rotation.x = mouse.y * 0.28 + scrollRatio * 0.3;
      sphereMesh.position.x = mouse.x * 0.22;
      sphereMesh.position.y = mouse.y * 0.2 - scrollRatio * 0.15;

      // Animate floating 3D satellites with cursor repulsion + shockwave burst
      satellites.forEach((sat) => {
        sat.mesh.rotation.x += sat.rotSpeed.x * dt;
        sat.mesh.rotation.y += sat.rotSpeed.y * dt;

        const floatY = Math.sin(elapsed * 1.1 + sat.phase) * 0.14;
        const floatX = Math.cos(elapsed * 0.85 + sat.phase) * 0.1;

        const cursorWorldX = mouse.x * 2.2;
        const cursorWorldY = mouse.y * 1.6;
        const distToCursor = Math.hypot(sat.basePos.x - cursorWorldX, sat.basePos.y - cursorWorldY);
        const repel = Math.max(0, 1.2 - distToCursor) * 0.35;
        const angle = Math.atan2(sat.basePos.y - cursorWorldY, sat.basePos.x - cursorWorldX);

        const burst = shockwaveRef.current * 0.45;

        sat.mesh.position.x = sat.basePos.x + floatX + Math.cos(angle) * (repel + burst);
        sat.mesh.position.y = sat.basePos.y + floatY + Math.sin(angle) * (repel + burst);
      });

      particles.rotation.y = -elapsed * 0.045;
      particles.rotation.x = elapsed * 0.025 + scrollRatio * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      torusGeo.dispose();
      connectorMat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  const triggerShockwave = () => {
    shockwaveRef.current = 1.6;
    soundEngine.playClick();
  };

  return (
    <div
      className="relative w-full h-full select-none"
      onClick={triggerShockwave}
    >
      {/* 3D WebGL Canvas Viewport - Clean without any HUD overlay */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-auto cursor-pointer" />
    </div>
  );
};
