import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import Fingerprint2 from '../fingerprint2.js';
export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
        };
    }

    validateForm() {
        return this.state.email.length > 0 && this.state.password.length > 0;
    }

    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    };

    handleDelete = event => {
        event.preventDefault();
        const del = new XMLHttpRequest();
        del.open("DELETE", "http://localhost:3001/devices/", false);
        del.setRequestHeader('Content-Type', 'application/json');
        del.onreadystatechange = function () {
            let j = JSON.parse(this.responseText);
            if (this.readyState === 4 && this.status === 200) {
                if (j['status'] === true) {
                    console.log(j.message);
                    let radios = document.getElementsByName('device');
                    let device_id = -1;
                    for(let i = 0; i < radios.length; i++){
                        if (radios[i].checked) {
                            device_id = i;
                            break;
                        }
                    }
                    const entry = radios[device_id].parentElement.parentElement;
                    entry.parentNode.removeChild(entry);
                }
            } else {
                console.log(j.message);
            }
        };
        let s = this.state;
        let radios = document.getElementsByName('device');
        if (radios.length === 1) {
            return;
        }
        let device_id = -1;
        for(let i = 0; i < radios.length; i++){
            if (radios[i].checked) {
                device_id = radios[i].value;
                break;
            }
        }
        if(device_id === -1){
            return;
        }
        console.log(s.email);
        del.send(JSON.stringify({
            username: s.email,
            password: s.password,
            device_id: device_id
        }));
    };

    handleGet = () => {
        const req = new XMLHttpRequest();
        req.open("POST", "http://localhost:3001/devices/", false);
        req.setRequestHeader('Content-Type', 'application/json');
        let d = this.handleDelete;
        req.onreadystatechange = function() {
            var data = JSON.parse(this.responseText);
            const login = document.querySelector("#login");
            const pre = document.createElement("pre");
            const form = document.createElement("form");
            form.onsubmit = d;
            const p = document.createElement("p");
            p.appendChild(document.createTextNode("Your Devices:"));
            const table = document.createElement("table");
           // var text = "<pre><form onsubmit={d}><p>Your Devices:</p><table>"; //not doing handledelete :(
            for(let i = 0; i < data.length; i++){
                let tr = document.createElement("tr");
                let td = document.createElement("td");
                let input = document.createElement("input");
                input.type = "radio";
                input.value = `${data[i].toString()}`;
                input.name = "device";
               // text += "<tr><td><input type='radio' value='" + data[i] + "' name='device'>" + data[i] + "</td></tr>";
                td.appendChild(input);
                td.appendChild(document.createTextNode(data[i].toString()));
                tr.appendChild(td);
                table.appendChild(tr);
            }
            //text += "</table><input type='submit' value='Delete'></pre>";
            const deletebutton = document.createElement("input");
            deletebutton.type = "submit";
            deletebutton.value = "Delete";
            form.appendChild(p);
            form.appendChild(table);
            form.appendChild(deletebutton);
            pre.appendChild(form);
            login.appendChild(pre);
        };
        let s = this.state;
        req.send(JSON.stringify({
            username: s.email,
            password: s.password
        }));
    };

    handleSubmit = event => {
        event.preventDefault();
        let fingerprintlst = [];
        const post = new XMLHttpRequest();
        post.open("POST", "http://localhost:3001/auth/login", false);
        post.setRequestHeader('Content-Type', 'application/json');
        let p = this.props;
        let t = this.handleToken;
        let g = this.handleGet;
        post.onreadystatechange = function() {
            console.log(1111);
            if (this.readyState === 4 && this.status === 200) {
                let j = JSON.parse(this.responseText);
                //if (j['accept'] === true) {
                    //p.history.push("/Fingerprint");
                const login = document.querySelector("#login");
                Fingerprint2.get(function (components) {
                    let details = "";
                    for (let index in components) {
                        let obj = components[index];
                        let line = obj.key + " = " + String(obj.value).substr(0, 10000);
                        details += line + "\n"
                    }
                    const p = document.createElement("pre");
                    p.textContent = details;
                    login.firstElementChild.replaceWith(p);
                });
                //call handleget here
                g();
            } else if (this.readyState === 4 && this.status === 442) {
                const login = document.querySelector("#login");
                const form = document.createElement("form");
                const tokenfield = document.createElement("div");
                tokenfield.id = "token";
                tokenfield.className = "form-group form-group-lg";
                const label = document.createElement("label");
                label.appendChild(document.createTextNode("Enter Token"));
                label.for = "token";
                label.className = "control-Label";
                const input = document.createElement("input");
                input.type = "text";
                input.id = "token1";
                input.className = "form-control";
                tokenfield.appendChild(label);
                tokenfield.appendChild(input);

                form.onsubmit = t;
                form.appendChild(tokenfield);

                login.firstElementChild.removeChild(login.firstElementChild.children[1]);
                login.firstElementChild.removeChild(login.firstElementChild.children[0]);
                form.appendChild(login.firstElementChild.childNodes[0]);
                login.firstElementChild.replaceWith(form);
                //login.firstElementChild.children[0].firstElementChild.textContent = "Enter Token";

                //login.firstElementChild.children[0].children[1].type = "text"

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
                    fingerprintlst = components;
                } catch (e) {
                    p.history.push("/Error");
                }
            }
        );	
    };
    handleToken = event => {
        event.preventDefault();
        const post = new XMLHttpRequest();
        post.open("POST", "http://localhost:3001/auth/login", false);
        post.setRequestHeader('Content-Type', 'application/json');
        let p = this.props;
        const password = this.state.password;
        const username = this.state.email;
        let g = this.handleGet;
        post.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 240) {
                let j = JSON.parse(this.responseText);
               // if (j['accept'] === true) {
                Fingerprint2.get(function (components) {
                    const login = document.querySelector("#login");
                    let details = "";
                    for (let index in components) {
                        let obj = components[index];
                        let line = obj.key + " = " + String(obj.value).substr(0, 10000);
                        details += line + "\n"
                    }
                    const p = document.createElement("pre");
                    p.textContent = details;
                    login.firstElementChild.replaceWith(p);
                });
               // }
            } else {
                p.history.push("/Error");
            }
            g();
        };
        const token1 = document.querySelector("#token1").value;
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
                        username: username,
                        password: password,
                        device_type: "WEB",
                        token: token1,
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
            <div className="Login" id="login">
                <form onSubmit={this.handleSubmit}>
                    <FormGroup controlId="email" bsSize="large" id="email">
                        <ControlLabel>Email</ControlLabel>
                        <FormControl
                            autoFocus
                            type="email"
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                    </FormGroup>
                    <FormGroup controlId="password" bsSize="large" id="password">
                        <ControlLabel>Password</ControlLabel>
                        <FormControl
                            value={this.state.password}
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
                        Login
                    </Button>
                </form>
            </div>
        );
    }
}