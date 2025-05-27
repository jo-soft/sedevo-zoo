import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-model-viewer',
  templateUrl: './model-viewer.component.html',
  styleUrl: './model-viewer.component.css'
})
export class ModelViewerComponent implements AfterViewInit {

  @Input({ required: true}) public path!: string;
  @Input() public width = 300;
  @Input() public height = 300;
  public errorMsg: string | null = null;

  @ViewChild('rendererContainer', { static: true }) private rendererContainer!: ElementRef;
  private scene!: THREE.Scene;

  public ngAfterViewInit(): void {
    if(this.path) {
      this.initThree();
    }
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFAFAFA)

    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();

    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(this.width, this.height);
    this.rendererContainer.nativeElement.appendChild(renderer.domElement);

    const controls: OrbitControls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', () => {
      renderer.render(this.scene, camera);
    });
    controls.enableZoom = true
    controls.update();

    new GLTFLoader()
    .load(this.path, (gltf: GLTF) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      this.scene.add(model);

      // ensure model-viewer is always visible
      const box: THREE.Box3 = new THREE.Box3().setFromObject(model);
      const size: number = box.getSize(new THREE.Vector3()).length();
      const center: THREE.Vector3 = box.getCenter(new THREE.Vector3());

      const distance: number = size / 2 / Math.tan(camera.fov * Math.PI / 360);

      camera.position.set(distance / 2, distance / 2, distance);
      camera.lookAt(center);

      const axesHelper: THREE.AxesHelper = new THREE.AxesHelper( 15 );
      this.scene.add( axesHelper );

      const ambientLight = new THREE.AmbientLight(0xFAFAFA);
      this.scene.add(ambientLight);

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(this.scene, camera);
      };
      animate();

    }, undefined, (error: unknown) => {
      this.errorMsg = `${error}`;
    });
  }

}
