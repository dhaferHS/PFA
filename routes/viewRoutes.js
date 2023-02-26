const express = require('express');
const viewController = require('../controllers/viewsController');

const router = express.Router();

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     title: 'Exciting tours for adventurous people',
//   });
// });

router.get('/', viewController.getOverview);

router.get('/tour/:slug', viewController.getTour);

module.exports = router;
