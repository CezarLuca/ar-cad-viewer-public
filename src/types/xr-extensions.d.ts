// interface XRImageTrackingResult {
//     imageSpace: XRSpace;
//     trackingState: "tracked" | "emulated" | "not-tracked";
// }

declare global {
    interface XRFrame {
        getImageTrackingResults(): XRImageTrackingResult[];
    }
    interface XRRenderStateInit {
        domOverlay?: {
            root: HTMLElement | null;
        };
        trackedImages?: {
            image: ImageBitmap;
            widthInMeters: number;
        }[];
    }

    interface XRSessionInit {
        trackedImages?: XRTrackedImageInit[];
    }
    interface XRImageTrackingResult {
        readonly index: number;
        readonly trackingState: "tracked" | "emulated";
        readonly imageSpace: XRSpace;
    }
}

export {};
