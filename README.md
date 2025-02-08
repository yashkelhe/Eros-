# AI-Powered Code Comprehension Platform

![Project Banner](https://via.placeholder.com/1200x400?text=AI+Code+Analysis+Tool+Demo)  
_Accelerating developer onboarding through intelligent codebase analysis_

## 🚀 Overview

A full-stack platform designed to help developers rapidly understand complex codebases using AI-driven semantic analysis. Built with the **T3 Stack** (Next.js, TypeScript, tRPC, Prisma) and powered by modern AI/ML workflows, this tool transforms GitHub repositories into searchable knowledge bases through vector embeddings and Retrieval-Augmented Generation (RAG).

## ✨ Core Features

- **Smart Code Analysis**  
  Integrates with GitHub repositories via Octokit, processing code files into semantic vector embeddings using Google's Gemini API for contextual understanding.

- **Natural Language Q&A**  
  Leverages LangChain and RAG architecture to answer technical questions by retrieving relevant code snippets from vector databases and generating human-readable explanations.

- **Real-Time Processing**

  - Secure file handling with Firebase Storage
  - Audio transcription support via AssemblyAI
  - Progress tracking for AI analysis workflows

- **Enterprise-Grade Infrastructure**
  - Type-safe API layer with tRPC
  - Authentication via Clerk
  - PostgreSQL database with Prisma ORM
  - Subscription management with Stripe

## 📦 Tech Stack

**Core Framework**  
[![T3 Stack](https://avatars.githubusercontent.com/u/85960715?s=48&v=4)](https://create.t3.gg/)  
Next.js | TypeScript | tRPC | Prisma | Tailwind CSS

**AI/ML Ecosystem**  
[![LangChain](https://avatars.githubusercontent.com/u/105877363?s=48&v=4)](https://www.langchain.com/)  
LangChain | Gemini API | OpenAI | AssemblyAI

**Services**  
[![Clerk](https://clerk.com/favicon/favicon-32x32.png)](https://clerk.com/)  
PostgreSQL | Firebase | Clerk | Stripe

## 🛠️ Getting Started

### Prerequisites

- Node.js v18+
- Bun package manager (`curl -fsSL https://bun.sh/install | bash`)
- PostgreSQL database
- API keys for:
  - Google Gemini
  - Clerk
  - Firebase
  - AssemblyAI
  - Stripe

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ai-code-analyzer.git
cd ai-code-analyzer

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Fill your API keys in .env

# Initialize database
bun prisma migrate dev
bun prisma db push

# Start development server
bun dev
```
