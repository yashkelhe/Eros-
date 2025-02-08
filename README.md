# AI-Powered Code Comprehension Platform

_Accelerating developer onboarding through intelligent codebase analysis_

## 🚀 Overview

A full-stack platform designed to help developers rapidly understand complex codebases using AI-driven semantic analysis. Built with the **T3 Stack** (Next.js, TypeScript, tRPC, Prisma) and powered by modern AI/ML workflows, this tool transforms GitHub repositories into searchable knowledge bases through vector embeddings and Retrieval-Augmented Generation (RAG).

## ✨ Core Features

- **Smart Code Analysis**  
  Integrates with GitHub repositories via Octokit, processing code files into semantic vector embeddings using Google's Gemini API for contextual understanding.

- **Natural Language Q&A**  
  Leverages LangChain and RAG architecture to answer technical questions by retrieving relevant code snippets from vector databases and generating human-readable explanations.

- **Real-Time Processing**

  - Secure file handling with Supabase Storage
  - Audio transcription support via AssemblyAI
  - Progress tracking for AI analysis workflows

- **Enterprise-Grade Infrastructure**
  - Type-safe API layer with tRPC
  - Authentication via Clerk
  - PostgreSQL database with Prisma ORM
  - Subscription management with Stripe

## 📦 Tech Stack

**Core Framework**
Next.js | TypeScript | tRPC | Prisma | Tailwind CSS

**AI/ML Ecosystem**  
LangChain | Gemini API | OpenAI | AssemblyAI

**Services**  
PostgreSQL | Firebase | Clerk | Stripe

## 🛠️ Getting Started

### Prerequisites

- Node.js v18+
- Bun package manager (`curl -fsSL https://bun.sh/install | bash`)
- PostgreSQL database
- API keys for:
  - Google Gemini
  - Clerk
  - supabase
  - AssemblyAI
  - Stripe

### Installation

```bash
# Clone repository
git clone https://github.com/yashkelhe/EROS-.git
cd eros-
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
