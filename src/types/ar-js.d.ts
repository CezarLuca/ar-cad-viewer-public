declare module "@ar-js-org/ar.js-threejs" {
    import { WebGLRenderer, Object3D, Matrix4 } from "three";

    export namespace THREEx {
        // More specific parameter types
        interface ArControllerParameters {
            cameraParametersUrl: string;
            detectionMode?: string;
            matrixCodeType?: string;
            patternRatio?: number;
            labelingMode?: string;
            debug?: boolean;
            maxDetectionRate?: number;
            canvasWidth?: number;
            canvasHeight?: number;
        }

        interface ArController {
            process(image: HTMLVideoElement): void;
            getCameraMatrix(): Matrix4;
        }

        // Base interfaces for AR.js components
        interface IArToolkitContext {
            parameters: ArControllerParameters;
            arController: ArController;
            _artoolkitProjectionAxisTransformMatrix: Matrix4;
            dispatchEvent: (event: Event) => void;
            process(): void;
            render(): void;
        }

        // Configuration interfaces
        interface ArSceneConfig {
            renderer: WebGLRenderer;
            source: HTMLVideoElement;
            cameraParametersUrl: string;
            sourceWidth: number;
            sourceHeight: number;
            displayWidth: number;
            displayHeight: number;
        }

        interface MarkerControlsConfig {
            type: string;
            patternUrl: string;
            size: number;
        }

        // Event interfaces
        interface MarkerEvent {
            data: {
                matrix: Matrix4;
            };
        }

        // Implementation classes
        class ArScene implements IArToolkitContext {
            parameters: ArControllerParameters;
            arController: ArController;
            _artoolkitProjectionAxisTransformMatrix: Matrix4;
            dispatchEvent: (event: Event) => void;

            constructor(config: ArSceneConfig);
            renderer: WebGLRenderer;
            process(): void;
            render(): void;
        }

        class ArMarkerControls {
            constructor(
                context: IArToolkitContext,
                object3d: Object3D,
                parameters: MarkerControlsConfig
            );
            addEventListener(
                event: "markerFound",
                callback: (event: MarkerEvent) => void
            ): void;
            addEventListener(event: "markerLost", callback: () => void): void;
        }
    }
}
