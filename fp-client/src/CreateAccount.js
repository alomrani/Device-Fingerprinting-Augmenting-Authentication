import React, {
    Component
} from 'react';
import './App.css';
import Fingerprint2 from './fingerprint2.js';
// Main app
class CreateAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: true,
            redirect: false
        };
        // Bindings
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleRemount = this.handleRemount.bind(this);
    }
    handleSubmit(e) {
        e.preventDefault();
        this.setState({
            isVisible: false
        }, function() {
            console.log(this.state.isVisible)
        });
        return false;
    }
    handleRemount(e) {
        this.setState({
            isVisible: true
        }, function() {
            console.log(this.state.isVisible)
        });
        e.preventDefault();
    }
    sendFingerprint(e) {
        e.preventDefault();
        const username = document.querySelector("#username");
        const password = document.querySelector("#password");
        const post = new XMLHttpRequest();
        post.open("POST", "http://localhost:3001/auth/login", false);
        post.setRequestHeader('Content-Type', 'application/json');
        let fingerprints = [];
        Fingerprint2.get(
            function (components) {
                post.send(JSON.stringify({
                    username: username.value,
                    password: password.value,
                    fingerprints: components
                }));
            }
        );
    }
    render() {

        // const for React CSS transition declaration
        let component = this.state.isVisible ? <Modal onSubmit={this.sendFingerprint} key='modal'/> : <ModalBack onClick={ this.handleRemount } key='bringitback'/>;

        return component;

    }
}

// Modal
class Modal extends React.Component {
    render() {
        return<div className='Modal'>
            <Logo />
            <form onSubmit= { this.props.onSubmit }>
                <Input type='email' id='username' placeholder='email' required/>
                <Input type='password' id='password' placeholder='password' />
                <Input type='password' id='confirmPassword' placeholder='Confirm Password' />
                <button> Create an Account</button>
            </form>
        </div>
    }
}

// Generic input field
class Input extends React.Component {
    render() {
        return <div className='Input'>
            <input type={ this.props.type } id={ this.props.id } name={ this.props.name } placeholder={ this.props.placeholder } required autocomplete='false'/>
            <label for={ this.props.name } ></label>
        </div>
    }

}

// Fake logo
class Logo extends React.Component {
    render() {
        return <div className="logo">
            <i className="fa fa-bug" aria-hidden="true"></i>
            <span> awesome logo </span>
        </div>
    }
}

// Button to brind the modal back
class ModalBack extends React.Component {
    render() {
        return <button className="bringitback" onClick={ this.props.onClick } key={ this.props.className }>Brind the modal back !</button>
    }
}

export default CreateAccount;