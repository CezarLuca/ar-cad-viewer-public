import "three";

declare module "three" {
    interface WebGLRenderer {
        /**
         * Makes the WebGL context XR-compatible.
         */
        makeXRCompatible(): Promise<void>;
    }
}
