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
            return (
            <div className="errorBoundaryContainer">
                <p className="componentText errorMessage">An error has occurred. {this.state.error.message}</p>
                <p className="componentText errorInstructions">If the button below does not work, please restart the application</p>
                <div className="buttonDiv">
                    <button className="button backButton" type="button" onClick={this.props.onClickHandler}>
                        <span className="componentText buttonText">Return To Home Page</span>
                    </button>
                </div>
            </div>
            )
        } else {
            return (this.props.children);
        }
    }
      
} 