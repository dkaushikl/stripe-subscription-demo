require('dotenv').config();

var express = require('express'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	cors = require('cors'),
	app = express();

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;

var router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(methodOverride());

var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/charge', function (req, res) {
	var newCharge = {
		amount: 23500,
		currency: "usd",
		source: req.body.token_from_stripe,
		description: req.body.specialNote,
		receipt_email: req.body.email,
		shipping: {
			name: req.body.name,
			address: {
				line1: req.body.address.street,
				city: req.body.address.city,
				state: req.body.address.state,
				postal_code: req.body.address.zip,
				country: 'US'
			}
		}
	};
	stripe.charges.create(newCharge, function (err, charge) {
		if (err) {
			console.error(err);
			res.json({ error: err, charge: false });
		} else {
			res.json({ error: false, charge: charge });
		}
	});
});

router.get('/charge/:id', function (req, res) {
	stripe.charges.retrieve(req.params.id, function (err, charge) {
		if (err) {
			res.json({ error: err, charge: false });
		} else {
			res.json({ error: false, charge: charge });
		}
	});
});

router.get('/create-price-type', function (req, res) {
	const data = { name: 'Monthly rental', type: 'service' };
	stripe.products.create(data, function (result, result1) {
		res.json(result);
	});
});

router.get('/create-price-plan', function (req, res) {
	const data = {
		nickname: "Standard Monthly",
		product: "prod_Ep6UGNlUGkoG4Q",
		amount: 10000,
		currency: "usd",
		interval: "month",
		usage_type: "licensed",
	};
	stripe.plans.create(data, function (err, plan) {
		res.json(plan);
	});
});

router.get('/create-subscription', function (req, res) {
	const data = {
		customer: "cus_Ep5tDo1eG7y4EG",
		items: [{
			plan: "plan_Ep6Yk8iDsT8pqg",
			quantity: 1,
		},
		]
	}
	stripe.subscriptions.create(data, function (err, subscription) {
		res.json(subscription);
	});
});

router.get('/create-customer', function (req, res) {
	const data = {
		description: 'Customer for dhameliyakaushik13@gmail.com',
		email: "dhameliyakaushik13@gmail.com"
	};
	stripe.customers.create(data, function (err, customer) {
		res.json(customer);
	});
});

router.get('/create-card', function (req, res) {
	const data = { source: 'tok_1ELT4EDV8Oe9DUI29jvZiurh' };
	stripe.customers.createSource('cus_Ep6sh1E59cnf9R', data, function (err, card) {
		console.log(err);
		res.json(card);
	});
});

router.get('/get-customer-card', function (req, res) {
	stripe.customers.listCards('cus_Ep5tDo1eG7y4EG', function (err, cards) {
		console.log(err);
		res.json(cards);
	});
});

router.get('/retrive-customer', async function (req, res) {
	const customers = await stripe.customers.retrieve('cus_EpRVojJS4IqLUa')
	res.json(customers);
});

router.get('/retrive-customer-card', async function (req, res) {
	await stripe.customers.listCards('cus_EpRVojJS4IqLUa', function (err, result) {
		const customers = result.data;
		const data = customers.map(x => {
			return {
				brand: x.brand,
				country: x.country,
				cvc_check: x.cvc_check,
				last4: x.last4,
				exp_month: x.exp_month,
				exp_year: x.exp_year
			}
		});
		res.json(customers);
	});
});

router.get('/default-key', function (req, res) {
	stripe.customers.retrieve('cus_Ep6sh1E59cnf9R', function (err, cards) {
		res.json(cards);
	});
});

router.get('/update-card-default', function (req, res) {
	const data = {
		'default_source': 'card_1ELT4EDV8Oe9DUI2HNUxg9oC'
	}
	stripe.customers.update('cus_Ep6sh1E59cnf9R', data, function (err, customer) {
		1
		res.json(customer);
	});
});

app.use('/', router);

app.listen(port, function () {
	console.log('Server listening on port ' + port)
});

// cus_Ep6sh1E59cnf9R
// sub_Ep6g5QYZl8K37N
// plan_Ep6Yk8iDsT8pqg
// prod_Ep6UGNlUGkoG4Q
// card_1ELSu6DV8Oe9DUI23Uvt81ip