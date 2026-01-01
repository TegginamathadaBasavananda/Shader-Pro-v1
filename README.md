<div align="center">

# Shader Pro v1

**A professional styling studio for digital product assets.**

<a href="https://dovvnloading.github.io/Shader-Pro-v1/">
  <img src="https://img.shields.io/badge/Launch_Application-000000?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Launch App" />
</a>

<br />
<br />

<img width="100%" alt="Shader Pro Interface" src="https://github.com/user-attachments/assets/78dd6848-a842-497c-9f3b-893a32d3f4c5" />

<br />

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

</div>

## Overview

Shader Pro is a client-side web application designed to streamline the creation of high-quality product marketing assets. It provides a real-time composition environment where users can upload screenshots or product images and apply sophisticated styling effects including glassmorphism, directional lighting, and multi-layered shadowing.

The application operates entirely within the browser, ensuring zero latency and complete privacy for uploaded assets. It features a batch processing engine capable of styling and exporting multiple images simultaneously.

## Interface Showcase

<div align="center">
  <img width="100%" alt="Shader Pro Light Mode" src="https://github.com/user-attachments/assets/090229ee-9f85-4446-8ee5-fd3743868294" />
</div>

## Key Capabilities

### Rendering Engine
*   **Dual-Layer Shadows:** Configurable primary and secondary shadow layers for depth simulation (Drop Shadow or Box Shadow modes).
*   **Directional Lighting:** Global light source control with interactive on-screen manipulation.
*   **Glassmorphism:** Real-time backdrop blur and transparency processing.
*   **Smart Layouts:** Automated aspect ratio resizing and scale fitting.

### Batch Processing
*   **Multi-File Support:** Upload and process dozens of images in a single session.
*   **State Persistence:** Styling settings persist across the entire batch.
*   **ZIP Export:** Automated archiving of processed assets into a single downloadable ZIP file.

### Customization
*   **Cutout Mode:** Specialized rendering for transparent PNGs (logos, isolated products).
*   **Card Mode:** Standard containerized rendering for screenshots and UI mocks.
*   **Granular Control:** Pixel-perfect control over border radius, stroke width, opacity, and color gradients.

## Technical Architecture

The application is built on a modern React 19 stack, leveraging Vite for build tooling and TypeScript for type safety.

*   **Framework:** React 19 (Hooks-based architecture)
*   **Styling:** Tailwind CSS (Utility-first with dark mode support)
*   **Imaging:** `html-to-image` for canvas rasterization
*   **Compression:** `jszip` for client-side batch archiving
*   **Icons:** Lucide React

## Local Development

To run this project locally, follow these steps:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/dovvnloading/Shader-Pro-v1.git
    cd Shader-Pro-v1
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## License

This project is open source and available under the MIT License.
