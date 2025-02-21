# Aztec Auto Glass System

This is a **multi-tenant** Next.js project for **Aztec Auto Glass**, featuring customer management, invoicing, and automated email sending with dynamically generated PDFs.

## Table of Contents

- [Aztec Auto Glass System](#aztec-auto-glass-system)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)

---

## Features

- **Form Handling**: Built with `react-hook-form` and `zod` for validation.
- **State Management**: Uses `Redux Toolkit` for global state management.
- **Responsive Design**: Mobile-first approach with responsive components.
- **Dynamic Routing**: Leverages Next.js dynamic routing for seamless navigation.
- **API Integration**: Built-in API routes for server-side functionality.
- **Custom Hooks**: Reusable hooks for common functionality like detecting mobile devices.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

---

## Setup

Follow these steps to set up the project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Misael-E/autolinkproV2.git
   cd autolinkproV2
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set Up Environment Variables**:
   - Create a .env.local file in the root directory.
   - Add the required environment variables. For example:
   ```
   NEXT_PUBLIC_API_URL=https://api.example.com
   DATABASE_URL=your-database-url
   ```
