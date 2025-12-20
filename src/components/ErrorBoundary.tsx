'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850">
          <div className="text-center max-w-md px-4">
            <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-slate-400 mb-8">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-xl hover:from-rose-800 hover:to-rose-700 transition-all shadow-lg shadow-rose-900/30"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
