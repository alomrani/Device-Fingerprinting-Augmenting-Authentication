import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./SignUp.css";
import Fingerprint2 from '../fingerprint2.js';
export default class SignUp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            confirmPassword: "",
            isLoading: false
        };
    }

    validateForm() {
        return (
            this.state.email.length > 0 &&
            this.state.password.length > 0 &&
            this.state.password === this.state.confirmPassword
        );
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    };

    handleSubmit = event => {
        event.preventDefault();
        const post = new XMLHttpRequest();
        post.open("POST", "http://localhost:3001/auth/register", false);
        post.setRequestHeader('Content-Type', 'application/json');
        let p = this.props;
        post.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let j = JSON.parse(this.responseText);
                if (j['status'] === 'success') {
                    p.history.push("/");
                }
            } else {
                p.history.push("/Error");
            }
        };
        let s = this.state;
        Fingerprint2.get(
            function (components) {
                try {
                    let f = {};
                    for (let i = 0; i < components.length; i++) {
                        const fingerprint_name = components[i]['key'];
                        const fingerprint_data = components[i]['value'];
                        f[fingerprint_name] = fingerprint_data;
                    }
                    post.send(JSON.stringify({
                        new: true,
                        device_type: "WEB",
                        username: s.email,
                        password: s.password,
                        fingerprints: f
                    }));
                } catch (e) {
                    p.history.push("/Error");
                }
            }
        );
    };

    render() {
        return (
            <div className="Signup">
            <form onSubmit={this.handleSubmit}>
                <FormGroup controlId="email" bsSize="large">
                    <ControlLabel>Email</ControlLabel>
                    <FormControl
                        autoFocus
                        type="email"
                        value={this.state.email}
                        onChange={this.handleChange}
                    />
                </FormGroup>
                <FormGroup controlId="password" bsSize="large">
                    <ControlLabel>Password</ControlLabel>
                    <FormControl
                        value={this.state.password}
                        onChange={this.handleChange}
                        type="password"
                    />
                </FormGroup>
                <FormGroup controlId="confirmPassword" bsSize="large">
                    <ControlLabel>Confirm Password</ControlLabel>
                    <FormControl
                        value={this.state.confirmPassword}
                        onChange={this.handleChange}
                        type="password"
                    />
                </FormGroup>
                <Button
                    block
                    bsSize="large"
                    disabled={!this.validateForm()}
                    type="submit"
                >
                    Sign Up
                </Button>
            </form>
            </div>
        );
    }

}