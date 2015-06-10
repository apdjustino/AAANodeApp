var express = require('express');
var router = express.Router();
var pg = require('pg');
var conString = "postgres://postgres:postgres@localhost/postgres"

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
});

router.get('/block-groups-gis', function(req, res, next){
   res.sendFile('public/views/block-groups-gis.html', {root: './'});
});

router.get('/races', function(req, res, next){
    pg.connect(conString, function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select distinct race from demographics order by race', function(err,result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            var out = result.rows;
            res.send(out);
        });
    });
});

router.get('/age-sex-grp', function(req, res, next){
    pg.connect(conString, function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select distinct age_sex_grp from demographics order by age_sex_grp', function(err,result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            var out = result.rows;
            res.send(out);
        });
    });
});

router.get('/age-grp', function(req, res, next){
    pg.connect(conString, function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select distinct age_grp from income order by age_grp', function(err,result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            var out = result.rows;
            res.send(out);
        });
    });
});

router.get('/income-grp', function(req, res, next){
    pg.connect(conString, function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('select distinct income_grp from income order by income_grp', function(err,result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            var out = result.rows;
            res.send(out);
        });
    });
});


router.post('/query-demographics', function(req, res, next){
    pg.connect(conString, function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }

        //needs this funky & hackish code because node.js pg has difficulty with arrays passed as parameters
        //also want to get the postgres parameterized escaping (for security and best practices)
        var raceArr = req.body.race;
        var ageArr = req.body.ageGrp;

        var params1 = [];
        var params2 = [];
        for(var i= 1; i<=raceArr.length; i++){
            params1.push('$' + i);
        }

        for(var j= params1.length + 1; j<= ageArr.length + params1.length; j++){
            params2.push('$' + j);
        }

        var raceAge = raceArr.concat(ageArr);

        var queryText = 'SELECT blk_grps."GEOid2", blk_grps.county, sum(value) as "grp_tot", tot_dem, tot_inc, sum(value)/nullif(tot_dem,0) as "pct" ' +
            'from blk_grps, demographics where blk_grps."GEOid2" = demographics."GEOid2" AND race IN(' + params1.join(',') +
            ') AND age_sex_grp IN(' + params2.join(',') + ') GROUP BY blk_grps."GEOid2", blk_grps.county, tot_dem, tot_inc';

        client.query(queryText,raceAge,
            function(err,result){
            done();
            if(err){
                return console.error('error running query', err);
            }
            var out = result.rows;
            res.send(out);
        });
    });
})

router.post('/query-income', function(req, res, next){
    pg.connect(conString, function(err, client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }

        //needs this funky & hackish code because node.js pg has difficulty with arrays passed as parameters
        //also want to get the postgres parameterized escaping (for security and best practices)
        var raceArr = req.body.race;
        var ageArr = req.body.ageGrp;

        var params1 = [];
        var params2 = [];
        for(var i= 1; i<=raceArr.length; i++){
            params1.push('$' + i);
        }

        for(var j= params1.length + 1; j<= ageArr.length + params1.length; j++){
            params2.push('$' + j);
        }

        var raceAge = raceArr.concat(ageArr);

        var queryText = 'SELECT blk_grps."GEOid2", blk_grps.county, sum(value) as "grp_tot", tot_dem, tot_inc, sum(value)/nullif(tot_inc,0) as "pct" ' +
            'from blk_grps, income where blk_grps."GEOid2" = income."GEOid2" AND income_grp IN(' + params1.join(',') +
            ') AND age_grp IN(' + params2.join(',') + ') GROUP BY blk_grps."GEOid2", blk_grps.county, tot_dem, tot_inc';

        client.query(queryText,raceAge,
            function(err,result){
                done();
                if(err){
                    return console.error('error running query', err);
                }
                var out = result.rows;
                res.send(out);
            });
    });
})




module.exports = router;
