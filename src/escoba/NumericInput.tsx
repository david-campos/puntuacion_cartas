import React from "react";
import "./NumericInput.scss";

interface NumericInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}

export default class NumericInput extends React.Component<NumericInputProps> {
    get isPlusEnabled(): boolean {
        return this.props.max === undefined || this.props.value < this.props.max;
    }

    get isMinusEnabled(): boolean {
        return this.props.min === undefined || this.props.value > this.props.min;
    }

    plus() {
        if (this.isPlusEnabled) {
            this.props.onChange(this.props.value + 1);
        }
    }

    minus() {
        if (this.isMinusEnabled) {
            this.props.onChange(this.props.value - 1);
        }
    }
    render() {
        return (<div className="NumericInput">
            <button className="secondary"
                    disabled={!this.isMinusEnabled}
                    onClick={() => this.props.onChange(this.props.value - 1)}>
                <i className="fas fa-minus"/>
            </button>
            <span className="value">{this.props.value.toString(10)}</span>
            <button className="secondary"
                    disabled={!this.isPlusEnabled}
                    onClick={() => this.props.onChange(this.props.value + 1)}>
                <i className="fas fa-plus"/>
            </button>
        </div>);
    }
}
