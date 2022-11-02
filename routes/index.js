var express = require('express');
var router = express.Router();

var dataBike = [
  {name:"BIK045", url:"/images/bike1.png", price:679},
  {name:"ZOOK07", url:"/images/bike2.png", price:999},
  {name:"TITANS", url:"/images/bike3.png", price:799},
  {name:"CEWO", url:"/images/bike4.png", price:1300},
  {name:"AMIG039", url:"/images/bike5.png", price:479},
  {name:"LIK099", url:"/images/bike6.png", price:869},
]

 // {name:"BIK045", url:"/images/bike1.png", price:679, quantity:1},
 // {name:"ZOOK07", url:"/images/bike2.png", price:999, quantity:2},


/* GET home page. */
router.get('/home', function(req, res, next) {
  
  if (!req.session.dataCardBike) {
    req.session.dataCardBike = []
    console.log("huhvouvogv")
  } 
  res.render('index', {dataBike:dataBike});
});


/* Ajout d'un vélo dans le panier depuis la page home*/
router.get('/shop', function(req, res, next) {

  var alreadyExist = false;

  for(var i = 0; i< req.session.dataCardBike.length; i++){
    if(req.session.dataCardBike[i].name == req.query.bikeNameFromFront){
      req.session.dataCardBike[i].quantity = Number(req.session.dataCardBike[i].quantity) + 1;
      alreadyExist = true;
    }
  }

  if(alreadyExist == false){
    req.session.dataCardBike.push({
      name: req.query.bikeNameFromFront,
      url: req.query.bikeImageFromFront,
      price: Number(req.query.bikePriceFromFront)+30,
      quantity: 1
    })
  }

        res.render('shop', {dataCardBike: req.session.dataCardBike});
    });


/* Suppression d'un vélo du panier dans la page shop */

router.get('/delete-shop', function(req, res, next){
  
  req.session.dataCardBike.splice(req.query.position,1)

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})

//mise à jour de la quantité de vélo acheté

router.post('/update-shop', function(req, res, next){
  
  var position = req.body.position;
  var newQuantity = req.body.quantity;


  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})

// This is your test secret API key.
const Stripe = require('stripe');
const stripe = Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

router.post('/create-checkout-session', async (req, res) => {
  

    let items = []

    for (let i = 0; i < req.session.dataCardBike.length; i++) {
      items.push(
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: req.session.dataCardBike[i].name,
            },
            unit_amount: req.session.dataCardBike[i].price* 100,
          },
          quantity: req.session.dataCardBike[i].quantity,
        },
      )
    }
    const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    
    line_items: items,
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });
 
  res.redirect(303, session.url);
 });



//Success
router.get('/success', (req, res) => { //ou '/cancel'
  res.render('success'); //ou 'cancel'
 });

 router.get('/cancel', (req, res) => { //ou '/cancel'
  res.render('cancel'); //ou 'cancel'
 });




module.exports = router;