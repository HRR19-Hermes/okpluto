'use strict';

import userServices from '../services/userServices.js'
import NavLoggedIn from './nav-loggedIn.jsx';
import React, { PropTypes as T } from 'react';
import AuthService from '../utils/AuthService.jsx';
import Auth0Lock from '../../node_modules/auth0-lock';
import ProfileDisplay from './profileDisplay.jsx';
import Events from './events.jsx'

class Profile extends React.Component {
  constructor(props) {
    super(props);
    console.log(props)
  }



  render () {
    return (
      <div>
        <NavLoggedIn auth={this.props.auth} toggleDrawer={this.props.toggleDrawer}/>
        <div className="container">
        <div className="col-md-3">
          <ProfileDisplay userInfo={this.props.userInfo} resetUserInfo={this.props.resetUserInfo}/>
        </div>
        <div className="col-md-9">Other Stuff</div>
        </div>
      </div>
    )
  }
}

Profile.propTypes = {
  location: T.object,
  auth: T.instanceOf(AuthService)
};

module.exports = Profile;