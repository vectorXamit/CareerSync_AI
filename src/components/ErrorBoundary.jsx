import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.warn('Render error caught by boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="fixed inset-0 bg-black" />
    }
    return this.props.children
  }
}