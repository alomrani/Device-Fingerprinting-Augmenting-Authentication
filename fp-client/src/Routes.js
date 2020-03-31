import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Login";
import Error from "./containers/Error";
import SignUp from "./containers/SignUp"
export default () =>
    <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/signup" component={SignUp} />
        <Route path="/error" component={Error} />
    </Switch>;