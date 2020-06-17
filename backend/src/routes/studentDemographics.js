const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const { getStudentDemographicsById } = require('../components/requests');


router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidGMPAdmin, getStudentDemographicsById);

module.exports = router;
