# My AR CAD Viewer

## Overview

My AR CAD Viewer is an admin dashboard application designed for managing users and models in an augmented reality CAD viewer. The application provides functionalities for user management, model management, and a responsive design that adapts to different device sizes.

## Features

-   **User Management**: Admins can view, sort, and delete users.
-   **Model Management**: Admins can view, sort, and delete models.
-   **Responsive Design**: The tables for users and models are responsive, hiding specific columns based on device size.
-   **Expandable Rows**: Clickable rows that reveal additional information in a dropdown format.

## Project Structure

```
my-ar-cad-viewer
├── src
│   ├── app
│   │   ├── admin
│   │   ├── api
│   ├── components
│   └── lib
│       └── db.ts
├── package.json
├── tailwind.config.js
└── README.md
```

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

## Usage

To start the development server, run:

```
npm run dev
```

Visit `http://localhost:3000` in your browser to access the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
