import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";

class Header extends Component {
    render() {
        const { userInfo } = this.props;
        return (
            //
            <div>
                <Typography variant="display1">
                    Bienvenido {userInfo.firstName}
                </Typography>
            </div>
        );
    }
}

export default Header;
