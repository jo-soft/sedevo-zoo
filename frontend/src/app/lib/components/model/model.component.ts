import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrl: './model.component.css'
})
export class ModelViewerComponent implements AfterViewInit {

  @Input({ required: true}) public path!: string;
  @Input() public width: number = 300;
  @Input() public height: number = 300;
  public errorMsg: string | null = null;


  @ViewChild('rendererContainer', { static: true }) private rendererContainer!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private loader: GLTFLoader;


  public constructor () {
    this.loader = new GLTFLoader()

  }

  public ngAfterViewInit(): void {
    this.initThree();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFAFAFA)

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(3, 3, 1);

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Initialize OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', () => {
      this.renderer.render(this.scene, this.camera);
    });
    this.controls.enableZoom = true
    this.controls.update();

    this.loader.load(this.path, (gltf: GLTF) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      this.scene.add(model);

      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xFAFAFA);
      this.scene.add(ambientLight);

      // Start the animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      };
      animate();

    }, undefined, (error: unknown) => {
      this.errorMsg = `${error}`;
    });
  }


}
