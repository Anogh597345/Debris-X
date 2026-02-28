import React from 'react';

export default class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    width: '100%', height: '100%', background: 'var(--bg-deep)',
                    color: 'var(--grey-300)', fontFamily: 'var(--font-ui)', gap: 12, padding: 24,
                }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--red)' }}>
                         Render Error
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--grey-500)', textAlign: 'center', maxWidth: 340 }}>
                        {String(this.state.error?.message || 'Component failed to render')}
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{ marginTop: 8, padding: '8px 20px', background: 'var(--red)', border: 'none', color: '#fff', borderRadius: 3, cursor: 'pointer', fontSize: 11, letterSpacing: 2, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
