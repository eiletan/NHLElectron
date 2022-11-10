import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError:false}
    }


    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error };
    }

    componentDidCatch(error, errorInfo) {
        console.log(error);
        console.log(errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (<div>
                <span>An error has occurred. {this.state.error.message}</span>
            </div>)
        } else {
            return (this.props.children);
        }
    }
      
} 