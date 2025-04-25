# AR CAD Viewer

## Overview

AR CAD Viewer is an application that combines augmented reality with CAD model viewing capabilities. It allows users to view and interact with 3D CAD models, with an admin dashboard for managing users and models.

## Features

-   **3D Model Rendering**: View and interact with 3D CAD models in the browser
-   **Augmented Reality Support**: Experience CAD models in AR environment
-   **User Management**: Admins can view, sort, and delete users
-   **Model Management**: Admins can view, sort, and delete models
-   **Responsive Design**: Adapts to different device sizes for optimal viewing experience
-   **Expandable UI Elements**: Interactive UI with expandable components for additional information

## Technologies

-   Next.js
-   Three.js/React Three Fiber (for 3D rendering)
-   WebXR Image Tracking
-   TypeScript
-   Tailwind CSS

## Project Structure

my-ar-cad-viewer
├── public # Static assets
│ ├── markers # AR marker files
│ ├── models # 3D model assets
│ └── textures # Texture files for 3D models
├── src
│ ├── app
│ │ ├── admin # Admin dashboard pages
│ │ └── api # API routes
│ ├── components # Reusable components
│ ├── context # React context providers
│ └── middleware.ts # Next.js middleware
├── Engine.jsx # Main 3D engine component
├── engine-transformed.glb # Transformed 3D model
├── .env # Environment variables template
├── next.config.ts # Next.js configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── package.json # Project dependencies

## Installation

1. Clone the repository:
    ```
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```
    cd my-ar-cad-viewer
    ```
3. Install the dependencies:
    ```
    npm install
    ```
4. Create a `.env.local` file with required environment variables (see `.env` for reference)

## Usage

To start the development server, run:

npm run dev

Visit `http://localhost:3000` in your browser to access the application.

For AR features, ensure you're using a compatible device and browser with AR capabilities.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
