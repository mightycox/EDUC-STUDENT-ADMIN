'use strict';

const config =require('../config/index');
const passport = require('passport');
const express = require('express');
const log = require('npmlog');
const auth = require('../components/auth');
const jsonwebtoken = require('jsonwebtoken');

const {
  body,
  validationResult
} = require('express-validator');

const router = express.Router();

//provides a callback location for the auth service
router.get('/callback', function(req,res,next){
      log.info(`CALLBACK PID IS::${process.pid}`);
      log.silly(`session id is ${JSON.stringify(req.sessionID)}`);
      log.silly(`session is ${JSON.stringify(req.session)}`);
      next();
    },
  passport.authenticate('oidc', {
    failureRedirect: 'error',
  }),
  (_req, res) => {
    res.redirect(config.get('server:frontend'));
  }
);

//a prettier way to handle errors
router.get('/error', (_req, res) => {
  log.silly(`req is ${JSON.stringify(_req.session)}`);
  if(res.data){
    log.silly(`res data is ${JSON.stringify(res.data)}`);
  }
  log.silly(`res status code is ::  ${res.statusCode} , status message is :: ${res.statusMessage} , status Text is :: ${res.statusText}`);
  res.status(401).json({
    message: 'Error: Unable to authenticate'
  });
});

//redirects to the SSO login screen
router.get('/login', (req,res,next) =>{
  log.info(`LOGIN PID IS::${process.pid}`);
  next();
}, passport.authenticate('oidc', {
  failureRedirect: 'error'
},function (err,user,info) {
  if (err) {
    log.debug(err);
    return next(err);
  }

  log.info(user);
  log.info(info);
  next(user);
}));

//removes tokens and destroys session
router.get('/logout', async (req, res) => {
  if(req.user && req.user.jwt){
    const token = req.user.jwt;
    req.logout();
    req.session.destroy();
    let siteMinderRetUrl;
    if(req.query.sessionExpired){
      siteMinderRetUrl = encodeURIComponent(config.get('logoutEndpoint') + '?id_token_hint=' + token + '&post_logout_redirect_uri=' + config.get('server:frontend')+'/session-expired');
    }else {
      siteMinderRetUrl = encodeURIComponent(config.get('logoutEndpoint') + '?id_token_hint=' + token + '&post_logout_redirect_uri=' + config.get('server:frontend')+'/logout');
    }
    const siteMinderLogoutUrl = config.get('siteMinder_logout_endpoint');
    res.redirect(`${siteMinderLogoutUrl}${siteMinderRetUrl}`);

  } else {
    if(req.user){
      const refresh = await auth.renew(req.user.refreshToken);
      req.logout();
      req.session.destroy();
      let siteMinderRetUrl;
      if(req.query.sessionExpired){
        siteMinderRetUrl = encodeURIComponent(config.get('logoutEndpoint') + '?id_token_hint=' + refresh.jwt + '&post_logout_redirect_uri=' + config.get('server:frontend')+'/session-expired');
      }else {
        siteMinderRetUrl = encodeURIComponent(config.get('logoutEndpoint') + '?id_token_hint=' + refresh.jwt + '&post_logout_redirect_uri=' + config.get('server:frontend')+'/logout');
      }
      const siteMinderLogoutUrl = config.get('siteMinder_logout_endpoint');
      res.redirect(`${siteMinderLogoutUrl}${siteMinderRetUrl}`);
    } else{
      req.logout();
      req.session.destroy();
      if(req.query.sessionExpired){
        res.redirect(config.get('server:frontend')+'/session-expired');
      }else {
        res.redirect( config.get('server:frontend')+'/logout');
      }
    }
  }
});

//refreshes jwt on refresh if refreshToken is valid
router.post('/refresh', [
  body('refreshToken').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }


  let isAdminUser = auth.isAdminUser(req);
  if(!req['user'] || !req['user'].refreshToken){
    res.status(401).json();
  } else{
    const newTokens = await auth.renew(req['user'].refreshToken);
    req['user'].jwt = newTokens.jwt;
    req['user'].refreshToken = newTokens.refreshToken;
    if(req['user']){
      const newUiToken = auth.generateUiToken();
      const responseJson = {
        jwtFrontend: newUiToken,
        isAdminUser: isAdminUser
      };
      return res.status(200).json(responseJson);
    } else {
      res.status(401).json();
    }
  }
});

//provides a jwt to authenticated users
router.get('/token', auth.refreshJWT, (req, res) => {

  let isAdminUser = auth.isAdminUser(req);
  if (req['user'] && req['user'].jwtFrontend && req['user'].refreshToken) {
    const responseJson = {
      jwtFrontend: req['user'].jwtFrontend,
      isAdminUser : isAdminUser
    };
    res.status(200).json(responseJson);
  } else {
    res.status(401).json({
      message: 'Not logged in'
    });
  }
});

router.get('/user',  passport.authenticate('jwt', {session: false}), (req, res) => {
  const thisSession = req['session'];
  const userToken = jsonwebtoken.verify(thisSession['passport'].user.jwt, config.get('oidc:publicKey'));
  const userName = {
    userName: userToken['idir_username'],
    userGuid: userToken.preferred_username.toUpperCase()
  };

  if(userName.userName && userName.userGuid) {
    return res.status(200).json(userName);
  }
  else {
    return res.status(500);
  }

});

module.exports = router;
