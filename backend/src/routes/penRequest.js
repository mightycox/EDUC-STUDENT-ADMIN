const passport = require('passport');
const express = require('express');
const router = express.Router();
const auth = require('../components/auth');
const utils = require('../components/utils');
const { completePenRequest, getAllPenRequests, getMacros, getPenRequestById, getPenRequestCommentById, putPenRequest, rejectPenRequest, returnPenRequest,findPenRequestsByPen } = require('../components/penRequests');
const { getDocuments, getDocumentById, updateDocumentTypeById } = require('../components/documents');

/**
 * Gets all the comments for a pen request by pen request id
 */
router.get('/:id/comments', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getPenRequestCommentById);

/**
 * Updates a pen retrieval request
 * */
router.put('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, utils.verifyPenRequestInSession, putPenRequest);

/*
 * Get all pen retrieval requests
 */
router.get('/', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getAllPenRequests);

/*
 * Get all pen retrieval requests for a given pen number in the query parameter.
 */
router.get('/duplicatePenRequests', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, findPenRequestsByPen);

router.get('/macros', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, utils.cacheMiddleware(), getMacros);

/*
 * Get a pen request by id
 */
router.get('/:id', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getPenRequestById);

router.post('/complete', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, utils.verifyPenRequestInSession, completePenRequest);

router.post('/reject', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, utils.verifyPenRequestInSession, rejectPenRequest);

router.post('/:id/return', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, utils.verifyPenRequestInSession, returnPenRequest);

// retrieve all the documents.
router.get('/:id/documents', passport.authenticate('jwt', {session: false}, undefined), auth.isValidUserToken, getDocuments);

// retrieve the document by its id.
router.get('/:id/documents/:documentId', auth.isValidUserToken, getDocumentById);

// Updates the type of a document by its id.
router.put('/:id/documents/:documentId', passport.authenticate('jwt', {session: false}, undefined), auth.isValidAdminToken, updateDocumentTypeById);

module.exports = router;
