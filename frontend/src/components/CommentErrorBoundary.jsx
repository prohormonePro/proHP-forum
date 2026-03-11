import { Component } from 'react';

export default class CommentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('Comment section error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="prohp-card p-6 mb-4 text-center border border-red-500/20">
          <p className="text-sm text-red-400 mb-2">Discussion section encountered an error.</p>
          <button onClick={() => this.setState({ hasError: false })}
                  className="text-xs text-prohp-400 hover:text-prohp-300">Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
