var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/home', function(req, res, next){
  res.sendFile('views/title.html', {root:'./'});
});

router.get('/aging-demographics', function(req, res, next){
  res.sendFile('views/index.html', {root:'./'});
});

router.get('/block-groups', function(req, res, next){
    res.render('block-groups', {title: 'Block Groups'});
})
module.exports = router;
