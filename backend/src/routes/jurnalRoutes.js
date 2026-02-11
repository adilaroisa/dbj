const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const jurnalController = require('../controllers/jurnalController');

const upload = multer({ dest: 'uploads/' });

router.get('/', jurnalController.getAllJurnals);
router.post('/', auth, jurnalController.createJurnal);
router.put('/:id', auth, jurnalController.updateJurnal);
router.delete('/:id', auth, jurnalController.deleteJurnal);

router.post('/import', auth, upload.single('file'), jurnalController.importExcel);
router.patch('/:id/sync-sinta', auth, jurnalController.syncSinta);

module.exports = router;